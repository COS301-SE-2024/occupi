package tests

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
    "github.com/allegro/bigcache/v3"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func TestEmailExistsPerformance(t *testing.T) {
	email := "test@example.com"

	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appsessionWithCache := models.New(db, cache)
	// Create a new AppSession without the cache
	appsessionWithoutCache := models.New(db, nil)

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	_, err := collection.InsertOne(ctx, bson.M{"email": email})
	if err != nil {
		t.Fatalf("Failed to insert test email into database: %v", err)
	}

	// Test performance with cache
	startTime := time.Now()
	for i := 0; i < 1000; i++ {
		database.EmailExists(ctx, appsessionWithCache, email)
	}
	durationWithCache := time.Since(startTime)

	// Test performance without cache
	startTime = time.Now()
	for i := 0; i < 1000; i++ {
		database.EmailExists(ctx, appsessionWithoutCache, email)
	}
	durationWithoutCache := time.Since(startTime)

	// Assert that the cache improves the speed
	if durationWithoutCache <= durationWithCache {
		t.Errorf("Cache did not improve performance: duration with cache %v, duration without cache %v", durationWithCache, durationWithoutCache)
	}
}

func TestEmailExists_WithCache(t *testing.T) {
	email := "test@example.com"
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, cache)

	// Mock the DB response
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	_, err := collection.InsertOne(ctx, bson.M{"email": email})
	if err != nil {
		t.Fatalf("Failed to insert test email into database: %v", err)
	}

	// call the function to test
	exists := database.EmailExists(ctx, appSession, email)

	// Verify the response
	assert.True(t, exists)

	// Verify the user is in the cache
	cachedUser, err := cache.Get(email)

	assert.Nil(t, err)
	assert.NotNil(t, cachedUser)
}

func TestAddUser_WithCache(t *testing.T) {
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, cache)

	user := models.RequestUser{
		Email:      "test_withcache@example.com",
		Password:   "password",
		EmployeeID: "12345",
	}

	success, err := database.AddUser(ctx, appSession, user)
	assert.True(t, success)
	assert.Nil(t, err)

	// Verify the user is in the cache
	cachedUser, err := cache.Get(user.Email)
	assert.Nil(t, err)
	assert.NotNil(t, cachedUser)

	// sleep for 2 * cache expiry time to ensure the cache expires
	time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

	// Verify the user is not in the cache
	cachedUser, err = cache.Get(user.Email)
	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)
}

func TestAddOTP_WithCache(t *testing.T) {
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, cache)

	email := "test_withcache@example.com"
	otp := "123456"

	success, err := database.AddOTP(ctx, appSession, email, otp)
	assert.True(t, success)
	assert.Nil(t, err)

	// Verify the otp is in the cache
	cachedUser, err := cache.Get(email + otp)
	assert.Nil(t, err)
	assert.NotNil(t, cachedUser)

	// sleep for 2 * cache expiry time to ensure the cache expires
	time.Sleep(time.Duration(configs.GetCacheEviction()) * 2 * time.Second)

	// Verify the user is not in the cache
	cachedUser, err = cache.Get(email + otp)
	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)
}

func TestOTPExistsPerformance(t *testing.T) {
	email := "test@example.com"
	otp := "123456"

	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appsessionWithCache := models.New(db, cache)
	// Create a new AppSession without the cache
	appsessionWithoutCache := models.New(db, nil)

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

	// Test performance with cache
	startTime := time.Now()
	for i := 0; i < 1000; i++ {
		database.OTPExists(ctx, appsessionWithCache, email, otp)
	}
	durationWithCache := time.Since(startTime)

	// Test performance without cache
	startTime = time.Now()
	for i := 0; i < 1000; i++ {
		database.OTPExists(ctx, appsessionWithoutCache, email, otp)
	}
	durationWithoutCache := time.Since(startTime)

	// Assert that the cache improves the speed
	if durationWithoutCache <= durationWithCache {
		t.Errorf("Cache did not improve performance: duration with cache %v, duration without cache %v", durationWithCache, durationWithoutCache)
	}
}

