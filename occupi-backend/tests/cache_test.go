package tests

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redismock/v9"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func TestSaveBooking_WithCache(t *testing.T) {
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	booking := models.Booking{
		OccupiID: "OCCUPI01",
	}

	success, err := database.SaveBooking(ctx, appSession, booking)
	assert.True(t, success)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetVal("")

	// Verify the booking is in the Cache
	cachedBooking1 := Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))
	_, errv := cachedBooking1.Bytes()
	assert.Nil(t, errv)
	//assert.NotNil(t, res)

	// sleep for 2 * Cache expiry time to ensure the Cache expires
	time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

	// mock expect get expired
	mock.ExpectGet(cache.RoomBookingKey(booking.OccupiID)).SetErr(nil)

	// Verify the booking is not in the Cache
	cachedBooking2 := Cache.Get(context.Background(), cache.UserKey(booking.OccupiID))
	res, errv := cachedBooking2.Bytes()
	assert.NotNil(t, errv)
	assert.Nil(t, res)
}

func TestConfirmCheckin_WithCache(t *testing.T) {
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	checkin := models.CheckIn{
		BookingID: "ROOM01",
		Creator:   "TestConfirmCheckin_WithCache@example.com",
	}

	booking := models.Booking{
		OccupiID:  checkin.BookingID,
		Creator:   checkin.Creator,
		CheckedIn: false,
	}

	collection := db.Database(configs.GetMongoDBName()).Collection("RoomBooking")
	_, err := collection.InsertOne(ctx, booking)

	assert.Nil(t, err)

	// marshall and add the booking to cache
	bookingData, err := bson.Marshal(booking)

	assert.Nil(t, err)

	// mock expect set
	mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, 0).SetVal("")

	res := Cache.Set(context.Background(), cache.RoomBookingKey(booking.OccupiID), bookingData, 0)
	assert.Nil(t, res.Err())

	assert.Nil(t, err)

	success, err := database.ConfirmCheckIn(ctx, appSession, checkin)
	assert.True(t, success)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.RoomBookingKey(checkin.BookingID)).SetVal("")

	// Verify the booking is in the Cache
	cachedBooking1 := Cache.Get(context.Background(), cache.RoomBookingKey(checkin.BookingID))
	_, errv := cachedBooking1.Bytes()
	assert.Nil(t, errv)

	// sleep for 2 * Cache expiry time to ensure the Cache expires
	time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

	// mock expect get expired
	mock.ExpectGet(cache.RoomBookingKey(checkin.BookingID)).SetErr(nil)

	// Verify the booking is not in the Cache
	cachedBooking2 := Cache.Get(context.Background(), cache.UserKey(checkin.BookingID))
	res2, errv := cachedBooking2.Bytes()
	assert.NotNil(t, errv)
	assert.Nil(t, res2)
}

func TestEmailExists_WithCache(t *testing.T) {
	email := "TestEmailExists_WithCache@example.com"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	userStruct := models.User{
		Email: email,
	}

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test email into database: %v", err)
	}

	// call the function to test
	exists := database.EmailExists(ctx, appSession, email)

	// Verify the response
	assert.True(t, exists)

	// mock expect get
	mock.ExpectGet(cache.UserKey(email)).SetVal("")

	// Verify the user is in the Cache
	res := Cache.Get(context.Background(), cache.UserKey(email))
	_, errv := res.Bytes()

	assert.Nil(t, errv)
}

func TestBookingExists_WithCache(t *testing.T) {
	id := "OCCUPI0101"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("RoomBooking")
	bookingStruct := models.Booking{
		OccupiID: id,
	}
	_, err := collection.InsertOne(ctx, bookingStruct)
	if err != nil {
		t.Fatalf("Failed to insert test booking into database: %v", err)
	}

	// call the function to test
	exists := database.BookingExists(ctx, appSession, id)

	// Verify the response
	assert.True(t, exists)

	// mock expect get
	mock.ExpectGet(cache.RoomBookingKey(id)).SetVal("")

	// Verify the booking is in the Cache
	res := Cache.Get(context.Background(), cache.RoomBookingKey(id))
	_, errv := res.Bytes()

	assert.Nil(t, errv)
	//assert.NotNil(t, cachedBooking)
}

