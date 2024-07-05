package tests

import (
	"log"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"

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
	collection := db.Database("Occupi").Collection("Users")
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

	// Compare durations and log the results
	log.Printf("Email exists Duration with cache: %v", durationWithCache)
	log.Printf("Email exists Duration without cache: %v", durationWithoutCache)

	// Assert that the cache improves the speed
	if durationWithoutCache <= durationWithCache {
		t.Errorf("Cache did not improve performance: duration with cache %v, duration without cache %v", durationWithCache, durationWithoutCache)
	}
}
