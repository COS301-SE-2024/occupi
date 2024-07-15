package tests

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
)

func TestMockDatabase(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, models.New(db, cache))

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/resource-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	/*
		Expected response body:
		{
			"data": [], -> array of data
			"message": "Successfully fetched resource!", -> message
			"status": 200 -> status code
	*/
	// check that the data length is greater than 0 after converting the response body to a map
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("could not unmarshal response: %v", err)
	}

	// check that the data length is greater than 0
	data := response["data"].([]interface{})
	assert.Greater(t, len(data), 0)
}

func TestGetAllData(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	// Define the mock responses
	onSiteTrueDocs := []bson.D{
		{{Key: "onSite", Value: true}, {Key: "name", Value: "User1"}},
		{{Key: "onSite", Value: true}, {Key: "name", Value: "User2"}},
	}

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		users := database.GetAllData(ctx, models.New(nil, nil))

		// Validate the result
		assert.Nil(t, users)
	})

	mt.Run("Find onSite true users", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, onSiteTrueDocs...))

		// Call the function under test
		users := database.GetAllData(ctx, models.New(mt.Client, nil))

		// Validate the result
		expected := []bson.M{
			{"onSite": true, "name": "User1"},
			{"onSite": true, "name": "User2"},
		}

		assert.Equal(t, expected, users)
	})
}

func TestEmailExists(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		exists := database.EmailExists(ctx, models.New(nil, nil), email)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Email exists", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.True(t, exists)
	})

	mt.Run("Email exists adding to cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		cache := configs.CreateCache()

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, cache), email)

		// Validate the result
		assert.True(t, exists)

		// Check if the email exists in the cache
		email, err := cache.Get(email)
		assert.NoError(t, err)
		assert.NotNil(t, email)
	})

	mt.Run("Email does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch))

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.False(t, exists)
	})
}

func TestAddUser(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	user := models.RegisterUser{
		EmployeeID: "12345",
		Password:   "password123",
		Email:      "test@example.com",
	}

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		success, err := database.AddUser(ctx, models.New(nil, nil), user)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Add user successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.AddUser(ctx, models.New(mt.Client, nil), user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Add user successfully to cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		// Call the function under test
		success, err := database.AddUser(ctx, models.New(mt.Client, cache), user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the user was added to the cache
		user, err := cache.Get(user.Email)

		assert.Nil(t, err)
		assert.NotNil(t, user)
	})

	mt.Run("InsertOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		// Call the function under test
		success, err := database.AddUser(ctx, models.New(mt.Client, nil), user)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestOTPExists(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	otp := "123456"
	expiredOTP := time.Now().Add(-1 * time.Hour)
	validOTP := time.Now().Add(1 * time.Hour)

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(nil, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, exists)
	})

	mt.Run("OTP exists and is valid", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "otp", Value: otp},
			{Key: "expireWhen", Value: validOTP},
		}))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	mt.Run("OTP exists and is valid in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: validOTP,
		}

		// add otp to cache
		if otpData, err := bson.Marshal(otpStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email+otp, otpData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the otp is in the cache
		otpA, err := cache.Get(email + otp)

		assert.Nil(t, err)
		assert.NotNil(t, otpA)

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, cache), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	mt.Run("OTP exists but is expired", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "otp", Value: otp},
			{Key: "expireWhen", Value: expiredOTP},
		}))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	mt.Run("OTP exists but is expired in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: expiredOTP,
		}

		// add otp to cache
		if otpData, err := bson.Marshal(otpStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email+otp, otpData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the otp is in the cache
		otpA, err := cache.Get(email + otp)

		assert.Nil(t, err)
		assert.NotNil(t, otpA)

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, cache), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	mt.Run("OTP does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, exists)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, exists)
	})
}

