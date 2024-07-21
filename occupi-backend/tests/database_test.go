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

	"github.com/allegro/bigcache/v3"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
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
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// connect to the database
	appsession := &models.AppSession{
		DB:    configs.ConnectToDatabase(constants.AdminDBAccessOption),
		Cache: configs.CreateCache(),
	}

	// creating a new valid session for management of shared variables
	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

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
		appsession := &models.AppSession{}
		users := database.GetAllData(ctx, appsession)

		// Validate the result
		assert.Nil(t, users)
	})

	mt.Run("Find onSite true users", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, onSiteTrueDocs...))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		users := database.GetAllData(ctx, appsession)

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
		appsession := &models.AppSession{}
		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Email exists", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.True(t, exists)
	})

	mt.Run("Email exists adding to cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		exists := database.EmailExists(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists := database.EmailExists(ctx, appsession, email)

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
		appsession := &models.AppSession{}
		success, err := database.AddUser(ctx, appsession, user)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Add user successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddUser(ctx, appsession, user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Add user successfully to cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		success, err := database.AddUser(ctx, appsession, user)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddUser(ctx, appsession, user)

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
		appsession := &models.AppSession{}
		exists, err := database.OTPExists(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists, err := database.OTPExists(ctx, appsession, email, otp)

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		exists, err := database.OTPExists(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists, err := database.OTPExists(ctx, appsession, email, otp)

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		exists, err := database.OTPExists(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	mt.Run("OTP does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists, err := database.OTPExists(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists, err := database.OTPExists(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{}
		success, err := database.AddOTP(ctx, appsession, email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Add OTP successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddOTP(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the inserted document
	})

	mt.Run("Add OTP successfully to cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		success, err := database.AddOTP(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddOTP(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{}
		success, err := database.DeleteOTP(ctx, appsession, email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Delete OTP successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.DeleteOTP(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.DeleteOTP(ctx, appsession, email, otp)

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
		appsession := &models.AppSession{}
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{}
		pass, err := database.GetPassword(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		pass, err := database.GetPassword(ctx, appsession, email)

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		passwordv, err := database.GetPassword(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		pass, err := database.GetPassword(ctx, appsession, email)

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
		appsession := &models.AppSession{}
		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

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
		appsession := &models.AppSession{}
		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, true)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Update verification status successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, true)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("Update verification status successfully in cache to true", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email:      email,
			IsVerified: false,
		}

		// Add password to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the cache
		user, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, true)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in cache
		user, err = cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.True(t, userB.IsVerified)
	})

	mt.Run("Update verification status successfully in cache to false", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache := configs.CreateCache()

		userStruct := models.User{
			Email:      email,
			IsVerified: true,
		}

		// Add password to cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := cache.Set(email, userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the cache
		user, err := cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, false)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in cache
		user, err = cache.Get(email)

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.False(t, userB.IsVerified)
	})

	mt.Run("UpdateOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, true)

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
		appsession := &models.AppSession{}
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isAdmin)
	})
}

// Test AddResetToken
func TestAddResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("success", func(mt *mtest.T) {
		email := "test@example.com"
		resetToken := "resettoken123"
		expirationTime := time.Now().Add(24 * time.Hour)

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		success, err := database.AddResetToken(ctx, mt.Client, email, resetToken, expirationTime)
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"
		resetToken := "resettoken123"
		expirationTime := time.Now().Add(24 * time.Hour)

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "insert error",
		}))

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		success, err := database.AddResetToken(ctx, mt.Client, email, resetToken, expirationTime)
		assert.Error(t, err)
		assert.False(t, success)
	})
}

// Test GetEmailByResetToken
func TestGetEmailByResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("success", func(mt *mtest.T) {
		resetToken := "resettoken123"
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: resetToken},
		}))

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		resultEmail, err := database.GetEmailByResetToken(ctx, mt.Client, resetToken)
		assert.NoError(t, err)
		assert.Equal(t, email, resultEmail)
	})

	mt.Run("error", func(mt *mtest.T) {
		resetToken := "resettoken123"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		resultEmail, err := database.GetEmailByResetToken(ctx, mt.Client, resetToken)
		assert.Error(t, err)
		assert.Empty(t, resultEmail)
	})
}

// Test CheckResetToken

func TestCheckResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("valid token", func(mt *mtest.T) {
		email := "test@example.com"
		token := "resettoken123"
		expirationTime := time.Now().Add(1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: token},
			{Key: "expireWhen", Value: expirationTime},
		}))

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, err := database.CheckResetToken(ctx, mt.Client, email, token)
		assert.NoError(t, err)
		assert.True(t, valid)
	})

	mt.Run("expired token", func(mt *mtest.T) {
		email := "test@example.com"
		token := "resettoken123"
		expirationTime := time.Now().Add(-1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: token},
			{Key: "expireWhen", Value: expirationTime},
		}))

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, err := database.CheckResetToken(ctx, mt.Client, email, token)
		assert.NoError(t, err)
		assert.False(t, valid)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"
		token := "resettoken123"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

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

    mt.Run("success", func(mt *mtest.T) {
        // Create a mock AppSession
        cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10 * time.Minute))
        appSession := models.New(mt.Client, cache)

        email := "test@example.com"
        token := "testtoken"

        mt.AddMockResponses(mtest.CreateSuccessResponse())

        // Create a mock gin.Context
        w := httptest.NewRecorder()
        c, _ := gin.CreateTestContext(w)

        success, err := database.ClearResetToken(c, appSession, email, token)
        assert.NoError(t, err)
        assert.True(t, success)
    })

    mt.Run("error", func(mt *mtest.T) {
        // Create a mock AppSession
        cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10 * time.Minute))
        appSession := models.New(mt.Client, cache)

        email := "test@example.com"
        token := "testtoken"

        mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
            Code:    11000,
            Message: "duplicate key error",
        }))

        // Create a mock gin.Context
        w := httptest.NewRecorder()
        c, _ := gin.CreateTestContext(w)

        success, err := database.ClearResetToken(c, appSession, email, token)
        assert.Error(t, err)
        assert.False(t, success)
    })
}

func TestValidateResetToken(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("valid token", func(mt *mtest.T) {
		email := "test@example.com"
		token := "resettoken123"
		expirationTime := time.Now().Add(1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: token},
			{Key: "expireWhen", Value: expirationTime},
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, message, err := database.ValidateResetToken(ctx, appSession, email, token)
		assert.NoError(t, err)
		assert.True(t, valid)
		assert.Empty(t, message)
	})

	mt.Run("expired token", func(mt *mtest.T) {
		email := "test@example.com"
		token := "resettoken123"
		expirationTime := time.Now().Add(-1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "token", Value: token},
			{Key: "expireWhen", Value: expirationTime},
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, message, err := database.ValidateResetToken(ctx, appSession, email, token)
		assert.NoError(t, err)
		assert.False(t, valid)
		assert.Equal(t, "Token has expired", message)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"
		token := "resettoken123"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, message, err := database.ValidateResetToken(ctx, appSession, email, token)
		assert.Error(t, err)
		assert.False(t, valid)
		assert.Empty(t, message)
	})
}

func TestVerifyTwoFACode(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("valid code", func(mt *mtest.T) {
		email := "test@example.com"
		code := "123456"
		expirationTime := time.Now().Add(1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "twoFACode", Value: code},
			{Key: "twoFACodeExpiry", Value: expirationTime},
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, err := database.VerifyTwoFACode(ctx, appSession, email, code)
		assert.NoError(t, err)
		assert.True(t, valid)
	})

	mt.Run("expired code", func(mt *mtest.T) {
		email := "test@example.com"
		code := "123456"
		expirationTime := time.Now().Add(-1 * time.Hour)

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "twoFACode", Value: code},
			{Key: "twoFACodeExpiry", Value: expirationTime},
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, err := database.VerifyTwoFACode(ctx, appSession, email, code)
		assert.NoError(t, err)
		assert.False(t, valid)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"
		code := "123456"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		valid, err := database.VerifyTwoFACode(ctx, appSession, email, code)
		assert.Error(t, err)
		assert.False(t, valid)
	})
}

func TestIsTwoFAEnabled(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("enabled", func(mt *mtest.T) {
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "twoFAEnabled", Value: true},
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		enabled, err := database.IsTwoFAEnabled(ctx, appSession, email)
		assert.NoError(t, err)
		assert.True(t, enabled)
	})

	mt.Run("disabled", func(mt *mtest.T) {
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateCursorResponse(1, "testdb.testcoll", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "twoFAEnabled", Value: false},
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		enabled, err := database.IsTwoFAEnabled(ctx, appSession, email)
		assert.NoError(t, err)
		assert.False(t, enabled)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		enabled, err := database.IsTwoFAEnabled(ctx, appSession, email)
		assert.Error(t, err)
		assert.False(t, enabled)
	})
}

