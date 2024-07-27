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

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"

	"github.com/stretchr/testify/assert"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
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

func TestSaveBooking(t *testing.T) {
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

	booking := models.Booking{
		OccupiID: "OCCUPI01",
	}

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		success, err := database.SaveBooking(ctx, appsession, booking)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Add room successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.SaveBooking(ctx, appsession, booking)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Add room successfully to Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		success, err := database.SaveBooking(ctx, appsession, booking)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the room was added to the Cache
		roomv, err := Cache.Get(cache.RoomBookingKey(booking.OccupiID))

		assert.Nil(t, err)
		assert.NotNil(t, roomv)
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
		success, err := database.SaveBooking(ctx, appsession, booking)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestConfirmCheckIn(t *testing.T) {
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

	checkin := models.CheckIn{
		BookingID: "ROOM01",
		Creator:   "test@example.com",
	}

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Check in successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch, bson.D{
			{Key: "email", Value: checkin.Creator},
			{Key: "roomId", Value: checkin.BookingID},
			{Key: "checkedIn", Value: false},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Check in successfully in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		booking := models.Booking{
			OccupiID:  checkin.BookingID,
			Creator:   checkin.Creator,
			CheckedIn: false,
		}

		// marshall and add the booking to cache
		bookingData, err := bson.Marshal(booking)

		assert.Nil(t, err)

		err = Cache.Set(cache.RoomBookingKey(booking.OccupiID), bookingData)

		assert.Nil(t, err)

		// Call the function under test
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the room was added to the Cache
		bookingv, err := Cache.Get(cache.RoomBookingKey(booking.OccupiID))

		assert.Nil(t, err)
		assert.NotNil(t, bookingv)

		// unmarshall
		var booking2 models.Booking
		err = bson.Unmarshal(bookingv, &booking2)

		assert.Nil(t, err)

		assert.True(t, booking2.CheckedIn)
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
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
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

	mt.Run("Email exists adding to Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.True(t, exists)

		// Check if the email exists in the Cache
		email, err := Cache.Get(cache.UserKey(email))
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

func TestBookingExists(t *testing.T) {
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

	id := "OCCUPI0101"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		exists := database.BookingExists(ctx, appsession, id)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Booking exists", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch, bson.D{
			{Key: "occupiId", Value: id},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists := database.BookingExists(ctx, appsession, id)

		// Validate the result
		assert.True(t, exists)
	})

	mt.Run("Email exists adding to Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch, bson.D{
			{Key: "occupiId", Value: id},
		}))

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		exists := database.BookingExists(ctx, appsession, id)

		// Validate the result
		assert.True(t, exists)

		// Check if the email exists in the Cache
		booking, err := Cache.Get(cache.RoomBookingKey(id))
		assert.NoError(t, err)
		assert.NotNil(t, booking)
	})

	mt.Run("Email does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		exists := database.BookingExists(ctx, appsession, id)

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
		exists := database.BookingExists(ctx, appsession, id)

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

	mt.Run("Add user successfully to Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		success, err := database.AddUser(ctx, appsession, user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the user was added to the Cache
		user, err := Cache.Get(cache.UserKey(user.Email))

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

	mt.Run("OTP exists and is valid in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: validOTP,
		}

		// add otp to Cache
		if otpData, err := bson.Marshal(otpStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.OTPKey(email, otp), otpData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the otp is in the Cache
		otpA, err := Cache.Get(cache.OTPKey(email, otp))

		assert.Nil(t, err)
		assert.NotNil(t, otpA)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
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

	mt.Run("OTP exists but is expired in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: expiredOTP,
		}

		// add otp to Cache
		if otpData, err := bson.Marshal(otpStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.OTPKey(email, otp), otpData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the otp is in the Cache
		otpA, err := Cache.Get(cache.OTPKey(email, otp))

		assert.Nil(t, err)
		assert.NotNil(t, otpA)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
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

	mt.Run("Add OTP successfully to Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		success, err := database.AddOTP(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the otp was added to the Cache
		otp, err := Cache.Get(cache.OTPKey(email, otp))

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

	mt.Run("Verify user successfully and user is not in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
			{Key: "nextVerificationDate", Value: time.Now().Add(-1 * time.Hour)},
		}))

		Cache := configs.CreateCache()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("Verify user successfully and user is in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
			{Key: "nextVerificationDate", Value: time.Now().Add(-1 * time.Hour)},
		}))

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:                email,
			IsVerified:           false,
			NextVerificationDate: time.Now().Add(-1 * time.Hour),
		}

		// add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err := Cache.Get(cache.UserKey(email))

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

	mt.Run("Get password successfully from Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:    email,
			Password: password,
		}

		// Add password to Cache
		if passData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), passData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the Cache
		pass, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, pass)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
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

func TestCheckIfNextVerificationDateIsDue(t *testing.T) {
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

	email1 := "test1@example.com"
	email2 := "test2@example.com"

	dueDate := time.Now().Add(-1 * time.Hour)
	notDueDate := time.Now().Add(1 * time.Hour)

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email1)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isDue)
	})

	mt.Run("Verification date is not due", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email1},
			{Key: "isVerified", Value: true},
			{Key: "nextVerificationDate", Value: notDueDate},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email1)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isDue)
	})

	mt.Run("Verification date is due", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(2, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email2},
			{Key: "isVerified", Value: true},
			{Key: "nextVerificationDate", Value: dueDate},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email2)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isDue)
	})

	mt.Run("Verification date is not due in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:                email1,
			IsVerified:           false,
			NextVerificationDate: notDueDate,
		}

		// add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email1), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email1))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}
		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email1)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isDue)
	})

	mt.Run("Verification date is due in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:                email2,
			IsVerified:           false,
			NextVerificationDate: dueDate,
		}

		// add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email2), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email2))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}
		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email2)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isDue)
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
		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email1)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isDue)
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

	mt.Run("User is verified in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: true},
		}))

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:      email,
			IsVerified: true,
		}

		// add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}
		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isVerified)
	})

	mt.Run("User is not verified in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
		}))

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:      email,
			IsVerified: false,
		}

		// add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

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

	mt.Run("Update verification status successfully in Cache to true", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:      email,
			IsVerified: false,
		}

		// Add password to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the Cache
		user, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, true)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.True(t, userB.IsVerified)
	})

	mt.Run("Update verification status successfully in Cache to false", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:      email,
			IsVerified: true,
		}

		// Add password to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the Cache
		user, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, false)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(cache.UserKey(email))

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

	mt.Run("User is admin in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email: email,
			Role:  constants.Admin,
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
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

	mt.Run("User is not admin in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email: email,
			Role:  constants.Basic,
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isAdmin)

		// Verify the user was not updated in the Cache
		user, err = Cache.Get(cache.UserKey(email))

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

		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.UpdateUserPassword(ctx, appsession, email, newPassword)

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

		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.UpdateUserPassword(ctx, appsession, email, newPassword)

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
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
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
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
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
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
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
			{Key: "knownLocations", Value: bson.A{
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
			{Key: "knownLocations", Value: bson.A{
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

	mt.Run("Location exists and is valid in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

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

		// add userstruct to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, yes)
		assert.Nil(t, info)
	})

	mt.Run("Location exists but does not match what is in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

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

		// add userstruct to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(cache.UserKey(email), userData); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
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
			Notifications: models.Notifications{
				Invites: true,
			},
		},
		{
			Email:         "TestGetUsersPushTokens2@example.com",
			ExpoPushToken: "a1a2a3a4a5a6a7a8a9a0",
			Notifications: models.Notifications{
				Invites: true,
			},
		},
	}
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
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