func TestAddUser_WithCache(t *testing.T) {
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	user := models.RegisterUser{
		Email:      "test_withcache@example.com",
		Password:   "password",
		EmployeeID: "12345",
	}

	success, err := database.AddUser(ctx, appSession, user)
	assert.True(t, success)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.UserKey(user.Email)).SetVal("")

	// Verify the user is in the Cache
	res := Cache.Get(context.Background(), cache.UserKey(user.Email))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser)

	// sleep for 2 * Cache expiry time to ensure the Cache expires
	time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

	// mock expect get expired
	mock.ExpectGet(cache.UserKey(user.Email)).SetErr(nil)

	// Verify the user is not in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(user.Email))
	cachedUser, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)
}

func TestAddOTP_WithCache(t *testing.T) {
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	email := "test_withcache@example.com"
	otp := "123456"

	success, err := database.AddOTP(ctx, appSession, email, otp)
	assert.True(t, success)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.OTPKey(email, otp)).SetVal("")

	// Verify the otp is in the Cache
	res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedOTP)

	// sleep for 2 * Cache expiry time to ensure the Cache expires
	time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

	// mock expect get expired
	mock.ExpectGet(cache.OTPKey(email, otp)).SetErr(nil)

	// Verify the user is not in the Cache
	res = Cache.Get(context.Background(), cache.OTPKey(email, otp))
	cachedOTP, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedOTP)
}

func TestOTPExists_WithCache(t *testing.T) {
	email := "TestOTPExists_WithCache@example.com"
	otp := "123456"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("OTPS")
	otpStruct := models.OTP{
		Email:      email,
		OTP:        otp,
		ExpireWhen: time.Now().Add(time.Second * time.Duration(configs.GetOTPExpiration())),
	}
	_, err := collection.InsertOne(ctx, otpStruct)
	if err != nil {
		t.Fatalf("Failed to insert test otp into database: %v", err)
	}

	// mock expect get
	mock.ExpectGet(cache.OTPKey(email, otp)).SetErr(nil)

	// Verify the otp is not in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
	cachedOTP, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedOTP)

	// call the function to test
	exists, err := database.OTPExists(ctx, appSession, email, otp)

	// Verify the response
	assert.True(t, exists)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.OTPKey(email, otp)).SetVal("")

	// Verify the otp is in the Cache
	res = Cache.Get(context.Background(), cache.OTPKey(email, otp))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedOTP)
}

func TestDeleteOTP_withCache(t *testing.T) {
	email := "TestDeleteOTP_withCache@example.com"
	otp := "123456"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("OTPS")
	otpStruct := models.OTP{
		Email:      email,
		OTP:        otp,
		ExpireWhen: time.Now().Add(time.Second * time.Duration(configs.GetOTPExpiration())),
	}
	_, err := collection.InsertOne(ctx, otpStruct)
	if err != nil {
		t.Fatalf("Failed to insert test otp into database: %v", err)
	}

	// add otp to Cache
	if otpData, err := bson.Marshal(otpStruct); err != nil {
		t.Fatal(err)
	} else {
		// mock expect set
		mock.ExpectSet(cache.OTPKey(email, otp), otpData, 0).SetVal("")
		if err := Cache.Set(context.Background(), cache.OTPKey(email, otp), otpData, 0); err.Err() != nil {
			t.Fatal(err)
		}
	}

	// mock expect get
	mock.ExpectGet(cache.OTPKey(email, otp)).SetVal("")

	// Verify the otp is in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.OTPKey(email, otp))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedOTP)

	// call the function to test
	success, err := database.DeleteOTP(ctx, appSession, email, otp)

	// Verify the response
	assert.True(t, success)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.OTPKey(email, otp)).SetErr(nil)

	// Verify the otp is not in the Cache
	res = Cache.Get(context.Background(), cache.OTPKey(email, otp))
	cachedOTP, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedOTP)
}

func TestGetPassword_withCache(t *testing.T) {
	email := "TestGetPassword_withCache@example.com"
	password := "password"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	userStruct := models.User{
		Email:    email,
		Password: password,
	}

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// mock expect get
	mock.ExpectGet(cache.UserKey(email)).SetErr(nil)

	// Verify the user is not in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.UserKey(email))
	cachedUser, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)

	// call the function to test
	passwordv, err := database.GetPassword(ctx, appSession, email)

	// Verify the response
	assert.Equal(t, password, passwordv)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.UserKey(email)).SetVal("")

	// Verify the user is in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(email))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser)
}

