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
	"github.com/go-redis/redismock/v9"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/ipinfo/go/v2/ipinfo"

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

func TestCreateUser(t *testing.T) {
	user := models.RegisterUser{
		EmployeeID:    "OCCUPI01",
		Password:      "password",
		Email:         "test@example.com",
		ExpoPushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
	}

	newU := database.CreateBasicUser(user)

	assert.Equal(t, user.EmployeeID, newU.OccupiID)
	assert.Equal(t, user.Password, newU.Password)
	assert.Equal(t, user.Email, newU.Email)
	assert.Equal(t, constants.Basic, newU.Role)
	assert.Equal(t, user.ExpoPushToken, newU.ExpoPushToken)
}

func TestCreateAdminUser(t *testing.T) {
	user := models.RegisterUser{
		EmployeeID:    "OCCUPI01",
		Password:      "password",
		Email:         "test@example.com",
		ExpoPushToken: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
	}

	newU := database.CreateAdminUser(user)

	assert.Equal(t, user.EmployeeID, newU.OccupiID)
	assert.Equal(t, user.Password, newU.Password)
	assert.Equal(t, user.Email, newU.Email)
	assert.Equal(t, constants.Admin, newU.Role)
	assert.Equal(t, user.ExpoPushToken, newU.ExpoPushToken)
}

