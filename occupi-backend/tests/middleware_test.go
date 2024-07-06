package tests

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	// "github.com/stretchr/testify/mock"
)

func TestProtectedRoute(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are auth'd\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)
}

func TestProtectedRouteInvalidToken(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: "invalid-token"})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"Invalid token\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestProtectedRouteNonMatchingSessionEmailAndToken(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	// make first request with this token and email and let session be created
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are auth'd\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)

	token2, _, _ := authenticator.GenerateToken("test1@example.com", constants.Basic)

	w1 := httptest.NewRecorder()

	// clear previous cookie
	req.Header.Del("Cookie")
	req.AddCookie(&http.Cookie{Name: "token", Value: token2})

	// make second request with different email and token
	r.ServeHTTP(w1, req)

	assert.Equal(t, http.StatusUnauthorized, w1.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"Invalid auth session\"},\"message\":\"Bad Request\",\"status\":401}", w1.Body.String())
}

func TestAdminRoute(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	token, _, _ := authenticator.GenerateToken("admin@example.com", constants.Admin)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-admin", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are an admin\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)
}

func TestUnauthorizedAccess(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestUnauthorizedAdminAccess(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-admin", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized to access admin route\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestAccessUnprotectedRoute(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-open", nil)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are not auth'd, only non-auth'd users can access this endpoint\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)
}

func TestAccessUnprotectedRouteWithToken(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-open", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User already authorized\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestAccessUnprotectedRouteWithSessionInvalidToken(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db, cache)

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are auth'd\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)

	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/ping-open", nil)
	req1.AddCookie(&http.Cookie{Name: "token", Value: "invalid-token"})

	r.ServeHTTP(w1, req1)

	assert.Equal(t, http.StatusOK, w1.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are not auth'd, only non-auth'd users can access this endpoint\",\"status\":200}",
		strings.ReplaceAll(w1.Body.String(), "-\\u003e", "->"),
	)
}

func TestRateLimit(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// adding rate limiting middleware
	middleware.AttachRateLimitMiddleware(ginRouter)

	// Register routes
	router.OccupiRouter(ginRouter, db)

	server := httptest.NewServer(ginRouter)
	defer server.Close()

	var wg sync.WaitGroup
	numRequests := 10
	responseCodes := make([]int, numRequests)

	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			resp, err := http.Get(server.URL + "/ping")
			if err != nil {
				t.Errorf("Request %d failed: %v", index, err)
				return
			}
			defer resp.Body.Close()
			responseCodes[index] = resp.StatusCode
		}(i)
		time.Sleep(100 * time.Millisecond) // Slight delay to spread out the requests
	}

	wg.Wait()

	rateLimitedCount := 0
	for _, code := range responseCodes {
		if code == http.StatusTooManyRequests {
			rateLimitedCount++
		}
	}

	assert.Greater(t, rateLimitedCount, 0, "There should be some requests that are rate limited")
	assert.LessOrEqual(t, rateLimitedCount, numRequests-5, "There should be at least 5 requests that are not rate limited")
}

func TestRateLimitWithMultipleIPs(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// adding rate limiting middleware
	middleware.AttachRateLimitMiddleware(ginRouter)

	// Register routes
	router.OccupiRouter(ginRouter, db)

	server := httptest.NewServer(ginRouter)
	defer server.Close()

	var wg sync.WaitGroup
	numRequests := 10
	ip1 := "192.168.1.1"
	ip2 := "192.168.1.2"
	responseCodesIP1 := make([]int, numRequests)
	responseCodesIP2 := make([]int, numRequests-5)

	// Send requests from the first IP address
	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			client := &http.Client{}
			req, err := http.NewRequest("GET", server.URL+"/ping", nil)
			if err != nil {
				t.Errorf("Failed to create request: %v", err)
				return
			}
			req.Header.Set("X-Forwarded-For", ip1)
			resp, err := client.Do(req)
			if err != nil {
				t.Errorf("Request failed: %v", err)
				return
			}
			defer resp.Body.Close()
			responseCodesIP1[index] = resp.StatusCode
		}(i)
		time.Sleep(10 * time.Millisecond) // Slight delay to spread out the requests
	}

	// Send requests from the second IP address
	for i := 0; i < numRequests-5; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			client := &http.Client{}
			req, err := http.NewRequest("GET", server.URL+"/ping", nil)
			if err != nil {
				t.Errorf("Failed to create request: %v", err)
				return
			}
			req.Header.Set("X-Forwarded-For", ip2)
			resp, err := client.Do(req)
			if err != nil {
				t.Errorf("Request failed: %v", err)
				return
			}
			defer resp.Body.Close()
			responseCodesIP2[index] = resp.StatusCode
		}(i)
		time.Sleep(10 * time.Millisecond) // Slight delay to spread out the requests
	}

	wg.Wait()

	rateLimitedCountIP1 := 0
	rateLimitedCountIP2 := 0
	for _, code := range responseCodesIP1 {
		if code == http.StatusTooManyRequests {
			rateLimitedCountIP1++
		}
	}
	for _, code := range responseCodesIP2 {
		if code == http.StatusTooManyRequests {
			rateLimitedCountIP2++
		}
	}

	// Assertions for IP1
	assert.Greater(t, rateLimitedCountIP1, 0, "There should be some requests from IP1 that are rate limited")
	assert.LessOrEqual(t, rateLimitedCountIP1, numRequests-5, "There should be at least 5 requests from IP1 that are not rate limited")

	// Assertions for IP2
	assert.Equal(t, rateLimitedCountIP2, 0, "There should be no requests from IP2 that are rate limited")
}