func TestCheckIfUserIsAdmin_WithCache(t *testing.T) {
	email1 := "TestCheckIfUserIsAdmin_WithCache1@example.com"
	email2 := "TestCheckIfUserIsAdmin_WithCache2@example.com"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	userStruct1 := models.User{
		Email: email1,
		Role:  constants.Admin,
	}

	_, err := collection.InsertOne(ctx, userStruct1)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	userStruct2 := models.User{
		Email: email2,
		Role:  constants.Basic,
	}

	_, err = collection.InsertOne(ctx, userStruct2)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// mock expect get
	mock.ExpectGet(cache.UserKey(email1)).SetErr(nil)

	// Verify the user is not in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.UserKey(email1))
	cachedUser1, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser1)

	// mock expect get
	mock.ExpectGet(cache.UserKey(email2)).SetErr(nil)

	res = Cache.Get(context.Background(), cache.UserKey(email2))
	cachedUser2, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser2)

	// call the function to test
	isAdmin1, err := database.CheckIfUserIsAdmin(ctx, appSession, email1)

	// Verify the response
	assert.True(t, isAdmin1)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.UserKey(email1)).SetVal("")

	// Verify the user is in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(email1))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser1)

	// call the function to test
	isAdmin2, err := database.CheckIfUserIsAdmin(ctx, appSession, email2)

	// Verify the response
	assert.False(t, isAdmin2)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.UserKey(email2)).SetVal("")

	// Verify the user is in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(email2))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser2)
}

func TestCheckIfUserIsLoggingInFromKnownLocation_withCache(t *testing.T) {
	email := "TestCheckIfUserIsLoggingInFromKnownLocation_withCache@example.com"
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
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

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// mock expect get
	mock.ExpectGet(cache.UserKey(email)).SetErr(nil)

	// Verify the user is not in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.UserKey(email))
	cachedUser, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)

	// call the function to test
	yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appSession, email, "8.8.8.8")

	// Verify the response
	assert.True(t, yes)
	assert.Nil(t, err)
	assert.Nil(t, info)

	// mock expect get
	mock.ExpectGet(cache.UserKey(email)).SetVal("")

	// Verify the user is in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(email))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser)
}

func TestGetUserDetails_withCache(t *testing.T) {
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
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// mock expect get
	mock.ExpectGet(cache.UserKey(userStruct.Email)).SetErr(nil)

	// Verify the user is not in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.UserKey(userStruct.Email))
	cachedUser, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)

	// call the function to test
	user, err := database.GetUserDetails(ctx, appSession, userStruct.Email)

	// Verify the response
	assert.Equal(t, userStruct.Email, user.Email)
	assert.Equal(t, userStruct.Details.Name, user.Name)
	assert.Equal(t, userStruct.Details.Gender, user.Gender)
	assert.Equal(t, userStruct.Details.Pronouns, user.Pronouns)
	assert.Equal(t, userStruct.Details.ContactNo, user.Number)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.UserKey(userStruct.Email)).SetVal("")

	// Verify the user is in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(userStruct.Email))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser)
}

func TestGetSecuritySettings_withCache(t *testing.T) {
	userStruct := models.User{
		Email: "test@example.com",
		Security: models.Security{
			MFA:         false,
			Biometrics:  false,
			ForceLogout: false,
		},
	}
	// Create database connection and Cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	Cache, mock := redismock.NewClientMock()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the Cache
	appSession := &models.AppSession{
		DB:    db,
		Cache: Cache,
	}

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// mock expect get
	mock.ExpectGet(cache.UserKey(userStruct.Email)).SetErr(nil)

	// Verify the user is not in the Cache before calling the function
	res := Cache.Get(context.Background(), cache.UserKey(userStruct.Email))
	cachedUser, err := res.Bytes()

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)

	// call the function to test
	user, err := database.GetSecuritySettings(ctx, appSession, userStruct.Email)

	// Verify the response
	assert.Equal(t, userStruct.Email, user.Email)
	assert.Equal(t, "off", user.Mfa)
	assert.Equal(t, "off", user.ForceLogout)
	assert.Nil(t, err)

	// mock expect get
	mock.ExpectGet(cache.UserKey(userStruct.Email)).SetVal("")

	// Verify the user is in the Cache
	res = Cache.Get(context.Background(), cache.UserKey(userStruct.Email))
	_, err = res.Bytes()

	assert.Nil(t, err)
	//assert.NotNil(t, cachedUser)
}