func TestOTPExists_WithCache(t *testing.T) {
	email := "test@example.com"
	otp := "123456"
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, cache)

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

	// call the function to test
	exists, err := database.OTPExists(ctx, appSession, email, otp)

	// Verify the response
	assert.True(t, exists)
	assert.Nil(t, err)

	// Verify the user is in the cache
	cachedUser, err := cache.Get(email + otp)

	assert.Nil(t, err)
	assert.NotNil(t, cachedUser)
}

func TestDeleteOTP_withCache(t *testing.T) {
	email := "test@example.com"
	otp := "123456"
	// Create database connection and cache
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a response writer and context
	ctx, _ := gin.CreateTestContext(w)

	// Create a new AppSession with the cache
	appSession := models.New(db, cache)

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

	// call the function to test
	success, err := database.DeleteOTP(ctx, appSession, email, otp)

	// Verify the response
	assert.True(t, success)
	assert.Nil(t, err)

	// Verify the user is in the cache
	cachedUser, err := cache.Get(email + otp)

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)
}

func TestValidateResetToken(t *testing.T) {
    ctx := context.Background()
    db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
    cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10 * time.Minute))
    appSession := models.New(db, cache)

    email := "test@example.com"
    token := "testtoken"
    expireWhen := time.Now().Add(1 * time.Hour)

    // Insert a test token
    collection := db.Database("Occupi").Collection("ResetTokens")
    _, err := collection.InsertOne(ctx, bson.M{"email": email, "token": token, "expireWhen": expireWhen})
    if err != nil {
        t.Fatalf("Failed to insert test token: %v", err)
    }

    // Validate the token
    valid, msg, err := database.ValidateResetToken(ctx, appSession, email, token)
    if err != nil {
        t.Fatalf("Failed to validate reset token: %v", err)
    }
    if !valid {
        t.Errorf("Expected token to be valid, got invalid with message: %s", msg)
    }

    // Check if token is cached
    cachedToken, err := cache.Get("reset_token:" + email)
    if err != nil || string(cachedToken) != token {
        t.Errorf("Token not cached properly after validation")
    }
}

func TestSaveAndVerifyTwoFACode(t *testing.T) {
    ctx := context.Background()
    db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
    cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10 * time.Minute))
    appSession := models.New(db, cache)

    email := "test@example.com"
    code := "123456"

    // Save 2FA code
    err := database.SaveTwoFACode(ctx, appSession, email, code)
    if err != nil {
        t.Fatalf("Failed to save 2FA code: %v", err)
    }

    // Verify 2FA code
    valid, err := database.VerifyTwoFACode(ctx, appSession, email, code)
    if err != nil {
        t.Fatalf("Failed to verify 2FA code: %v", err)
    }
    if !valid {
        t.Errorf("Expected 2FA code to be valid")
    }

    // Check if code is cached
    cachedCode, err := cache.Get("2fa_code:" + email)
    if err != nil || string(cachedCode) != code {
        t.Errorf("2FA code not cached properly")
    }
}

func TestIsTwoFAEnabledAndSetTwoFAEnabled(t *testing.T) {
    ctx := context.Background()
    db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
    cache, _ := bigcache.New(context.Background(), bigcache.DefaultConfig(10 * time.Minute))
    appSession := models.New(db, cache)

    email := "test@example.com"

    // Set 2FA enabled
    err := database.SetTwoFAEnabled(ctx, appSession, email, true)
    if err != nil {
        t.Fatalf("Failed to set 2FA enabled: %v", err)
    }

    // Check if 2FA is enabled
    enabled, err := database.IsTwoFAEnabled(ctx, appSession, email)
    if err != nil {
        t.Fatalf("Failed to check if 2FA is enabled: %v", err)
    }
    if !enabled {
        t.Errorf("Expected 2FA to be enabled")
    }

    // Check if 2FA status is cached
    cachedStatus, err := cache.Get("2fa_enabled:" + email)
    if err != nil || string(cachedStatus) != "true" {
        t.Errorf("2FA enabled status not cached properly")
    }
}