func TestAddOTP(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	otp := "123456"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		success, err := database.AddOTP(ctx, models.New(nil, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Add OTP successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.AddOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the inserted document
	})

	mt.Run("Add OTP successfully to cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		// Call the function under test
		success, err := database.AddOTP(ctx, models.New(mt.Client, cache), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the otp was added to the cache
		otp, err := cache.Get(email + otp)

		assert.Nil(t, err)
		assert.NotNil(t, otp)
	})

	mt.Run("InsertOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		// Call the function under test
		success, err := database.AddOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestDeleteOTP(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	otp := "123456"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		success, err := database.DeleteOTP(ctx, models.New(nil, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Delete OTP successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.DeleteOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the deletion
	})

	mt.Run("DeleteOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "delete error",
		}))

		// Call the function under test
		success, err := database.DeleteOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestVerifyUser(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(nil, nil), email, ctx.ClientIP())

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Verify user successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
			{Key: "nextVerificationDate", Value: time.Now().Add(-1 * time.Hour)},
		}))

		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(mt.Client, nil), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("Verify user successfully and user is not in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
			{Key: "nextVerificationDate", Value: time.Now().Add(-1 * time.Hour)},
		}))

		cache := configs.CreateCache()

		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(mt.Client, cache), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("Verify user successfully and user is in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
			{Key: "nextVerificationDate", Value: time.Now().Add(-1 * time.Hour)},
		}))

		cache := configs.CreateCache()

		userStruct := models.User{
			Email:                email,
			IsVerified:           false,
			NextVerificationDate: time.Now().Add(-1 * time.Hour),
		}

		// add user to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the cache
		userA, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(mt.Client, cache), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in cache
		user, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.True(t, userB.IsVerified)
		assert.Equal(t, models.Location{
			City:    "Cape Town",
			Region:  "Western Cape",
			Country: "South Africa",
		}, userB.KnownLocations[0])
	})

	mt.Run("UpdateOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(mt.Client, nil), email, ctx.ClientIP())

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestGetPassword(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	password := "hashedpassword123"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		pass, err := database.GetPassword(ctx, models.New(nil, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.Equal(t, "", pass)
	})

	mt.Run("Get password successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "password", Value: password},
		}))

		// Call the function under test
		pass, err := database.GetPassword(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.Equal(t, password, pass)
	})

	mt.Run("Get password successfully from cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email:    email,
			Password: password,
		}

		// Add password to cache
		if passData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, passData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the cache
		pass, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, pass)

		// Call the function under test
		passwordv, err := database.GetPassword(ctx, models.New(mt.Client, cache), email)

		// Validate the result
		assert.NoError(t, err)
		assert.Equal(t, password, passwordv)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		pass, err := database.GetPassword(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.Equal(t, "", pass)
	})
}

func TestCheckIfUserIsVerified(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(nil, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isVerified)
	})

	mt.Run("User is verified", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: true},
		}))

		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isVerified)
	})

	mt.Run("User is not verified", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
		}))

		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isVerified)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isVerified)
	})
}

func TestUpdateVerificationStatusTo(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		success, err := database.UpdateVerificationStatusTo(ctx, models.New(nil, nil), email, true)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Update verification status successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.UpdateVerificationStatusTo(ctx, models.New(mt.Client, nil), email, true)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("UpdateOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Call the function under test
		success, err := database.UpdateVerificationStatusTo(ctx, models.New(mt.Client, nil), email, true)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestCheckIfUserIsAdmin(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(nil, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isAdmin)
	})

	mt.Run("User is admin", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "role", Value: constants.Admin},
		}))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isAdmin)
	})

	mt.Run("User is admin in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email: email,
			Role:  constants.Admin,
		}

		// Add user to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the cache
		user, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, cache), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isAdmin)
	})

	mt.Run("User is not admin", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "role", Value: constants.Basic},
		}))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isAdmin)
	})

	mt.Run("User is not admin in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email: email,
			Role:  constants.Basic,
		}

		// Add user to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the cache
		user, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, cache), email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isAdmin)

		// Verify the user was not updated in the cache
		user, err = cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isAdmin)
	})
}

// Test AddResetToken
func TestAddResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("success", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		email := "test@example.com"
		resetToken := "token123"
		expirationTime := time.Now().Add(1 * time.Hour)

		success, err := database.AddResetToken(context.Background(), mt.Client, email, resetToken, expirationTime)

		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		email := "test@example.com"
		resetToken := "token123"
		expirationTime := time.Now().Add(1 * time.Hour)

		success, err := database.AddResetToken(context.Background(), mt.Client, email, resetToken, expirationTime)

		assert.Error(t, err)
		assert.False(t, success)
	})
}