func TestSetTwoFAEnabled(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("enable 2FA", func(mt *mtest.T) {
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		err := database.SetTwoFAEnabled(ctx, appSession, email, true)
		assert.NoError(t, err)
	})

	mt.Run("disable 2FA", func(mt *mtest.T) {
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		err := database.SetTwoFAEnabled(ctx, appSession, email, false)
		assert.NoError(t, err)
	})

	mt.Run("error", func(mt *mtest.T) {
		email := "test@example.com"

		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
		appSession := models.New(mt.Client, cache)

		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)

		err := database.SetTwoFAEnabled(ctx, appSession, email, true)
		assert.Error(t, err)
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

				filter := models.FilterStruct{
					Filter:     tt.filter,
					Projection: tt.projection,
					Limit:      tt.limit,
					Skip:       tt.skip,
				}

				// Execute the function
				results, count, err := database.FilterCollectionWithProjection(ctx, tt.appSession, "Users", filter)

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
	appSession := &models.AppSession{
		DB: db,
	}

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

	filter_arg := models.FilterStruct{
		Filter:     filter,
		Projection: projection,
		Limit:      int64(limit),
		Skip:       int64(skip),
	}

	// Execute the function
	results, count, err := database.FilterCollectionWithProjection(ctx, appSession, "Users", filter_arg)

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

func TestFilterUsersWithProjectionAndSortAscSuccess(t *testing.T) {
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := &models.AppSession{
		DB: db,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")

	filter := primitive.M{
		"email": primitive.Regex{
			Pattern: "^" + "TestFilterUsersWithProjectionAndSortAscSuccess", // "^" ensures the pattern matches the beginning of the string
			Options: "i",                                                    // "i" makes the regex case-insensitive (optional)
		},
	}
	projection := bson.M{"email": 1}
	limit := 10
	skip := 0
	sort := bson.M{"email": 1}

	// Create test users
	users := []models.UserDetails{
		{
			Email: "TestFilterUsersWithProjectionAndSortAscSuccess3@example.com",
		},
		{
			Email: "TestFilterUsersWithProjectionAndSortAscSuccess2@example.com",
		},
		{
			Email: "TestFilterUsersWithProjectionAndSortAscSuccess1@example.com",
		},
		{
			Email: "TestFilterUsersWithProjectionAndSortAscSuccess4@example.com",
		},
	}

	// Insert test users into the database
	for _, user := range users {
		_, err := collection.InsertOne(ctx, user)

		if err != nil {
			t.Fatalf("Failed to insert test user into database: %v", err)
		}
	}

	filter_arg := models.FilterStruct{
		Filter:     filter,
		Projection: projection,
		Limit:      int64(limit),
		Skip:       int64(skip),
		Sort:       sort,
	}

	// Execute the function
	results, count, err := database.FilterCollectionWithProjection(ctx, appSession, "Users", filter_arg)

	// Validate results
	if err != nil {
		t.Fatalf("FilterUsersWithProjection() error = %v", err)
	}

	if count != 4 {
		t.Fatalf("FilterUsersWithProjection() count = %v, want %v", count, 1)
	}

	if len(results) != 4 {
		t.Fatalf("FilterUsersWithProjection() results count = %v, want %v", len(results), 1)
	}

	if results[0]["email"] != "TestFilterUsersWithProjectionAndSortAscSuccess1@example.com" {
		t.Fatalf("FilterUsersWithProjection() email = %v, want %v", results[0]["email"], "TestFilterUsersWithProjectionAndSortAscSuccess1@example.com")
	}
}

func TestFilterUsersWithProjectionAndSortDescSuccess(t *testing.T) {
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := &models.AppSession{
		DB: db,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")

	filter := primitive.M{
		"email": primitive.Regex{
			Pattern: "^" + "TestFilterUsersWithProjectionAndSortDescSuccess", // "^" ensures the pattern matches the beginning of the string
			Options: "i",                                                     // "i" makes the regex case-insensitive (optional)
		},
	}
	projection := bson.M{"email": 1}
	limit := 10
	skip := 0
	sort := bson.M{"email": -1}

	// Create test users
	users := []models.UserDetails{
		{
			Email: "TestFilterUsersWithProjectionAndSortDescSuccess3@example.com",
		},
		{
			Email: "TestFilterUsersWithProjectionAndSortDescSuccess2@example.com",
		},
		{
			Email: "TestFilterUsersWithProjectionAndSortDescSuccess1@example.com",
		},
		{
			Email: "TestFilterUsersWithProjectionAndSortDescSuccess4@example.com",
		},
	}

	// Insert test users into the database
	for _, user := range users {
		_, err := collection.InsertOne(ctx, user)

		if err != nil {
			t.Fatalf("Failed to insert test user into database: %v", err)
		}
	}

	filter_arg := models.FilterStruct{
		Filter:     filter,
		Projection: projection,
		Limit:      int64(limit),
		Skip:       int64(skip),
		Sort:       sort,
	}

	// Execute the function
	results, count, err := database.FilterCollectionWithProjection(ctx, appSession, "Users", filter_arg)

	// Validate results
	if err != nil {
		t.Fatalf("FilterUsersWithProjection() error = %v", err)
	}

	if count != 4 {
		t.Fatalf("FilterUsersWithProjection() count = %v, want %v", count, 1)
	}

	if len(results) != 4 {
		t.Fatalf("FilterUsersWithProjection() results count = %v, want %v", len(results), 1)
	}

	if results[0]["email"] != "TestFilterUsersWithProjectionAndSortDescSuccess4@example.com" {
		t.Fatalf("FilterUsersWithProjection() email = %v, want %v", results[0]["email"], "TestFilterUsersWithProjectionAndSortDescSuccess4@example.com")
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
		appsession := &models.AppSession{}
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: cache,
		}

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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
		appsession := &models.AppSession{}
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

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
			Notifications: &models.Notifications{
				Invites: true,
			},
		},
		{
			Email:         "TestGetUsersPushTokens2@example.com",
			ExpoPushToken: "a1a2a3a4a5a6a7a8a9a0",
			Notifications: &models.Notifications{
				Invites: true,
			},
		},
	}
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := &models.AppSession{
		DB: db,
	}

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

		appsession := &models.AppSession{}
		results, err := database.GetUsersPushTokens(ctx, appsession, emails)
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
