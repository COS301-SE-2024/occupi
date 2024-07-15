package tests

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func TestEmailExistsPerformance(t *testing.T) {
	email := "TestEmailExistsPerformance@example.com"

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
	userStruct := models.User{
		Email: email,
	}
	_, err := collection.InsertOne(ctx, userStruct)
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
	email := "TestEmailExists_WithCache@example.com"
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

	user := models.RegisterUser{
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
	email := "TestOTPExistsPerformance@example.com"
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
	email := "TestOTPExists_WithCache@example.com"
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

	// Verify the otp is not in the cache before calling the function
	nocachedOTP, err := cache.Get(email + otp)

	assert.NotNil(t, err)
	assert.Nil(t, nocachedOTP)

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
	email := "TestDeleteOTP_withCache@example.com"
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

	// add otp to cache
	if otpData, err := bson.Marshal(otpStruct); err != nil {
		t.Fatal(err)
	} else {
		if err := cache.Set(email+otp, otpData); err != nil {
			t.Fatal(err)
		}
	}

	// Verify the otp is in the cache before calling the function
	nocachedOTP, err := cache.Get(email + otp)

	assert.Nil(t, err)
	assert.NotNil(t, nocachedOTP)

	// call the function to test
	success, err := database.DeleteOTP(ctx, appSession, email, otp)

	// Verify the response
	assert.True(t, success)
	assert.Nil(t, err)

	// Verify the otp is not in the cache
	cachedUser, err := cache.Get(email + otp)

	assert.NotNil(t, err)
	assert.Nil(t, cachedUser)
}

func TestGetPasswordPerformance(t *testing.T) {
	email := "TestGetPasswordPerformance@example.com"
	password := "password"
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
	userStruct := models.User{
		Email:    email,
		Password: password,
	}

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// Test performance with cache
	startTime := time.Now()
	for i := 0; i < 1000; i++ {
		database.GetPassword(ctx, appsessionWithCache, email)
	}
	durationWithCache := time.Since(startTime)

	// Test performance without cache
	startTime = time.Now()
	for i := 0; i < 1000; i++ {
		database.GetPassword(ctx, appsessionWithoutCache, email)
	}
	durationWithoutCache := time.Since(startTime)

	// Assert that the cache improves the speed
	if durationWithoutCache <= durationWithCache {
		t.Errorf("Cache did not improve performance: duration with cache %v, duration without cache %v", durationWithCache, durationWithoutCache)
	}
}

func TestGetPassword_withCache(t *testing.T) {
	email := "TestGetPassword_withCache@example.com"
	password := "password"
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
	userStruct := models.User{
		Email:    email,
		Password: password,
	}

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// Verify the user is not in the cache before calling the function
	nocachedUser, err := cache.Get(email)

	assert.NotNil(t, err)
	assert.Nil(t, nocachedUser)

	// call the function to test
	passwordv, err := database.GetPassword(ctx, appSession, email)

	// Verify the response
	assert.Equal(t, password, passwordv)
	assert.Nil(t, err)

	// Verify the user is in the cache
	cachedUser, err := cache.Get(email)

	assert.Nil(t, err)
	assert.NotNil(t, cachedUser)
}

func TestCheckIfUserIsAdminPerformance(t *testing.T) {
	email := "TestCheckIfUserIsAdminPerformance@example.com"
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
	userStruct := models.User{
		Email: email,
		Role:  constants.Admin,
	}

	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		t.Fatalf("Failed to insert test user into database: %v", err)
	}

	// Test performance with cache
	startTime := time.Now()
	for i := 0; i < 1000; i++ {
		database.CheckIfUserIsAdmin(ctx, appsessionWithCache, email)
	}

	durationWithCache := time.Since(startTime)

	// Test performance without cache
	startTime = time.Now()
	for i := 0; i < 1000; i++ {
		database.CheckIfUserIsAdmin(ctx, appsessionWithoutCache, email)
	}

	durationWithoutCache := time.Since(startTime)

	// Assert that the cache improves the speed
	if durationWithoutCache <= durationWithCache {
		t.Errorf("Cache did not improve performance: duration with cache %v, duration without cache %v", durationWithCache, durationWithoutCache)
	}
}

func TestCheckIfUserIsAdmin_WithCache(t *testing.T) {
	email1 := "TestCheckIfUserIsAdmin_WithCache1@example.com"
	email2 := "TestCheckIfUserIsAdmin_WithCache2@example.com"
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

	// Verify the user is not in the cache before calling the function
	nocachedUser1, err := cache.Get(email1)

	assert.NotNil(t, err)
	assert.Nil(t, nocachedUser1)

	nocachedUser2, err := cache.Get(email2)

	assert.NotNil(t, err)
	assert.Nil(t, nocachedUser2)

	// call the function to test
	isAdmin1, err := database.CheckIfUserIsAdmin(ctx, appSession, email1)

	// Verify the response
	assert.True(t, isAdmin1)
	assert.Nil(t, err)

	// Verify the user is in the cache
	cachedUser1, err := cache.Get(email1)

	assert.Nil(t, err)
	assert.NotNil(t, cachedUser1)

	// call the function to test
	isAdmin2, err := database.CheckIfUserIsAdmin(ctx, appSession, email2)

	// Verify the response
	assert.False(t, isAdmin2)
	assert.Nil(t, err)

	// Verify the user is in the cache
	cachedUser2, err := cache.Get(email2)

	assert.Nil(t, err)
	assert.NotNil(t, cachedUser2)
}

func TestCheckIfUserIsLoggingInFromKnownLocationPerformance(t *testing.T) {
	email := "TestCheckIfUserIsLoggingInFromKnownLocationPerformance@example.com"
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

	// Test performance with cache
	startTime := time.Now()
	for i := 0; i < 1000; i++ {
		database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsessionWithCache, email, "8.8.8.8")
	}

	durationWithCache := time.Since(startTime)

	// Test performance without cache
	startTime = time.Now()
	for i := 0; i < 1000; i++ {
		database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsessionWithoutCache, email, "8.8.8.8")
	}

	durationWithoutCache := time.Since(startTime)

	// Assert that the cache improves the speed
	if durationWithoutCache <= durationWithCache {
		t.Errorf("Cache did not improve performance: duration with cache %v, duration without cache %v", durationWithCache, durationWithoutCache)
	}
}

func TestCheckIfUserIsLoggingInFromKnownLocation_withCache(t *testing.T) {
	email := "TestCheckIfUserIsLoggingInFromKnownLocation_withCache@example.com"
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

	// Verify the user is not in the cache before calling the function
	nocachedUser, err := cache.Get(email)

	assert.NotNil(t, err)
	assert.Nil(t, nocachedUser)

	// call the function to test
	yes, info, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appSession, email, "8.8.8.8")

	// Verify the response
	assert.True(t, yes)
	assert.Nil(t, err)
	assert.Nil(t, info)

	// Verify the user is in the cache
	cachedUser, err := cache.Get(email)

	assert.Nil(t, err)
	assert.NotNil(t, cachedUser)
}