// Test GetEmailByResetToken
func TestGetEmailByResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("success", func(mt *mtest.T) {
		expectedEmail := "test@example.com"
		resetToken := "token123"

		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".ResetTokens", mtest.FirstBatch, bson.D{
			{Key: "email", Value: expectedEmail},
			{Key: "token", Value: resetToken},
		}))

		email, err := database.GetEmailByResetToken(context.Background(), mt.Client, resetToken)

		assert.NoError(t, err)
		assert.Equal(t, expectedEmail, email)
	})

	mt.Run("not found", func(mt *mtest.T) {
		resetToken := "nonexistenttoken"

		mt.AddMockResponses(mtest.CreateCursorResponse(0, configs.GetMongoDBName()+".ResetTokens", mtest.FirstBatch))

		email, err := database.GetEmailByResetToken(context.Background(), mt.Client, resetToken)

		assert.Error(t, err)
		assert.Equal(t, "", email)
	})
}

// Test CheckResetToken

func TestCheckResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("valid token", func(mt *mtest.T) {
		email := "test@example.com"
		token := "validtoken"
		expireWhen := time.Now().Add(1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".ResetTokens", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: token},
			{Key: "expireWhen", Value: expireWhen},
		}))

		valid, err := database.CheckResetToken(ctx, mt.Client, email, token)

		assert.NoError(t, err)
		assert.True(t, valid)
	})

	mt.Run("expired token", func(mt *mtest.T) {
		email := "test@example.com"
		token := "expiredtoken"
		expireWhen := time.Now().Add(-1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".ResetTokens", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: token},
			{Key: "expireWhen", Value: expireWhen},
		}))

		valid, err := database.CheckResetToken(ctx, mt.Client, email, token)

		assert.NoError(t, err)
		assert.False(t, valid)
	})

	mt.Run("token not found", func(mt *mtest.T) {
		email := "test@example.com"
		token := "nonexistenttoken"

		mt.AddMockResponses(mtest.CreateCursorResponse(0, configs.GetMongoDBName()+".ResetTokens", mtest.FirstBatch))

		valid, err := database.CheckResetToken(ctx, mt.Client, email, token)

		assert.Error(t, err)
		assert.False(t, valid)
	})
}

// Test UpdateUserPassword
func TestUpdateUserPassword(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("success", func(mt *mtest.T) {
		email := "test@example.com"
		newPassword := "newpassword123"

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		success, err := database.UpdateUserPassword(ctx, mt.Client, email, newPassword)

		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"
		newPassword := "newpassword123"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		success, err := database.UpdateUserPassword(ctx, mt.Client, email, newPassword)

		assert.Error(t, err)
		assert.False(t, success)
	})
}