func TestMockDatabase(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
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

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Marshal and add the booking to cache
		bookingData, err := bson.Marshal(booking)

		assert.Nil(t, err)
		assert.NotNil(t, bookingData)

		// Mock the Set operation
		mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))

		// Mock the Get operation to return the booking data
		mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal(string(bookingData))

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
		assert.Equal(t, bookingData, roomv)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Add room successfully to Cache and Expire after a while", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Marshal and add the booking to cache
		bookingData, err := bson.Marshal(booking)

		assert.Nil(t, err)
		assert.NotNil(t, bookingData)

		// Mock the Set operation
		mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))

		// Mock the Get operation to return the booking data
		mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal(string(bookingData))

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
		assert.Equal(t, bookingData, roomv)

		// sleep for 2 * Cache expiry time to ensure the Cache expires
		time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

		// Verify the booking is not in the Cache
		cachedBooking2 := Cache.Get(context.Background(), cache.UserKey(booking.OccupiID))
		res1, errv := cachedBooking2.Bytes()
		assert.NotNil(t, errv)
		assert.Nil(t, res1)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

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

		// mock expect set and get
		mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))
		mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal(string(bookingData))

		res := Cache.Set(context.Background(), cache.RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal(string(bookingData))

		// Verify the room was added to the Cache
		res1 := Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))
		bookingv, err := res1.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, bookingv)

		// unmarshall
		var booking2 models.Booking
		err = bson.Unmarshal(bookingv, &booking2)

		assert.Nil(t, err)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Check in successfully in Cache and Expire", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

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

		// mock expect set and get
		mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))
		mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal(string(bookingData))

		assert.Nil(t, err)

		res := Cache.Set(context.Background(), cache.RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		success, err := database.ConfirmCheckIn(ctx, appsession, checkin)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal(string(bookingData))

		// Verify the room was added to the Cache
		res1 := Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))
		bookingv, err := res1.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, bookingv)

		// unmarshall
		var booking2 models.Booking
		err = bson.Unmarshal(bookingv, &booking2)

		assert.Nil(t, err)

		// sleep for 2 * Cache expiry time to ensure the Cache expires
		time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

		// Verify the booking is not in the Cache
		cachedBooking2 := Cache.Get(context.Background(), cache.UserKey(checkin.BookingID))
		res2, errv := cachedBooking2.Bytes()
		assert.NotNil(t, errv)
		assert.Nil(t, res2)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

	mt.Run("Email exists in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		user := models.User{
			Email: email,
		}

		// marshal and add the user to cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// mock expect set
		mock.ExpectSet(cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// add email to Cache
		res1 := Cache.Set(context.Background(), cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res1.Err())

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Call the function under test
		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.True(t, exists)

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Check if the email exists in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		emailv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, emailv)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Email does not exist in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch))

		Cache, mock := redismock.NewClientMock()

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetErr(errors.New("key does not exist"))

		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.False(t, exists)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Email exists in Cache and Expired", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		user := models.User{
			Email: email,
		}

		// marshal and add the user to cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// mock expect set
		mock.ExpectSet(cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// add email to Cache
		res1 := Cache.Set(context.Background(), cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res1.Err())

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Call the function under test
		exists := database.EmailExists(ctx, appsession, email)

		// Validate the result
		assert.True(t, exists)

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Check if the email exists in the Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
		emailv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, emailv)

		// sleep for 2 * Cache expiry time to ensure the Cache expires
		time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

		// Verify the email is not in the Cache
		cachedEmail := Cache.Get(context.Background(), cache.UserKey(email))

		res2, errv := cachedEmail.Bytes()
		assert.NotNil(t, errv)
		assert.Nil(t, res2)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

	mt.Run("Booking exists in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch, bson.D{
			{Key: "occupiId", Value: id},
		}))

		Cache, mock := redismock.NewClientMock()

		booking := models.Booking{
			OccupiID: id,
		}

		// marshal and add the booking to cache
		bookingData, err := bson.Marshal(booking)

		assert.Nil(t, err)

		// mock expect set
		mock.ExpectSet(cache.RoomBookingKey(id), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))

		// add booking to Cache
		res1 := Cache.Set(context.Background(), cache.RoomBookingKey(id), bookingData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res1.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.RoomBookingKey(id)).SetVal(string(bookingData))

		// Call the function under test
		exists := database.BookingExists(ctx, appsession, id)

		// Validate the result
		assert.True(t, exists)

		// mock expect get
		mock.ExpectGet(cache.RoomBookingKey(id)).SetVal(string(bookingData))

		// Check if the booking exists in the Cache
		res := Cache.Get(context.Background(), cache.RoomBookingKey(id))
		idv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, idv)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Booking exists in Cache and Expires", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch, bson.D{
			{Key: "occupiId", Value: id},
		}))

		Cache, mock := redismock.NewClientMock()

		booking := models.Booking{
			OccupiID: id,
		}

		// marshal and add the booking to cache
		bookingData, err := bson.Marshal(booking)

		assert.Nil(t, err)

		// mock expect set
		mock.ExpectSet(cache.RoomBookingKey(id), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))

		// add booking to Cache
		res1 := Cache.Set(context.Background(), cache.RoomBookingKey(id), bookingData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res1.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.RoomBookingKey(id)).SetVal(string(bookingData))

		// Call the function under test
		exists := database.BookingExists(ctx, appsession, id)

		// Validate the result
		assert.True(t, exists)

		// mock expect get
		mock.ExpectGet(cache.RoomBookingKey(id)).SetVal(string(bookingData))

		// Check if the booking exists in the Cache
		res := Cache.Get(context.Background(), cache.RoomBookingKey(id))
		idv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, idv)

		// sleep for 2 * Cache expiry time to ensure the Cache expires
		time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

		// Verify the booking is not in the Cache
		cachedBooking := Cache.Get(context.Background(), cache.UserKey(id))
		res2, errv := cachedBooking.Bytes()

		assert.NotNil(t, errv)
		assert.Nil(t, res2)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Marshal and add the user to cache
		userData, err := bson.Marshal(database.CreateBasicUser(user))

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// Call the function under test
		success, err := database.AddUser(ctx, appsession, user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Verify the user was added to the Cache
		res := Cache.Get(context.Background(), cache.UserKey(user.Email))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Add user successfully to Cache and Expire", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Marshal and add the user to cache
		userData, err := bson.Marshal(database.CreateBasicUser(user))

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// Call the function under test
		success, err := database.AddUser(ctx, appsession, user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Verify the user was added to the Cache
		res := Cache.Get(context.Background(), cache.UserKey(user.Email))
		userv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, userv)

		// sleep for 2 * Cache expiry time to ensure the Cache expires
		time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

		// Verify the user is not in the Cache
		cachedUser := Cache.Get(context.Background(), cache.UserKey(user.Email))

		res1, errv := cachedUser.Bytes()
		assert.NotNil(t, errv)
		assert.Nil(t, res1)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: validOTP,
		}

		// add otp to Cache
		otpData, err := bson.Marshal(otpStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.OTPKey(email, otp), otpData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(otpData))

		// set the otp in the Cache
		res := Cache.Set(context.Background(), cache.OTPKey(email, otp), otpData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(otpData))

		// Call the function under test
		exists, err := database.OTPExists(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, exists)

		// mock expect get
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(otpData))

		// Verify the otp is in the Cache
		res1 := Cache.Get(context.Background(), cache.OTPKey(email, otp))
		otpa, err := res1.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, otpa)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("OTP exists and is valid in Cache and Expired", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: validOTP,
		}

		// add otp to Cache
		otpData, err := bson.Marshal(otpStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.OTPKey(email, otp), otpData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(otpData))

		// set the otp in the Cache
		res := Cache.Set(context.Background(), cache.OTPKey(email, otp), otpData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(otpData))

		// Call the function under test
		exists, err := database.OTPExists(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, exists)

		// mock expect get
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(otpData))

		// Verify the otp is in the Cache
		res1 := Cache.Get(context.Background(), cache.OTPKey(email, otp))
		otpa, err := res1.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, otpa)

		// sleep for 2 * Cache expiry time to ensure the Cache expires
		time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

		// Verify the otp is not in the Cache
		cachedOTP := Cache.Get(context.Background(), cache.OTPKey(email, otp))

		res2, errv := cachedOTP.Bytes()
		assert.NotNil(t, errv)
		assert.Nil(t, res2)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// marshal and add the otp to cache
		otpStruct := models.OTP{
			Email:      email,
			OTP:        otp,
			ExpireWhen: time.Now().Add(time.Second * time.Duration(configs.GetOTPExpiration())),
		}

		otpData, err := bson.Marshal(otpStruct)

		assert.Nil(t, err)

		// marshal and add the otp to cache
		mock.ExpectSet(cache.OTPKey(email, otp), otpData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(otpData))

		// Call the function under test
		success, err := database.AddOTP(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(otpData))

		// Verify the otp was added to the Cache
		res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
		otpv, err := res.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, otpv)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

	mt.Run("Delete OTP successfully from Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect delete
		mock.ExpectDel(cache.OTPKey(email, otp)).SetVal(0)

		// Call the function under test
		success, err := database.DeleteOTP(ctx, appsession, email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.OTPKey(email, otp)).SetErr(errors.New("key does not exist"))

		// Verify the otp was deleted from the Cache
		res := Cache.Get(context.Background(), cache.OTPKey(email, otp))

		otpv, err := res.Bytes()

		assert.NotNil(t, err)
		assert.Nil(t, otpv)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, _ := redismock.NewClientMock()

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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:                email,
			IsVerified:           false,
			NextVerificationDate: time.Now().Add(-1 * time.Hour),
		}

		// marshal and add the user to cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// expect set
		mock.ExpectSet(cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// Add user to Cache
		if res := Cache.Set(context.Background(), cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second); res.Err() != nil {
			t.Fatal(res.Err())
		}

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		userStruct.IsVerified = true
		userStruct.NextVerificationDate = time.Now().AddDate(0, 0, 30)
		userStruct.KnownLocations = append(userStruct.KnownLocations, models.Location{
			City:    "Cape Town",
			Region:  "Western Cape",
			Country: "South Africa",
		})

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		//expect get and set
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.VerifyUser(ctx, appsession, email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		//expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res := Cache.Get(context.Background(), cache.UserKey(email))
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

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:    email,
			Password: password,
		}

		// Add password to Cache
		passData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email), passData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(passData))

		// set the password in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email), passData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(passData))

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Call the function under test
		passwordv, err := database.GetPassword(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.Equal(t, password, passwordv)

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(passData))

		// Verify the password was added to the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(email))
		pass, err := res1.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, pass)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:                email1,
			IsVerified:           false,
			NextVerificationDate: notDueDate,
		}

		// add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email1), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email1), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email1)).SetVal(string(userData))

		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email1)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isDue)

		// ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Verification date is due in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:                email2,
			IsVerified:           false,
			NextVerificationDate: dueDate,
		}

		// add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email2), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email2), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email2)).SetVal(string(userData))

		isDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email2)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isDue)

		// ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:      email,
			IsVerified: true,
		}

		// add user to Cache
		userdata, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email), userdata, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userdata))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email), userdata, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userdata))

		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isVerified)

		// ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("User is not verified in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:      email,
			IsVerified: false,
		}

		// add user to Cache
		userdata, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email), userdata, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userdata))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email), userdata, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())
		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userdata))
		isVerified, err := database.CheckIfUserIsVerified(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isVerified)

		// ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:      email,
			IsVerified: false,
		}

		// add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		userStruct.IsVerified = true

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, true)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(email))
		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User

		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.True(t, userB.IsVerified)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Update verification status successfully in Cache to false", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:      email,
			IsVerified: true,
		}

		// Add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// mock expect set
		mock.ExpectSet(cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// Add user to Cache
		res := Cache.Set(context.Background(), cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		userStruct.IsVerified = false

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		//mock expect get and set
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		success, err := database.UpdateVerificationStatusTo(ctx, appsession, email, false)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(email))

		user, err := res1.Bytes()

		assert.Nil(t, err)
		assert.NotNil(t, user)

		// unmarshal the user data
		var userB models.User

		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.False(t, userB.IsVerified)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		bookingStruct := models.Booking{
			OccupiID: checkin.BookingID,
			Creator:  checkin.Creator,
		}

		// Add checkin to Cache
		bookingData, err := bson.Marshal(bookingStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.RoomBookingKey(bookingStruct.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(bookingData))

		// Add checkin to Cache
		res := Cache.Set(context.Background(), cache.RoomBookingKey(bookingStruct.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		//mock expect delete
		mock.ExpectDel(cache.RoomBookingKey(checkin.BookingID)).SetVal(1)

		// Call the function under test
		success, err := database.ConfirmCancellation(ctx, appsession, checkin.BookingID, checkin.Creator)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect del
		mock.ExpectDel(cache.RoomBookingKey(checkin.BookingID)).SetVal(1)

		// Verify the delete in Cache
		res1 := Cache.Del(context.Background(), cache.RoomBookingKey(checkin.BookingID))

		assert.Nil(t, res1.Err())

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		// Add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(userStruct.Email)).SetVal(string(userData))

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

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				Name: "null",
			},
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Name:         "Michael",
		}

		updatedUser := models.User{
			Email: userDetails.Email,
			Details: models.Details{
				Name: "Michael",
			},
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(userDetails.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Name, userB.Details.Name)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				DOB: time.Now(),
			},
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		updatedUser := models.User{
			Email: userDetails.Email,
			Details: models.Details{
				DOB: time.Now().Add(1 * time.Hour),
			},
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Dob:          updatedUser.Details.DOB.String(),
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		//mock.ExpectSet(cache.UserKey(userDetails.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				Gender: "null",
			},
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Gender:       "Male",
		}

		updatedUser := models.User{
			Email: userDetails.Email,
			Details: models.Details{
				Gender: "Male",
			},
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(userDetails.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Gender, userB.Details.Gender)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email:      "test@example.com",
			IsVerified: true,
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Email:        "test1@example.com",
		}

		updatedUser := models.User{
			Email: updateUser.Email,
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(updateUser.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(updatedUser.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(updatedUser.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Email, userB.Email)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email:    "test@example.com",
			OccupiID: "null",
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Employeeid:   "123456",
		}

		updatedUser := models.User{
			Email:    userDetails.Email,
			OccupiID: "123456",
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(userDetails.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Employeeid, userB.OccupiID)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

	mt.Run("Update number in Cache successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				ContactNo: "null",
			},
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Number:       "011 123 4567",
		}

		updatedUser := models.User{
			Email: userDetails.Email,
			Details: models.Details{
				ContactNo: "011 123 4567",
			},
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(userDetails.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Number, userB.Details.ContactNo)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userDetails := models.User{
			Email: "test@example.com",
			Details: models.Details{
				Pronouns: "null",
			},
		}

		// Add user to Cache
		userData, err := bson.Marshal(userDetails)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userDetails.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updateUser := models.UserDetailsRequest{
			SessionEmail: userDetails.Email,
			Pronouns:     "He/Him",
		}

		updatedUser := models.User{
			Email: userDetails.Email,
			Details: models.Details{
				Pronouns: "He/Him",
			},
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(userDetails.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		// Call the function under test
		success, err := database.UpdateUserDetails(ctx, appsession, updateUser)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(userDetails.Email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(userDetails.Email))

		user, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var userB models.User
		if err := bson.Unmarshal(user, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, updateUser.Pronouns, userB.Details.Pronouns)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email: email,
			Role:  constants.Admin,
		}

		// Add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isAdmin)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email: email,
			Role:  constants.Basic,
		}

		// Add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isAdmin)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		userStruct := models.User{
			Email:    email,
			Password: "oldpassword",
		}

		// add user to Cache
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		update := models.User{
			Email:    email,
			Password: newPassword,
		}

		// marshal and add the user to cache
		updatedUserData, err := bson.Marshal(update)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		success, err := database.UpdateUserPassword(ctx, appsession, email, newPassword)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(updatedUserData))

		// Verify the update in Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(email))

		userB, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal the user data
		var user models.User
		if err := bson.Unmarshal(userB, &user); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, newPassword, user.Password)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

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
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

		// Call the function under test
		yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, ctx.ClientIP())

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, yes)
		assert.Nil(t, info)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Location exists but does not match what is in Cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

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
		userData, err := bson.Marshal(userStruct)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(userStruct.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(email)).SetVal(string(userData))

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

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         true,
				ForceLogout: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Retrieve security settings with mfa off and force logout off successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "off",
			ForceLogout: "off",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Retrieve security settings with mfa off and force logout on successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "off",
			ForceLogout: "on",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Retrieve security settings with mfa on and force logout on successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			Mfa:         "on",
			ForceLogout: "on",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         true,
				ForceLogout: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetSecuritySettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email:    "test@example.com",
			Password: "blah-blah",
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			NewPassword: "blah-blah-blah",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email:    user.Email,
			Password: security.NewPassword,
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, "blah-blah-blah", userB.Password)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set mfa on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
			Mfa:   "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Security: models.Security{
				MFA:         true,
				ForceLogout: false,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, true, userB.Security.MFA)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set mfa off successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         true,
				ForceLogout: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		security := models.SecuritySettingsRequest{
			Email: "test@example.com",
			Mfa:   "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, false, userB.Security.MFA)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set force logout on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			ForceLogout: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Security: models.Security{
				MFA:         false,
				ForceLogout: true,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, true, userB.Security.ForceLogout)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set force logout off successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA:         false,
				ForceLogout: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		security := models.SecuritySettingsRequest{
			Email:       "test@example.com",
			ForceLogout: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Security: models.Security{
				MFA:         false,
				ForceLogout: false,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateSecuritySettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, false, userB.Security.ForceLogout)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

func TestIsLocationInRange(t *testing.T) {
	// Setup test cases
	tests := []struct {
		name               string
		locations          []models.Location
		unrecognizedLogger *ipinfo.Core
		expected           bool
	}{
		{
			name: "Location within 1000 km",
			locations: []models.Location{
				{City: "CityA", Region: "RegionA", Country: "CountryA", Location: "37.7749,-122.4194"}, // San Francisco
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           true,
		},
		{
			name: "Location beyond 1000 km",
			locations: []models.Location{
				{City: "CityB", Region: "RegionB", Country: "CountryB", Location: "40.7128,-74.0060"}, // New York
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           false,
		},
		{
			name: "Multiple Locations with one within 1000 km",
			locations: []models.Location{
				{City: "CityC", Region: "RegionC", Country: "CountryC", Location: "40.7128,-74.0060"},  // New York
				{City: "CityD", Region: "RegionD", Country: "CountryD", Location: "36.1699,-115.1398"}, // Las Vegas
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           true,
		},
		{
			name: "No Locations in Range",
			locations: []models.Location{
				{City: "CityE", Region: "RegionE", Country: "CountryE", Location: "51.5074,-0.1278"}, // London
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           false,
		},
		{
			name:               "Empty Locations Array",
			locations:          []models.Location{},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           true,
		},
		{
			name: "Empty Location String",
			locations: []models.Location{
				{City: "CityF", Region: "RegionF", Country: "CountryF", Location: ""}, // Empty location
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           false,                                       // Should skip and return false since there's no valid location within range
		},
		{
			name: "Invalid Location Format (empty string) for Unrecognized Logger",
			locations: []models.Location{
				{City: "CityG", Region: "RegionG", Country: "CountryG", Location: "40.7128,-74.0060"}, // New York
			},
			unrecognizedLogger: &ipinfo.Core{Location: ""}, // Empty location
			expected:           false,                      // Should skip and return false since the location format is invalid
		},
		{
			name: "Invalid Location Format (single coordinate)",
			locations: []models.Location{
				{City: "CityG", Region: "RegionG", Country: "CountryG", Location: "40.7128"}, // Incomplete location
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           false,                                       // Should skip and return false since the location format is invalid
		},
		{
			name: "Invalid Location Format (non-numeric coordinates)",
			locations: []models.Location{
				{City: "CityH", Region: "RegionH", Country: "CountryH", Location: "abc,xyz"}, // Non-numeric location
			},
			unrecognizedLogger: &ipinfo.Core{Location: "34.0522,-118.2437"}, // Los Angeles
			expected:           false,                                       // Should skip and return false since the location format is invalid
		},
		{
			name: "Invalid Location Format (non-numeric latitude) for Unrecognized Logger",
			locations: []models.Location{
				{City: "CityI", Region: "RegionI", Country: "CountryI", Location: "40.7128,-74.0060"}, // New York
			},
			unrecognizedLogger: &ipinfo.Core{Location: "abc,-118"}, // Non-numeric latitude
			expected:           false,                              // Should skip and return false since the location format is invalid
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Call the function under test
			result := database.IsLocationInRange(tt.locations, tt.unrecognizedLogger)

			// Assert the result
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestComputeAvailableSlots(t *testing.T) {
	tests := []struct {
		name          string
		bookings      []models.Booking
		dateOfBooking time.Time
		expectedSlots []models.Slot
	}{
		{
			name:          "No bookings",
			bookings:      []models.Booking{},
			dateOfBooking: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
			expectedSlots: []models.Slot{
				{
					Start: time.Date(2024, 8, 21, 8, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 17, 0, 0, 0, time.UTC),
				},
			},
		},
		{
			name: "Bookings cover the entire day",
			bookings: []models.Booking{
				{
					Start: time.Date(2024, 8, 21, 8, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 17, 0, 0, 0, time.UTC),
				},
			},
			dateOfBooking: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
			expectedSlots: []models.Slot{},
		},
		{
			name: "Bookings leave gaps",
			bookings: []models.Booking{
				{
					Start: time.Date(2024, 8, 21, 10, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 12, 0, 0, 0, time.UTC),
				},
				{
					Start: time.Date(2024, 8, 21, 14, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 15, 0, 0, 0, time.UTC),
				},
			},
			dateOfBooking: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
			expectedSlots: []models.Slot{
				{
					Start: time.Date(2024, 8, 21, 8, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 10, 0, 0, 0, time.UTC),
				},
				{
					Start: time.Date(2024, 8, 21, 12, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 14, 0, 0, 0, time.UTC),
				},
				{
					Start: time.Date(2024, 8, 21, 15, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 17, 0, 0, 0, time.UTC),
				},
			},
		},
		{
			name: "Bookings at boundaries",
			bookings: []models.Booking{
				{
					Start: time.Date(2024, 8, 21, 8, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 9, 0, 0, 0, time.UTC),
				},
				{
					Start: time.Date(2024, 8, 21, 16, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 17, 0, 0, 0, time.UTC),
				},
			},
			dateOfBooking: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
			expectedSlots: []models.Slot{
				{
					Start: time.Date(2024, 8, 21, 9, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 16, 0, 0, 0, time.UTC),
				},
			},
		},
		{
			name: "Booking ends after day",
			bookings: []models.Booking{
				{
					Start: time.Date(2024, 8, 21, 15, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 18, 0, 0, 0, time.UTC),
				},
			},
			dateOfBooking: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
			expectedSlots: []models.Slot{
				{
					Start: time.Date(2024, 8, 21, 8, 0, 0, 0, time.UTC),
					End:   time.Date(2024, 8, 21, 15, 0, 0, 0, time.UTC),
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := database.ComputeAvailableSlots(tt.bookings, tt.dateOfBooking)
			assert.ElementsMatch(t, tt.expectedSlots, got)
		})
	}
}

func TestGetAvailableSlots(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	// Test case: Database is nil
	mt.Run("Database is nil", func(mt *mtest.T) {
		// Define the appsession with a mock database
		appsession := &models.AppSession{}
		request := models.RequestAvailableSlots{
			RoomID: "RM101",
			Date:   time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
		}
		slots, err := database.GetAvailableSlots(ctx, appsession, request)
		assert.EqualError(t, err, "database is nil")
		assert.Nil(t, slots)
	})

	// Test case: Database find error
	mt.Run("Database find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Define the appsession with a mock database
		appsession := &models.AppSession{DB: mt.Client}

		request := models.RequestAvailableSlots{
			RoomID: "RM101",
			Date:   time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
		}
		slots, err := database.GetAvailableSlots(ctx, appsession, request)
		assert.EqualError(t, err, "find error")
		assert.Nil(t, slots)
	})

	// Test case: Successful retrieval
	mt.Run("Successful retrieval", func(mt *mtest.T) {
		bookings := []bson.D{
			{
				{Key: "roomID", Value: "RM101"},
				{Key: "date", Value: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC)},
				{Key: "start", Value: time.Date(2024, 8, 21, 10, 0, 0, 0, time.UTC)},
				{Key: "end", Value: time.Date(2024, 8, 21, 12, 0, 0, 0, time.UTC)},
			},
			{
				{Key: "roomID", Value: "RM101"},
				{Key: "date", Value: time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC)},
				{Key: "start", Value: time.Date(2024, 8, 21, 14, 0, 0, 0, time.UTC)},
				{Key: "end", Value: time.Date(2024, 8, 21, 15, 0, 0, 0, time.UTC)},
			},
		}
		expectedSlots := []models.Slot{
			{
				Start: time.Date(2024, 8, 21, 8, 0, 0, 0, time.UTC),
				End:   time.Date(2024, 8, 21, 10, 0, 0, 0, time.UTC),
			},
			{
				Start: time.Date(2024, 8, 21, 12, 0, 0, 0, time.UTC),
				End:   time.Date(2024, 8, 21, 14, 0, 0, 0, time.UTC),
			},
			{
				Start: time.Date(2024, 8, 21, 15, 0, 0, 0, time.UTC),
				End:   time.Date(2024, 8, 21, 17, 0, 0, 0, time.UTC),
			},
		}

		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".RoomBooking", mtest.FirstBatch, bookings[0]))
		mt.AddMockResponses(mtest.CreateCursorResponse(0, configs.GetMongoDBName()+".RoomBooking", mtest.NextBatch, bookings[1]))

		appsession := &models.AppSession{DB: mt.Client}

		request := models.RequestAvailableSlots{
			RoomID: "RM101",
			Date:   time.Date(2024, 8, 21, 0, 0, 0, 0, time.UTC),
		}
		slots, err := database.GetAvailableSlots(ctx, appsession, request)
		assert.NoError(t, err)
		assert.ElementsMatch(t, expectedSlots, slots)
	})
}

func TestGetNotificationSettings(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Database is nil", func(mt *mtest.T) {
		// Call the function under test with a nil database
		appSession := &models.AppSession{}
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		emptySettings := models.NotificationsRequest{}

		// Validate the result
		assert.Error(mt, err)
		assert.Equal(mt, emptySettings, result)
		assert.Equal(mt, "database is nil", err.Error())
	})

	mt.Run("Retrieve notifications settings with invites on and booking reminder off successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "on",
			BookingReminder: "off",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "notifications", Value: bson.D{
				{Key: "invites", Value: true},
				{Key: "bookingReminder", Value: false},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve notifications settings with invites off and booking reminder off successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "off",
			BookingReminder: "off",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "notifications", Value: bson.D{
				{Key: "invites", Value: false},
				{Key: "bookingReminder", Value: false},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve notifications settings with invites off and booking reminder on successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "off",
			BookingReminder: "on",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "notifications", Value: bson.D{
				{Key: "invites", Value: false},
				{Key: "bookingReminder", Value: true},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve notifications settings with invites on and booking reminder on successfully", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "on",
			BookingReminder: "on",
		}

		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "notifications", Value: bson.D{
				{Key: "invites", Value: true},
				{Key: "bookingReminder", Value: true},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)
	})

	mt.Run("Retrieve security settings with invites on and booking reminder off successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "on",
			BookingReminder: "off",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         true,
				BookingReminder: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Retrieve security settings with invites off and booking reminder off successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "off",
			BookingReminder: "off",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Retrieve security settings with invites off and booking reminder on successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "off",
			BookingReminder: "on",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Retrieve security settings with invites on and booking reminder on successfully from cache", func(mt *mtest.T) {
		// Add a mock response for a successful find
		expectedSettings := models.NotificationsRequest{
			Email:           "test@example.com",
			Invites:         "on",
			BookingReminder: "on",
		}

		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         true,
				BookingReminder: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(mt, err)
		assert.NotNil(mt, result)
		assert.Equal(mt, expectedSettings, result)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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

		emptySettings := models.NotificationsRequest{}

		// Call the function under test
		result, err := database.GetNotificationSettings(ctx, appSession, "test@example.com")

		// Validate the result
		assert.Error(mt, err)
		assert.Equal(mt, emptySettings, result)
		assert.Contains(mt, err.Error(), "find error")
	})
}

func TestUpdateNotificationSettings(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		err := database.UpdateNotificationSettings(ctx, appsession, models.NotificationsRequest{})

		// Validate the result
		assert.Error(t, err)
	})

	mt.Run("Test set invites on successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.NotificationsRequest{
			Email:   "test@example.com",
			Invites: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateNotificationSettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set invites off successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.NotificationsRequest{
			Email:   "test@example.com",
			Invites: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateNotificationSettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set booking reminder on successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.NotificationsRequest{
			Email:           "test@example.com",
			BookingReminder: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateNotificationSettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set booking reminder off successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		security := models.NotificationsRequest{
			Email:           "test@example.com",
			BookingReminder: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateNotificationSettings(ctx, appsession, security)

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Test set invites on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		settings := models.NotificationsRequest{
			Email:   "test@example.com",
			Invites: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Notifications: models.Notifications{
				Invites:         true,
				BookingReminder: false,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateNotificationSettings(ctx, appsession, settings)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, true, userB.Notifications.Invites)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set invites off successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         true,
				BookingReminder: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		settings := models.NotificationsRequest{
			Email:   "test@example.com",
			Invites: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: false,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateNotificationSettings(ctx, appsession, settings)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, false, userB.Notifications.Invites)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set booking reminder on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: false,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		settings := models.NotificationsRequest{
			Email:           "test@example.com",
			BookingReminder: "on",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: true,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateNotificationSettings(ctx, appsession, settings)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, true, userB.Notifications.BookingReminder)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Test set booking reminder off on successfully in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		settings := models.NotificationsRequest{
			Email:           "test@example.com",
			BookingReminder: "off",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		updatedUser := models.User{
			Email: user.Email,
			Notifications: models.Notifications{
				Invites:         false,
				BookingReminder: false,
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))
		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.UpdateNotificationSettings(ctx, appsession, settings)

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(updatedUserData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User
		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		assert.Equal(t, false, userB.Notifications.BookingReminder)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Update Error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		settings := models.NotificationsRequest{
			Email: "test@example.com",
		}

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.UpdateNotificationSettings(ctx, appsession, settings)

		// Validate the result
		assert.Error(t, err)
	})
}

func TestAddImageIDToRoom(t *testing.T) {
	// Set Gin mode to match your configuration
	gin.SetMode(configs.GetGinRunMode())

	// Create a new mtest instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("database is nil", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: nil,
		}

		err := database.AddImageIDToRoom(ctx, appsession, "room1", "image1")
		assert.EqualError(t, err, "database is nil")
	})

	mt.Run("update image ID successful", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		// Mock the UpdateOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		err := database.AddImageIDToRoom(ctx, appsession, "room1", "image1")
		assert.NoError(t, err)
	})

	mt.Run("update image ID failure", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		// Mock the UpdateOne operation to return an error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		err := database.AddImageIDToRoom(ctx, appsession, "room1", "image1")
		assert.EqualError(t, err, "update error")
	})
}

func TestDeleteImageIDFromRoom(t *testing.T) {
	// Set Gin mode to match your configuration
	gin.SetMode(configs.GetGinRunMode())

	// Create a new mtest instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("database is nil", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: nil,
		}

		err := database.DeleteImageIDFromRoom(ctx, appsession, "room1", "image1")
		assert.EqualError(t, err, "database is nil")
	})

	mt.Run("delete image ID successful", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		// Mock the UpdateOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		err := database.DeleteImageIDFromRoom(ctx, appsession, "room1", "image1")
		assert.NoError(t, err)
	})

	mt.Run("delete image ID failure", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		// Mock the UpdateOne operation to return an error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "delete error",
		}))

		err := database.DeleteImageIDFromRoom(ctx, appsession, "room1", "image1")
		assert.EqualError(t, err, "delete error")
	})
}

