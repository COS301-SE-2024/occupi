package tests

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redismock/v9"
	"github.com/stretchr/testify/assert"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

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