// Test ClearResetToken
func TestClearResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(gin.TestMode)
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("success", func(mt *mtest.T) {
		email := "test@example.com"
		token := "token123"

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		success, err := database.ClearResetToken(ctx, mt.Client, email, token)

		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"
		token := "token123"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "delete error",
		}))

		success, err := database.ClearResetToken(ctx, mt.Client, email, token)

		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestFilterUsersWithProjection(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	tests := []struct {
		name           string
		appSession     *models.AppSession
		filter         primitive.M
		projection     bson.M
		limit          int64
		skip           int64
		mockResponses  []bson.D
		expectedResult []bson.M
		expectedCount  int64
		expectedError  error
	}{
		{
			name: "Database is nil",
			appSession: &models.AppSession{
				DB: nil,
			},
			filter:         primitive.M{"username": "testuser"},
			projection:     bson.M{"username": 1, "email": 1},
			limit:          10,
			skip:           0,
			expectedResult: nil,
			expectedCount:  0,
			expectedError:  errors.New("database is nil"),
		},
		{
			name: "Error in cursor all",
			appSession: &models.AppSession{
				DB: mt.Client,
			},
			filter:         primitive.M{"username": "testuser"},
			projection:     bson.M{"username": 1, "email": 1},
			limit:          10,
			skip:           0,
			mockResponses:  nil,
			expectedResult: nil,
			expectedCount:  0,
			expectedError:  errors.New("database is nil"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mt.Run("mock "+tt.name, func(mt *mtest.T) {
				// Add mock responses
				mt.AddMockResponses(tt.mockResponses...)

				// Setup Gin context
				gin.SetMode(configs.GetGinRunMode())
				ctx, _ := gin.CreateTestContext(nil)

				// Execute the function
				results, count, err := database.FilterUsersWithProjection(ctx, tt.appSession, tt.filter, tt.projection, tt.limit, tt.skip)

				// Validate results
				if !reflect.DeepEqual(results, tt.expectedResult) {
					t.Errorf("FilterUsersWithProjection() got = %v, want %v", results, tt.expectedResult)
				}
				if count != tt.expectedCount {
					t.Errorf("FilterUsersWithProjection() count = %v, want %v", count, tt.expectedCount)
				}
				if err != nil && tt.expectedError != nil && err.Error() != tt.expectedError.Error() {
					t.Errorf("FilterUsersWithProjection() error = %v, want %v", err, tt.expectedError)
				}
				if err != nil && tt.expectedError == nil {
					t.Errorf("FilterUsersWithProjection() unexpected error = %v", err)
				}
			})
		})
	}
}

func TestFilterUsersWithProjectionSuccess(t *testing.T) {
	email := "TestFilterUsersWithProjectionSuccess@example.com"
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, nil)

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")

	filter := primitive.M{"email": email}
	projection := bson.M{"email": 1}
	limit := 10
	skip := 0

	// Create test users
	users := []models.UserDetails{
		{
			Email: email,
		},
		{
			Email: email + ".za",
		},
		{
			Email: email + ".uk",
		},
		{
			Email: email + ".us",
		},
	}

	// Insert test users into the database
	for _, user := range users {
		_, err := collection.InsertOne(ctx, user)

		if err != nil {
			t.Fatalf("Failed to insert test user into database: %v", err)
		}
	}

	// Execute the function
	results, count, err := database.FilterUsersWithProjection(ctx, appSession, filter, projection, int64(limit), int64(skip))

	// Validate results
	if err != nil {
		t.Fatalf("FilterUsersWithProjection() error = %v", err)
	}

	if count != 1 {
		t.Fatalf("FilterUsersWithProjection() count = %v, want %v", count, 1)
	}

	if len(results) != 1 {
		t.Fatalf("FilterUsersWithProjection() results count = %v, want %v", len(results), 1)
	}

	if results[0]["email"] != email {
		t.Fatalf("FilterUsersWithProjection() email = %v, want %v", results[0]["email"], email)
	}
}

func TestCheckIfUserIsLoggingInFromKnownLocation(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(nil, nil), email, ctx.ClientIP())

		// Validate the result
		assert.Error(t, err)
		assert.False(t, yes)
		assert.Nil(t, info)
	})

	mt.Run("Location does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(mt.Client, nil), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, yes)
		assert.NotNil(t, info)
		assert.Equal(t, "Cape Town", info.City)
		assert.Equal(t, "Western Cape", info.Region)
		assert.Equal(t, "South Africa", info.Country)
	})

	mt.Run("Location exists and is valid", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "locations", Value: bson.A{
				bson.D{
					{Key: "city", Value: "Cape Town"},
					{Key: "region", Value: "Western Cape"},
					{Key: "country", Value: "South Africa"},
				},
			}},
		}))

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(mt.Client, nil), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, yes)
		assert.Nil(t, info)
	})

	mt.Run("Location exists but ip address unkwown", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "locations", Value: bson.A{
				bson.D{
					{Key: "city", Value: "Durban"},
					{Key: "region", Value: "KwaZulu-Natal"},
					{Key: "country", Value: "South Africa"},
				},
			}},
		}))

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(mt.Client, nil), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, yes)
		assert.NotNil(t, info)
		assert.Equal(t, "Cape Town", info.City)
		assert.Equal(t, "Western Cape", info.Region)
		assert.Equal(t, "South Africa", info.Country)
	})

	mt.Run("Location exists and is valid in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email: email,
			KnownLocations: []models.Location{
				{
					City:    "Cape Town",
					Region:  "Western Cape",
					Country: "South Africa",
				},
			},
		}

		// add userstruct to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the cache
		userA, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(mt.Client, cache), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, yes)
		assert.Nil(t, info)
	})

	mt.Run("Location exists but does not match what is in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email: email,
			KnownLocations: []models.Location{
				{
					City:    "Durban",
					Region:  "KwaZulu-Natal",
					Country: "South Africa",
				},
			},
		}

		// add userstruct to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the cache
		userA, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(mt.Client, cache), email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, yes)
		assert.NotNil(t, info)
		assert.Equal(t, "Cape Town", info.City)
		assert.Equal(t, "Western Cape", info.Region)
		assert.Equal(t, "South Africa", info.Country)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, models.New(nil, nil), email, ctx.ClientIP())

		// Validate the result
		assert.Error(t, err)
		assert.False(t, yes)
		assert.Nil(t, info)
	})
}