func TestAddRoom(t *testing.T) {
	// Set Gin mode to match your configuration
	gin.SetMode(configs.GetGinRunMode())

	// Create a new mtest instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("database is nil", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: nil,
		}

		rroom := models.RequestRoom{
			RoomID:       "room1",
			RoomNo:       "101",
			FloorNo:      "1",
			MinOccupancy: 1,
			MaxOccupancy: 4,
			Description:  "Test Room",
			RoomName:     "Test Room Name",
		}

		_, err := database.AddRoom(ctx, appsession, rroom)
		assert.EqualError(t, err, "database is nil")
	})

	mt.Run("room already exists", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		rroom := models.RequestRoom{
			RoomID:       "room1",
			RoomNo:       "101",
			FloorNo:      "1",
			MinOccupancy: 1,
			MaxOccupancy: 4,
			Description:  "Test Room",
			RoomName:     "Test Room Name",
		}

		// Mock the FindOne operation to return a matching room
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Rooms", mtest.FirstBatch, bson.D{
			{Key: "roomId", Value: rroom.RoomID},
			{Key: "roomNo", Value: rroom.RoomNo},
		}))

		_, err := database.AddRoom(ctx, appsession, rroom)
		assert.EqualError(t, err, "room already exists")
	})

	mt.Run("add room successful", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		rroom := models.RequestRoom{
			RoomID:       "room2",
			RoomNo:       "102",
			FloorNo:      "1",
			MinOccupancy: 1,
			MaxOccupancy: 4,
			Description:  "Another Test Room",
			RoomName:     "Another Test Room Name",
		}

		// Mock the FindOne operation to return no matching room (room does not exist)
		mt.AddMockResponses(mtest.CreateCursorResponse(0, configs.GetMongoDBName()+".Rooms", mtest.FirstBatch))

		// Mock the InsertOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		id, err := database.AddRoom(ctx, appsession, rroom)
		assert.NoError(t, err)
		assert.NotEmpty(t, id)
	})

	mt.Run("add room failure", func(mt *mtest.T) {
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		rroom := models.RequestRoom{
			RoomID:       "room3",
			RoomNo:       "103",
			FloorNo:      "1",
			MinOccupancy: 1,
			MaxOccupancy: 4,
			Description:  "Third Test Room",
			RoomName:     "Third Test Room Name",
		}

		// Mock the FindOne operation to return no matching room (room does not exist)
		mt.AddMockResponses(mtest.CreateCursorResponse(0, configs.GetMongoDBName()+".Rooms", mtest.FirstBatch))

		// Mock the InsertOne operation to return an error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		_, err := database.AddRoom(ctx, appsession, rroom)
		assert.EqualError(t, err, "duplicate key error")
	})
}

