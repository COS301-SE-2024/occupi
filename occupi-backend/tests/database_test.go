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
		res := Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))
		roomv, err := res.Bytes()

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

		res := Cache.Set(context.Background(), cache.RoomBookingKey(booking.OccupiID), bookingData, 0)

		assert.Nil(t, res.Err())

		// Call the function under test
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the room was added to the Cache
		bookingv, err := Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))

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
		res := Cache.Get(context.Background(), cache.UserKey(email))
		emailv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, emailv)
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
		res := Cache.Get(context.Background(), cache.RoomBookingKey(id))
		idv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, idv)
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
		res := Cache.Get(context.Background(), cache.UserKey(user.Email))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)
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
			if err := Cache.Set(context.Background(), cache.OTPKey(email, otp), otpData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the otp is in the Cache
		res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
		otpa, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, otpa)

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
			if err := Cache.Set(context.Background(), cache.OTPKey(email, otp), otpData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the otp is in the Cache
		res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
		otpa, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, otpa)

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
		res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
		otpv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, otpv)
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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

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
		res = Cache.Get(context.Background(), cache.UserKey(email))
		user, err := res.Bytes()

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), passData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		passv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, passv)

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
			if err := Cache.Set(context.Background(), cache.UserKey(email1), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email1))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

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
			if err := Cache.Set(context.Background(), cache.UserKey(email2), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email2))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		user, err := res.Bytes()

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
		res = Cache.Get(context.Background(), cache.UserKey(email))
		user, err = res.Bytes()

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the password is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		user, err := res.Bytes()

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
		res = Cache.Get(context.Background(), cache.UserKey(email))
		user, err = res.Bytes()

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

func TestConfirmCancellation(t *testing.T) {
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
		Creator:   "test@example.com",
		BookingID: "123456",
	}

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		success, err := database.ConfirmCancellation(ctx, appsession, checkin.BookingID, checkin.Creator)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Confirm cancellation successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.ConfirmCancellation(ctx, appsession, checkin.BookingID, checkin.Creator)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("Confirm cancellation successfully in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		bookingStruct := models.Booking{
			OccupiID: checkin.BookingID,
			Creator:  checkin.Creator,
		}

		// Add checkin to Cache
		if checkinData, err := bson.Marshal(bookingStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.RoomBookingKey(bookingStruct.OccupiID), checkinData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the checkin is in the Cache
		res := Cache.Get(context.Background(), cache.RoomBookingKey(bookingStruct.OccupiID))
		checkinv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, checkinv)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		success, err := database.ConfirmCancellation(ctx, appsession, checkin.BookingID, checkin.Creator)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		res = Cache.Get(context.Background(), cache.RoomBookingKey(checkin.BookingID))
		checkinv, err = res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, checkinv)
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
		success, err := database.ConfirmCancellation(ctx, appsession, checkin.BookingID, checkin.Creator)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestGetUserDetails(t *testing.T) {
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

	userStruct := models.User{
		OccupiID:             "123456",
		Password:             "hashedpassword123",
		Email:                "test@example.com",
		Role:                 constants.Admin,
		OnSite:               true,
		IsVerified:           true,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations: []models.Location{
			{
				City:    "Cape Town",
				Region:  "Western Cape",
				Country: "South Africa",
			},
		},
		Details: models.Details{
			ImageID:  "",
			Name:     "Michael",
			DOB:      time.Now(),
			Gender:   "Male",
			Pronouns: "He/Him",
		},
		Notifications: models.Notifications{
			Invites:         true,
			BookingReminder: true,
		},
		Security: models.Security{
			MFA:         false,
			Biometrics:  false,
			ForceLogout: false,
		},
		Status:        "5",
		Position:      "Chief Executive Engineer",
		DepartmentNo:  "01",
		ExpoPushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
	}

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		user, err := database.GetUserDetails(ctx, appsession, userStruct.Email)

		// empty user
		usere := models.UserDetailsRequest{}

		// Validate the result
		assert.Error(t, err)
		assert.Equal(t, usere, user)
	})

	mt.Run("Get user details successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "occupiID", Value: userStruct.OccupiID},
			{Key: "password", Value: userStruct.Password},
			{Key: "email", Value: userStruct.Email},
			{Key: "role", Value: userStruct.Role},
			{Key: "onSite", Value: userStruct.OnSite},
			{Key: "isVerified", Value: userStruct.IsVerified},
			{Key: "nextVerificationDate", Value: userStruct.NextVerificationDate},
			{Key: "twoFAEnabled", Value: userStruct.TwoFAEnabled},
			{Key: "knownLocations", Value: userStruct.KnownLocations},
			{Key: "details", Value: userStruct.Details},
			{Key: "notifications", Value: userStruct.Notifications},
			{Key: "security", Value: userStruct.Security},
			{Key: "status", Value: userStruct.Status},
			{Key: "position", Value: userStruct.Position},
			{Key: "departmentNo", Value: userStruct.DepartmentNo},
			{Key: "expoPushToken", Value: userStruct.ExpoPushToken},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		user, err := database.GetUserDetails(ctx, appsession, userStruct.Email)

		expectedUser := models.UserDetailsRequest{
			Email:    userStruct.Email,
			Name:     userStruct.Details.Name,
			Gender:   userStruct.Details.Gender,
			Pronouns: userStruct.Details.Pronouns,
			Number:   userStruct.Details.ContactNo,
		}

		// Validate the result
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, expectedUser.Email, user.Email)
		assert.Equal(t, expectedUser.Name, user.Name)
		assert.Equal(t, expectedUser.Gender, user.Gender)
		assert.Equal(t, expectedUser.Pronouns, user.Pronouns)
		assert.Equal(t, expectedUser.Number, user.Number)
	})

	mt.Run("Get user details successfully from Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		// Add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userStruct.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(userStruct.Email))
		userv, errv := res.Bytes()

		assert.Nil(t, errv)
		assert.NotNil(t, userv)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		user, err := database.GetUserDetails(ctx, appsession, userStruct.Email)

		expectedUser := models.UserDetailsRequest{
			Email:    userStruct.Email,
			Name:     userStruct.Details.Name,
			Gender:   userStruct.Details.Gender,
			Pronouns: userStruct.Details.Pronouns,
			Number:   userStruct.Details.ContactNo,
		}

		// Validate the result
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, expectedUser.Email, user.Email)
		assert.Equal(t, expectedUser.Name, user.Name)
		assert.Equal(t, expectedUser.Gender, user.Gender)
		assert.Equal(t, expectedUser.Pronouns, user.Pronouns)
		assert.Equal(t, expectedUser.Number, user.Number)
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
		user, err := database.GetUserDetails(ctx, appsession, userStruct.Email)

		// empty user
		usere := models.UserDetailsRequest{}

		// Validate the result
		assert.Error(t, err)
		assert.Equal(t, usere, user)
	})
}