func TestGetUsersPushTokens(t *testing.T) {
	users := []models.User{
		{
			Email:         "TestGetUsersPushTokens1@example.com",
			ExpoPushToken: "b1b2b3b4b5b6b7b8b9b0",
		},
		{
			Email:         "TestGetUsersPushTokens2@example.com",
			ExpoPushToken: "a1a2a3a4a5a6a7a8a9a0",
		},
	}
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, nil)

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")

	// Insert test users into the database
	for _, user := range users {
		_, err := collection.InsertOne(ctx, user)

		if err != nil {
			t.Fatalf("Failed to insert test user into database: %v", err)
		}
	}

	// Test case: Database is nil
	t.Run("Database is nil", func(t *testing.T) {
		emails := []string{"test@example.com"}

		results, err := database.GetUsersPushTokens(ctx, models.New(nil, nil), emails)
		assert.Nil(t, results)
		assert.EqualError(t, err, "database is nil")
	})

	// Test case: Empty emails
	t.Run("Empty emails", func(t *testing.T) {
		emails := []string{}
		results, err := database.GetUsersPushTokens(ctx, appSession, emails)

		assert.Nil(t, results)
		assert.NotNil(t, err)
		assert.EqualError(t, err, "no emails provided")
	})

	// Test case: No matching users
	t.Run("No matching users", func(t *testing.T) {
		emails := []string{"TestGetUsersPushTokens3@example.com"}
		results, err := database.GetUsersPushTokens(ctx, appSession, emails)

		assert.Nil(t, results)
		assert.Nil(t, err)
	})

	// Test case: Successful query with one user
	t.Run("Successful query with one user a", func(t *testing.T) {
		emails := []string{"TestGetUsersPushTokens1@example.com"}
		results, err := database.GetUsersPushTokens(ctx, appSession, emails)

		assert.NoError(t, err)
		assert.Len(t, results, 1)
		assert.Equal(t, users[0].ExpoPushToken, results[0]["expoPushToken"])
	})

	t.Run("Successful query with one user b", func(t *testing.T) {
		emails := []string{"TestGetUsersPushTokens2@example.com"}
		results, err := database.GetUsersPushTokens(ctx, appSession, emails)

		assert.NoError(t, err)
		assert.Len(t, results, 1)
		assert.Equal(t, users[1].ExpoPushToken, results[0]["expoPushToken"])
	})

	// Test case: Successful query with two users
	t.Run("Successful query with two users", func(t *testing.T) {
		emails := []string{"TestGetUsersPushTokens1@example.com", "TestGetUsersPushTokens2@example.com"}
		results, err := database.GetUsersPushTokens(ctx, appSession, emails)

		assert.NoError(t, err)
		assert.Len(t, results, 2)
		assert.Equal(t, users[0].ExpoPushToken, results[0]["expoPushToken"])
		assert.Equal(t, users[1].ExpoPushToken, results[1]["expoPushToken"])
	})
}