func TestCheckIfUserHasMFAenabled(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		res, err := database.CheckIfUserHasMFAEnabled(ctx, appsession, "test@example.com")

		// Validate the result
		assert.False(t, res)
		assert.Error(t, err)
	})

	mt.Run("Check from database", func(mt *mtest.T) {
		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "security", Value: bson.D{
				{Key: "mfa", Value: true},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		res, err := database.CheckIfUserHasMFAEnabled(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, res)
	})

	mt.Run("Check from cache", func(mt *mtest.T) {
		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				MFA: true,
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		res1, err := database.CheckIfUserHasMFAEnabled(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(t, err)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())

		assert.True(t, res1)
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
		res, err := database.CheckIfUserHasMFAEnabled(ctx, appSession, "test@example.com")

		// Validate the result
		assert.Error(t, err)
		assert.False(t, res)
		assert.Contains(t, err.Error(), "find error")
	})
}

func TestGetUserCredentials(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		res, err := database.GetUserCredentials(ctx, appsession, "test@example.com")

		// Validate the result
		assert.Empty(t, res)
		assert.Error(t, err)
	})

	mt.Run("Get user credentials from database", func(mt *mtest.T) {
		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			{Key: "security", Value: bson.D{
				{Key: "credentials", Value: bson.D{
					//stored as bytes[]
					{Key: "id", Value: primitive.Binary{Data: []byte("testID")}},
					{Key: "publicKey", Value: primitive.Binary{Data: []byte("testPublicKey")}},
					{Key: "attestationType", Value: "testAttestationType"},
				},
				},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		res, err := database.GetUserCredentials(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(t, err)
		assert.NotEmpty(t, res)
	})

	mt.Run("Get user credentials from cache", func(mt *mtest.T) {
		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				Credentials: webauthn.Credential{
					ID:              []byte("testID"),
					PublicKey:       []byte("testPublicKey"),
					AttestationType: "testAttestationType",
				},
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		res1, err := database.GetUserCredentials(ctx, appSession, "test@example.com")

		// Validate the result
		assert.NoError(t, err)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())

		assert.NotEmpty(t, res1)
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
		res, err := database.GetUserCredentials(ctx, appSession, "test@example.com")

		// Validate the result
		assert.Error(t, err)
		assert.Empty(t, res)

		assert.Contains(t, err.Error(), "find error")

	})
}

func TestAddUserCredentials(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		err := database.AddUserCredential(ctx, appsession, "test@example.com", &webauthn.Credential{})

		// Validate the result
		assert.Error(t, err)
	})

	mt.Run("Add user credentials successfully", func(mt *mtest.T) {
		// Mock the UpdateOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		err := database.AddUserCredential(ctx, appSession, "test@example.com", &webauthn.Credential{
			ID:              []byte("testID"),
			PublicKey:       []byte("testPublicKey"),
			AttestationType: "testAttestationType",
		})

		// Validate the result
		assert.NoError(t, err)
	})

	mt.Run("Add user credentials successfully in cache", func(mt *mtest.T) {
		// Mock the UpdateOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			Security: models.Security{
				Credentials: webauthn.Credential{
					ID:              []byte("testID"),
					PublicKey:       []byte("testPublicKey"),
					AttestationType: "testAttestationType",
				},
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// call the function under test
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// Validate the result
		assert.NoError(t, err)

		// updated user
		updatedUser := models.User{
			Email: "test@example.com",
			Security: models.Security{
				Credentials: webauthn.Credential{
					ID:              []byte("newtestID"),
					PublicKey:       []byte("newtestPublicKey"),
					AttestationType: "newtestAttestationType",
				},
			},
		}

		// marshal updated user
		updatedUserData, err := bson.Marshal(updatedUser)

		assert.Nil(t, err)

		// mock expect get and set
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		mock.ExpectSet(cache.UserKey(user.Email), updatedUserData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(updatedUserData))

		err = database.AddUserCredential(ctx, appSession, "test@example.com", &webauthn.Credential{
			ID:              []byte("newtestID"),
			PublicKey:       []byte("newtestPublicKey"),
			AttestationType: "newtestAttestationType",
		})

		// Validate the result
		assert.NoError(t, err)

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Assert that the user is in the Cache
		res1 := Cache.Get(context.Background(), cache.UserKey(user.Email))

		userA, err := res1.Bytes()

		assert.Nil(t, err)

		// unmarshal user
		var userB models.User

		if err := bson.Unmarshal(userA, &userB); err != nil {
			t.Fatal(err)
		}

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Add user credentials failure", func(mt *mtest.T) {
		// Mock the UpdateOne operation to return an error
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		err := database.AddUserCredential(ctx, appSession, "test@example.com", &webauthn.Credential{
			ID:              []byte("testID"),
			PublicKey:       []byte("testPublicKey"),
			AttestationType: "testAttestationType",
		})

		// Validate the result
		assert.EqualError(t, err, "update error")
	})
}