func TestUpdateUserDetails(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		success, err := database.UpdateUserDetails(ctx, appsession, models.UserDetailsRequest{})

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})

	mt.Run("Update user name successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Name:         "Michael",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update user name in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				Name: "null",
			},
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))
		userv, errv := res.Bytes()

		assert.Nil(t, errv)
		assert.NotNil(t, userv)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Name:         "Michael",
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		res = Cache.Get(context.Background(), cache.UserKey(userDetails.Email))
		user, errv := res.Bytes()

		assert.Nil(t, errv)
		assert.NotNil(t, userv)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Name, userB.Details.Name)
	})

	mt.Run("Update user dob successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Dob:          time.Now().String(),
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update user dob in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				DOB: time.Now(),
			},
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Dob:          time.Now().Add(1 * time.Hour).String(),
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result

		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)
	})

	mt.Run("Update gender successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Gender:       "Male",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update gender in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				Gender: "null",
			},
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Gender:       "Male",
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Gender, userB.Details.Gender)
	})

	mt.Run("Update email successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Email:        "test@example.com",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update email in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email:      "test@example.com",
			IsVerified: true,
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Email:        "test1@example.com",
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(context.Background(), cache.UserKey(updateUser.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Email, userB.Email)
		assert.False(t, userB.IsVerified)
	})

	mt.Run("Update employee id successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Employeeid:   "123456",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update employee id in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email:    "test@example.com",
			OccupiID: "null",
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Employeeid:   "123456",
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Employeeid, userB.OccupiID)
	})

	mt.Run("Update number successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Number:       "011 123 4567",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update email in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				ContactNo: "null",
			},
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Number:       "011 123 4567",
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Number, userB.Details.ContactNo)
	})

	mt.Run("Update pronouns successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Pronouns:     "He/Him",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("Update pronouns in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				Pronouns: "null",
			},
		}

		// Add user to Cache
		if userData, err := bson.Marshal(userDetails); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Pronouns:     "He/Him",
		}

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		user, err = Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Pronouns, userB.Details.Pronouns)
	})

	mt.Run("Update Error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		userDetails := models.UserDetailsRequest{
			SessionEmail: "test@example.com",
			Name:         "Michael",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		success, err := database.UpdateUserDetails(ctx, appsession, userDetails)

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(email))

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		user, err := Cache.Get(context.Background(), cache.UserKey(email))

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
		user, err = Cache.Get(context.Background(), cache.UserKey(email))

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("nil database", func(mt *mtest.T) {
		email := "test@example.com"
		newPassword := "newpassword123"

		appsession := &models.AppSession{}
		success, err := database.UpdateUserPassword(ctx, appsession, email, newPassword)

		assert.Error(t, err)
		assert.False(t, success)
	})

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

	mt.Run("Update user password successfully in Cache", func(mt *mtest.T) {
		email := "test@example.com"
		newPassword := "newpassword123"

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		userStruct := models.User{
			Email:    email,
			Password: "oldpassword",
		}

		// add user to Cache
		if userData, err := bson.Marshal(userStruct); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		success, err := database.UpdateUserPassword(ctx, appsession, email, newPassword)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update in Cache
		userB, err := Cache.Get(context.Background(), cache.UserKey(email))

		assert.Nil(t, err)
		assert.NotNil(t, userB)

		// unmarshal the user data
		var user models.User
		if err := bson.Unmarshal(userB, &user); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, newPassword, user.Password)
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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(email))

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
			if err := Cache.Set(context.Background(), cache.UserKey(email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(email))

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
		appsession := &models.AppSession{
			DB: mt.Client,
		}
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

	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		emails := []string{"TestGetUsersPushTokens1@example.com", "TestGetUsersPushTokens2@example.com"}
		results, err := database.GetUsersPushTokens(ctx, appSession, emails)

		// Validate the result
		assert.Error(t, err)
		assert.Nil(t, results)
	})
}