func TestIsIPWithinRange(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		res := database.IsIPWithinRange(ctx, appsession, "test@example.com", &ipinfo.Core{Location: "37.7749,-122.4194"})

		// Validate the result
		assert.False(t, res)
	})

	mt.Run("IP within range", func(mt *mtest.T) {
		// insert user with location for firstbatch
		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			// knownLocations is an array of locations
			{Key: "knownLocations", Value: bson.A{
				bson.D{
					{Key: "city", Value: "CityA"},
					{Key: "region", Value: "RegionA"},
					{Key: "country", Value: "CountryA"},
					{Key: "location", Value: "37.7749,-122.4194"}, // San Francisco
				},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		res := database.IsIPWithinRange(ctx, appSession, "test@example.com", &ipinfo.Core{Location: "34.0522,-118.2437"}) // Los Angeles

		// Validate the result
		assert.True(t, res)
	})

	mt.Run("IP not within range", func(mt *mtest.T) {
		// insert user with location for firstbatch
		firstBatch := mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: "test@example.com"},
			// knownLocations is an array of locations
			{Key: "knownLocations", Value: bson.A{
				bson.D{
					{Key: "city", Value: "CityA"},
					{Key: "region", Value: "RegionA"},
					{Key: "country", Value: "CountryA"},
					{Key: "location", Value: "37.7749,-122.4194"}, // San Francisco
				},
			},
			},
		})

		mt.AddMockResponses(firstBatch)

		// Initialize the app session with the mock client
		appSession := &models.AppSession{
			DB: mt.Client,
		}

		// Call the function under test
		res := database.IsIPWithinRange(ctx, appSession, "test@example.com", &ipinfo.Core{Location: "40.7128,-74.0060"}) // New York

		// Validate the result
		assert.False(t, res)
	})

	mt.Run("IP in range in cache", func(mt *mtest.T) {
		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			KnownLocations: []models.Location{
				{
					City:     "CityA",
					Region:   "RegionA",
					Country:  "CountryA",
					Location: "37.7749,-122.4194",
				},
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		res1 := database.IsIPWithinRange(ctx, appSession, "test@example.com", &ipinfo.Core{Location: "34.0522,-118.2437"}) // Los Angeles
		assert.True(t, res1)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("IP not in range in cache", func(mt *mtest.T) {
		Cache, mock := redismock.NewClientMock()

		user := models.User{
			Email: "test@example.com",
			KnownLocations: []models.Location{
				{
					City:     "CityA",
					Region:   "RegionA",
					Country:  "CountryA",
					Location: "37.7749,-122.4194",
				},
			},
		}

		// add user to Cache
		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appSession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		// Call the function under test
		res1 := database.IsIPWithinRange(ctx, appSession, "test@example.com", &ipinfo.Core{Location: "40.7128,-74.0060"}) // New York
		assert.False(t, res1)

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
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
		res := database.IsIPWithinRange(ctx, appSession, "test@example.com", &ipinfo.Core{Location: "37.7749,-122.4194"})

		// Validate the result
		assert.False(t, res)
	})
}

func TestCapTimeRange(t *testing.T) {
	// Test Case 1: Before 8 AM
	t.Run("Before 8 AM", func(t *testing.T) {
		_ = database.CapTimeRange()
	})

	// Test Case 2: After 5 PM
	t.Run("After 5 PM", func(t *testing.T) {
		_ = database.CapTimeRange()
	})

	// Test Case 3: Between 8 AM and 5 PM
	t.Run("Between 8 AM and 5 PM", func(t *testing.T) {
		_ = database.CapTimeRange()
	})
}

func TestCompareAndReturnTime(t *testing.T) {
	tests := []struct {
		name     string
		oldTime  time.Time
		newTime  time.Time
		expected time.Time
	}{
		{
			name:     "NewTime is after 5 PM on same date",
			oldTime:  time.Date(2024, 9, 1, 10, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 1, 18, 0, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 17, 0, 0, 0, time.UTC),
		},
		{
			name:     "NewTime is exactly at 5 PM on same date",
			oldTime:  time.Date(2024, 9, 1, 9, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 1, 17, 0, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 17, 0, 0, 0, time.UTC),
		},
		{
			name:     "NewTime is before 5 PM on same date",
			oldTime:  time.Date(2024, 9, 1, 8, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 1, 15, 30, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 15, 30, 0, 0, time.UTC),
		},
		{
			name:     "NewTime is on next day",
			oldTime:  time.Date(2024, 9, 1, 12, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 2, 10, 0, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 17, 0, 0, 0, time.UTC),
		},
		{
			name:     "NewTime is several days after oldTime",
			oldTime:  time.Date(2024, 9, 1, 14, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 5, 9, 0, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 17, 0, 0, 0, time.UTC),
		},
		{
			name:     "NewTime is before oldTime's date",
			oldTime:  time.Date(2024, 9, 2, 14, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 1, 16, 0, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 16, 0, 0, 0, time.UTC),
		},
		{
			name:     "NewTime is before oldTime's date and after 5 PM",
			oldTime:  time.Date(2024, 9, 2, 14, 0, 0, 0, time.UTC),
			newTime:  time.Date(2024, 9, 1, 18, 30, 0, 0, time.UTC),
			expected: time.Date(2024, 9, 1, 18, 30, 0, 0, time.UTC),
		},
		{
			name:     "OldTime and NewTime on same date with different time zones",
			oldTime:  time.Date(2024, 9, 1, 10, 0, 0, 0, time.FixedZone("PST", -8*3600)),
			newTime:  time.Date(2024, 9, 1, 16, 30, 0, 0, time.FixedZone("EST", -5*3600)),
			expected: time.Date(2024, 9, 1, 16, 30, 0, 0, time.FixedZone("EST", -5*3600)),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := database.CompareAndReturnTime(tt.oldTime, tt.newTime)
			if !result.Equal(tt.expected) {
				t.Errorf("CompareAndReturnTime()\nGot:      %v\nExpected: %v", result, tt.expected)
			}
		})
	}
}

func TestIsWeekend(t *testing.T) {
	tests := []struct {
		name     string
		date     time.Time
		expected bool
	}{
		{
			name:     "Saturday",
			date:     time.Date(2024, 9, 7, 0, 0, 0, 0, time.UTC),
			expected: true,
		},
		{
			name:     "Sunday",
			date:     time.Date(2024, 9, 8, 0, 0, 0, 0, time.UTC),
			expected: true,
		},
		{
			name:     "Weekday - Monday",
			date:     time.Date(2024, 9, 9, 0, 0, 0, 0, time.UTC),
			expected: false,
		},
		{
			name:     "Weekday - Friday",
			date:     time.Date(2024, 9, 6, 0, 0, 0, 0, time.UTC),
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := database.IsWeekend(tt.date)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestWeekOfTheYear(t *testing.T) {
	tests := []struct {
		name     string
		date     time.Time
		expected int
	}{
		{
			name:     "First week of the year",
			date:     time.Date(2024, 1, 2, 0, 0, 0, 0, time.UTC),
			expected: 1,
		},
		{
			name:     "Middle of the year",
			date:     time.Date(2024, 6, 15, 0, 0, 0, 0, time.UTC),
			expected: 24,
		},
		{
			name:     "Last week of the year",
			date:     time.Date(2024, 12, 31, 0, 0, 0, 0, time.UTC),
			expected: 1, // Note: ISO week starts from 1 again if Jan 1st is a Monday.
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := database.WeekOfTheYear(tt.date)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestDayOfTheWeek(t *testing.T) {
	tests := []struct {
		name     string
		date     time.Time
		expected string
	}{
		{
			name:     "Monday",
			date:     time.Date(2024, 9, 9, 0, 0, 0, 0, time.UTC),
			expected: "Monday",
		},
		{
			name:     "Wednesday",
			date:     time.Date(2024, 9, 11, 0, 0, 0, 0, time.UTC),
			expected: "Wednesday",
		},
		{
			name:     "Friday",
			date:     time.Date(2024, 9, 13, 0, 0, 0, 0, time.UTC),
			expected: "Friday",
		},
		{
			name:     "Sunday",
			date:     time.Date(2024, 9, 8, 0, 0, 0, 0, time.UTC),
			expected: "Sunday",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := database.DayOfTheWeek(tt.date)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestMonth(t *testing.T) {
	tests := []struct {
		name     string
		date     time.Time
		expected int
	}{
		{
			name:     "January",
			date:     time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC),
			expected: 1,
		},
		{
			name:     "June",
			date:     time.Date(2024, 6, 15, 0, 0, 0, 0, time.UTC),
			expected: 6,
		},
		{
			name:     "December",
			date:     time.Date(2024, 12, 25, 0, 0, 0, 0, time.UTC),
			expected: 12,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := database.Month(tt.date)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestToggleOnsite(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	email := "test@example.com"

	mt.Run("Nil database", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{}
		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{})

		// Validate the result
		assert.Error(t, err)
		assert.EqualError(t, err, "database is nil")
	})

	mt.Run("Invalid status", func(mt *mtest.T) {
		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}
		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			OnSite: "Invalid",
		})

		// Validate the result
		assert.Error(t, err)
		assert.EqualError(t, err, "invalid status")
	})

	mt.Run("User is already on site", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "onSite", Value: true},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "Yes",
		})

		// Validate the result
		assert.Error(t, err)
		assert.EqualError(t, err, "user is already onsite")
	})

	mt.Run("User is already off site", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "onSite", Value: false},
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "No",
		})

		// Validate the result
		assert.Error(t, err)
		assert.EqualError(t, err, "user is already offsite")
	})

	mt.Run("User is already on site in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		// add user to Cache
		user := models.User{
			Email:  email,
			OnSite: true,
		}

		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		err = database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "Yes",
		})

		// Validate the result
		assert.Error(t, err)
		assert.EqualError(t, err, "user is already onsite")

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("User is already off site in cache", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		Cache, mock := redismock.NewClientMock()

		// add user to Cache
		user := models.User{
			Email:  email,
			OnSite: false,
		}

		userData, err := bson.Marshal(user)

		assert.Nil(t, err)

		// Mock the Set operation
		mock.ExpectSet(cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userData))

		// set the user in the Cache
		res := Cache.Set(context.Background(), cache.UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

		assert.Nil(t, res.Err())

		// Call the function under test
		appsession := &models.AppSession{
			DB:    mt.Client,
			Cache: Cache,
		}

		// mock expect get
		mock.ExpectGet(cache.UserKey(user.Email)).SetVal(string(userData))

		err = database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "No",
		})

		// Validate the result
		assert.Error(t, err)
		assert.EqualError(t, err, "user is already offsite")

		// Ensure all expectations are met
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	mt.Run("Find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "Yes",
		})

		// Validate the result
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "find error")
	})

	mt.Run("Update error", func(mt *mtest.T) {
		// mock success find followed by an update error
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "onSite", Value: false},
		}))
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "Yes",
		})

		// Validate the result
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "update error")
	})

	mt.Run("Toggle onsite to true and add office hours successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, configs.GetMongoDBName()+".Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "onSite", Value: false},
		}))

		// Mock the UpdateOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Mock the InsertOne operation as successful
		mt.AddMockResponses(mtest.CreateSuccessResponse())
		// mongo db is insane. this extra response is needed to avoid "no responses remaining" error
		// however it shouldn't have been necessary since we are only performing 3 operations
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		appsession := &models.AppSession{
			DB: mt.Client,
		}

		err := database.ToggleOnsite(ctx, appsession, models.RequestOnsite{
			Email:  email,
			OnSite: "Yes",
		})

		// Validate the result
		assert.NoError(t, err)
	})
}