func TestAddNotification(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("nil database", func(mt *mtest.T) {
		appSession := &models.AppSession{}
		success, err := database.AddNotification(ctx, appSession, models.ScheduledNotification{}, false)

		assert.NotNil(t, err)
		assert.False(t, success)
	})

	mt.Run("success add not push notification", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		appSession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddNotification(ctx, appSession, models.ScheduledNotification{}, false)

		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("success add push notification", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		appSession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddNotification(ctx, appSession, models.ScheduledNotification{}, true)

		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		appSession := &models.AppSession{
			DB: mt.Client,
		}
		success, err := database.AddNotification(ctx, appSession, models.ScheduledNotification{}, false)

		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestGetScheduledNotifications(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Database is nil", func(mt *mtest.T) {
		// Call the function under test with a nil database
		appSession := &models.AppSession{}
		result, err := database.GetScheduledNotifications(ctx, appSession)

		// Validate the result
		assert.Error(mt, err)
		assert.Nil(mt, result)
		assert.Equal(mt, "database is nil", err.Error())
	})

	mt.Run("Retrieve scheduled notifications successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedNotifications := []models.ScheduledNotification{
			{
				Title: "Test Notification",
				Sent:  false,
			},
			{
				Title: "Another Test Notification",
				Sent:  false,
			},
		}

		firstBatch := mtest.CreateCursorResponse(1, "Notifications.mock", mtest.FirstBatch, bson.D{
			{Key: "title", Value: expectedNotifications[0].Title},
			{Key: "sent", Value: expectedNotifications[0].Sent},
		})
		getMoreBatch := mtest.CreateCursorResponse(0, "Notifications.mock", mtest.NextBatch, bson.D{
			{Key: "title", Value: expectedNotifications[1].Title},
			{Key: "sent", Value: expectedNotifications[1].Sent},
		})
		mt.AddMockResponses(firstBatch, getMoreBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetScheduledNotifications(ctx, appSession)

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedNotifications, result)
	})

	mt.Run("Find returns an error", func(mt *mtest.T) {
		// Add a mock response that simulates a find error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetScheduledNotifications(ctx, appSession)

		// Validate the result
		assert.Error(mt, err)
		assert.Nil(mt, result)
		assert.Contains(mt, err.Error(), "find error")
	})
}

func TestMarkNotificationAsSent(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Database is nil", func(mt *mtest.T) {
		// Call the function under test with a nil database
		appSession := &models.AppSession{}
		err := database.MarkNotificationAsSent(ctx, appSession, "60b725f10c9e9d63e5ecf26a")

		// Validate the result
		assert.Error(mt, err)
		assert.Equal(mt, "database is nil", err.Error())
	})

	mt.Run("Invalid notification ID", func(mt *mtest.T) {
		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test with an invalid notification ID
		err := database.MarkNotificationAsSent(ctx, appSession, "invalid_id")

		// Validate the result
		assert.Error(mt, err)
		assert.Contains(mt, err.Error(), "the provided hex string is not a valid ObjectID")
	})

	mt.Run("Mark notification as sent successfully", func(mt *mtest.T) {
		// Add a mock response for a successful update
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		err := database.MarkNotificationAsSent(ctx, appSession, "60b725f10c9e9d63e5ecf26a")

		// Validate the result
		assert.NoError(mt, err)
	})

	mt.Run("UpdateOne returns an error", func(mt *mtest.T) {
		// Add a mock response that simulates an update error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "update error",
		}))

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		err := database.MarkNotificationAsSent(ctx, appSession, "60b725f10c9e9d63e5ecf26a")

		// Validate the result
		assert.Error(mt, err)
		assert.Contains(mt, err.Error(), "update error")
	})
}

func TestReadNotifications(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Database is nil", func(mt *mtest.T) {
		// Call the function under test with a nil database
		appSession := &models.AppSession{}
		err := database.ReadNotifications(ctx, appSession, "test@example.com")

		// Validate the result
		assert.Error(mt, err)
		assert.Equal(mt, "database is nil", err.Error())
	})

	mt.Run("Update many notifications successfully", func(mt *mtest.T) {
		// Add a mock response for a successful update
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		err := database.ReadNotifications(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
	})

	mt.Run("UpdateMany returns an error", func(mt *mtest.T) {
		// Add a mock response that simulates an update error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "update error",
		}))

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		err := database.ReadNotifications(ctx, appSession, "test@example.com")

		// Validate the result
		assert.Error(mt, err)
		assert.Contains(mt, err.Error(), "update error")
	})
}

func TestGetSecuritySettings(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Database is nil", func(mt *mtest.T) {
		// Call the function under test with a nil database
		appSession := &models.AppSession{}
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		emptySettings := models.SecuritySettingsRequest{}

		// Validate the result
		assert.Error(mt, err)
		assert.Equal(mt, emptySettings, result)
		assert.Equal(mt, "database is nil", err.Error())
	})

	mt.Run("Retrieve security settings with mfa on and force logout off successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "on",
			ForceLogout: "off",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "security", Value: bson.D{
				{Key: "mfa", Value: true},
				{Key: "forceLogout", Value: false},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa off and force logout off successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "off",
			ForceLogout: "off",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "security", Value: bson.D{
				{Key: "mfa", Value: false},
				{Key: "forceLogout", Value: false},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa off and force logout on successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "off",
			ForceLogout: "on",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "security", Value: bson.D{
				{Key: "mfa", Value: false},
				{Key: "forceLogout", Value: true},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa on and force logout on successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "on",
			ForceLogout: "on",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "security", Value: bson.D{
				{Key: "mfa", Value: true},
				{Key: "forceLogout", Value: true},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa on and force logout off successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "on",
			ForceLogout: "off",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         true,
				ForceLogout: false,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa off and force logout off successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "off",
			ForceLogout: "off",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa off and force logout on successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "off",
			ForceLogout: "on",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: true,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with mfa on and force logout on successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "on",
			ForceLogout: "on",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         true,
				ForceLogout: true,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Find returns an error", func(mt *mtest.T) {
		// Add a mock response that simulates a find error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		emptySettings := models.SecuritySettingsRequest{}

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.Error(mt, err)
		assert.Equal(mt, emptySettings, result)
		assert.Contains(mt, err.Error(), "find error")
	})
}

func TestUpdateSecuritySettings(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		err := database.UpdateSecuritySettings(ctx, appsession, models.SecuritySettingsRequest{})

		// Validate the result
		assert.Error(t, err)
	})

	mt.Run("Test update password successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			NewPassword: "blah-blah",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set mfa on successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
			Mfa:   "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set mfa off successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
			Mfa:   "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set force logout on successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			ForceLogout: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set force logout off successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			ForceLogout: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set password successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email:    "test@example.com",
			Password: "blah-blah",
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			NewPassword: "blah-blah-blah",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// Assert that the user is in the Cache
		userA, err = Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, "blah-blah-blah", userB.Password)
	})

	mt.Run("Test set mfa on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
			Mfa:   "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// Assert that the user is in the Cache
		userA, err = Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, true, userB.Security.MFA)
	})

	mt.Run("Test set mfa off successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         true,
				ForceLogout: false,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
			Mfa:   "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// Assert that the user is in the Cache
		userA, err = Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, false, userB.Security.MFA)
	})

	mt.Run("Test set force logout on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			ForceLogout: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// Assert that the user is in the Cache
		userA, err = Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, true, userB.Security.ForceLogout)
	})

	mt.Run("Test set force logout off successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache := configs.CreateCache()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: true,
			},
		}

		// add user to Cache
		if userData, err := bson.Marshal(user); err != nil {
			t.Fatal(err)
		} else {
			if err := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, 0); err != nil {
				t.Fatal(err)
			}
		}

		// Assert that the user is in the Cache
		userA, err := Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			ForceLogout: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// Assert that the user is in the Cache
		userA, err = Cache.Get(context.Background(), cache.UserKey(user.Email))

		assert.Nil(t, err)
		assert.NotNil(t, userA)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, false, userB.Security.ForceLogout)
	})

	mt.Run("Update Error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.Error(t, err)
	})
}
