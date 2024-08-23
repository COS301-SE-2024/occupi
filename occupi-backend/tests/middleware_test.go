package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	// "github.com/stretchr/testify/mock"
)

func TestProtectedRoute(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

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

func TestProtectedRouteAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	// set authorization header
	req.Header.Set("Authorization", token)

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
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: "invalid-token"})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized or Invalid auth token\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestProtectedRouteInvalidTokenAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil) // set authorization header
	req.Header.Set("Authorization", "invalid-token")

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized or Invalid auth token\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestProtectedRouteNonMatchingSessionEmailAndToken(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

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

	token2, _, _, _ := authenticator.GenerateToken("test1@example.com", constants.Basic)

	w1 := httptest.NewRecorder()

	// clear previous cookie
	req.Header.Del("Cookie")
	req.AddCookie(&http.Cookie{Name: "token", Value: token2})

	// make second request with different email and token
	r.ServeHTTP(w1, req)

	assert.Equal(t, http.StatusUnauthorized, w1.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"Invalid auth session\"},\"message\":\"Bad Request\",\"status\":401}", w1.Body.String())
}

func TestProtectedRouteNonMatchingSessionEmailAndTokenAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	// set authorization header
	req.Header.Set("Authorization", token)

	// make first request with this token and email and let session be created
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are auth'd\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)

	token2, _, _, _ := authenticator.GenerateToken("test1@example.com", constants.Basic)

	w1 := httptest.NewRecorder()

	// clear previous auth header
	req.Header.Del("Authorization")
	// set new authorization header
	req.Header.Set("Authorization", token2)

	// make second request with different email and token
	r.ServeHTTP(w1, req)

	assert.Equal(t, http.StatusUnauthorized, w1.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"Invalid auth session\"},\"message\":\"Bad Request\",\"status\":401}", w1.Body.String())
}

func TestAdminRoute(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("admin@example.com", constants.Admin)

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

func TestAdminRouteAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("admin@example.com", constants.Admin)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-admin", nil)
	// set authorization header
	req.Header.Set("Authorization", token)

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
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized or Invalid auth token\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestUnauthorizedAdminAccess(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-admin", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized to access admin route\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestUnauthorizedAdminAccessAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-admin", nil)
	// set authorization header
	req.Header.Set("Authorization", token)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized to access admin route\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestAccessUnprotectedRoute(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

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
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-open", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User already authorized\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestAccessUnprotectedRouteWithTokenAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-open", nil)
	// set authorization header
	req.Header.Set("Authorization", token)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User already authorized\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestAccessUnprotectedRouteWithSessionInvalidToken(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

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

func TestAccessUnprotectedRouteWithSessionInvalidTokenAuthHeader(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register the route
	router.OccupiRouter(r, appsession)

	token, _, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)
	// set authorization header
	req.Header.Set("Authorization", token)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are auth'd\",\"status\":200}",
		strings.ReplaceAll(w.Body.String(), "-\\u003e", "->"),
	)

	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/ping-open", nil)
	// set authorization header
	req.Header.Set("Authorization", "invalid-token")

	r.ServeHTTP(w1, req1)

	assert.Equal(t, http.StatusOK, w1.Code)
	assert.Equal(
		t,
		"{\"data\":null,\"message\":\"pong -> I am alive and kicking and you are not auth'd, only non-auth'd users can access this endpoint\",\"status\":200}",
		strings.ReplaceAll(w1.Body.String(), "-\\u003e", "->"),
	)
}

func TestAccessUnprotectedRouteWithSessionForContext(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Define a test handler to apply middleware
	r.GET("/test", func(c *gin.Context) {
		// Add ctx to session with role and email
		session := sessions.Default(c)
		session.Set("role", "Basic")
		session.Set("email", "test@example.com")
		err := session.Save()
		assert.Nil(t, err)

		// Call middleware
		middleware.UnProtectedRoute(c)

		// Ensure that the context is not aborted
		assert.False(t, c.IsAborted())

		// Ensure that email and role have been deleted from the session
		assert.Nil(t, session.Get("role"))
		assert.Nil(t, session.Get("email"))

		c.Status(200)
	})

	// Create a test context
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req) // This line is important to ensure middleware is applied

	// Check the response
	assert.Equal(t, 200, w.Code)
}

func TestRateLimit(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// adding rate limiting middleware
	middleware.AttachRateLimitMiddleware(ginRouter)

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register routes
	router.OccupiRouter(ginRouter, appsession)

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
	appsession := &models.AppSession{
		DB: configs.ConnectToDatabase(constants.AdminDBAccessOption),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// adding rate limiting middleware
	middleware.AttachRateLimitMiddleware(ginRouter)

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register routes
	router.OccupiRouter(ginRouter, appsession)

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

func TestAttachOTPRateLimitMiddleware(t *testing.T) {
	gin.SetMode(configs.GetGinRunMode())

	type testCase struct {
		description  string
		clientIP     string
		waitDuration time.Duration
		expectedCode int
		expectedBody string
	}

	tests := []testCase{
		{
			description:  "first request should succeed",
			clientIP:     "192.168.0.1",
			waitDuration: 5 * time.Second,
			expectedCode: http.StatusOK,
			expectedBody: "OTP request successful",
		},
		{
			description:  "second request within couple of seconds should be rate limited",
			clientIP:     "192.168.0.1",
			waitDuration: 0,
			expectedCode: http.StatusTooManyRequests,
			expectedBody: `{"error":{"code":"RATE_LIMIT","details":null,"message":"Too many requests"},"message":"Too Many Requests","status":429}`,
		},
		{
			description:  "second request within couple of seconds should be rate limited as evictions are not done yet",
			clientIP:     "192.168.0.1",
			waitDuration: 3,
			expectedCode: http.StatusTooManyRequests,
			expectedBody: `{"error":{"code":"RATE_LIMIT","details":null,"message":"Too many requests"},"message":"Too Many Requests","status":429}`,
		},
		{
			description:  "second request within couple of seconds should work as evictions just completed",
			clientIP:     "192.168.0.1",
			waitDuration: 4 * time.Second,
			expectedCode: http.StatusOK,
			expectedBody: "OTP request successful",
		},
		{
			description:  "request after a couple seconds should succeed",
			clientIP:     "192.168.0.1",
			waitDuration: 4 * time.Second,
			expectedCode: http.StatusOK,
			expectedBody: "OTP request successful",
		},
	}

	for _, tc := range tests {
		t.Run(tc.description, func(t *testing.T) {
			appsession := &models.AppSession{
				DB:          nil,
				Cache:       nil,
				OtpReqCache: configs.CreateOTPRateLimitCache(),
			}

			router := gin.New()
			router.GET("/otp",
				func(ctx *gin.Context) { middleware.AttachOTPRateLimitMiddleware(ctx, appsession) },
				func(ctx *gin.Context) {
					ctx.JSON(http.StatusOK, gin.H{"message": "OTP request successful"})
				})

			req := httptest.NewRequest(http.MethodGet, "/otp", nil)
			req.RemoteAddr = tc.clientIP + ":12345"
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)
			assert.Equal(t, http.StatusOK, w.Code)
			assert.Contains(t, w.Body.String(), "OTP request successful")

			time.Sleep(tc.waitDuration)

			req2 := httptest.NewRequest(http.MethodGet, "/otp", nil)
			req2.RemoteAddr = tc.clientIP + ":12345"
			w2 := httptest.NewRecorder()

			router.ServeHTTP(w2, req2)
			assert.Equal(t, tc.expectedCode, w2.Code)
			assert.Contains(t, w2.Body.String(), tc.expectedBody)
		})
	}
}

func TestTimezoneMiddleware(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.Use(middleware.TimezoneMiddleware())
	router.GET("/time", func(c *gin.Context) {
		loc, exists := c.Get("timezone")
		if !exists {
			loc = time.UTC
		}

		currentTime := time.Now().In(loc.(*time.Location))

		c.JSON(200, gin.H{
			"current_time": currentTime.Format(time.RFC3339),
		})
	})

	tests := []struct {
		header     string
		timezone   string
		statusCode int
	}{
		{"X-Timezone", "America/New_York", 200},
		{"X-Timezone", "Asia/Kolkata", 200},
		{"X-Timezone", "Invalid/Timezone", 400},
	}

	for _, tt := range tests {
		t.Run(tt.timezone, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/time", nil)
			req.Header.Set(tt.header, tt.timezone)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.statusCode, w.Code)
			if tt.statusCode == 200 {
				var response map[string]string
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)

				loc, err := time.LoadLocation(tt.timezone)
				assert.NoError(t, err)

				expectedTime := time.Now().In(loc).Format(time.RFC3339)
				assert.Contains(t, response["current_time"], expectedTime[:19]) // Compare only date and time part
			}
		})
	}
}

func TestRealIPMiddleware_CFConnectingIP(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.Use(middleware.RealIPMiddleware())
	router.GET("/ip", func(c *gin.Context) {
		clientIP, _ := c.Get("ClientIP")
		c.JSON(http.StatusOK, gin.H{
			"client_ip": clientIP,
		})
	})

	req, _ := http.NewRequest("GET", "/ip", nil)
	req.Header.Set("CF-Connecting-IP", "203.0.113.195")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.JSONEq(t, `{"client_ip":"203.0.113.195"}`, w.Body.String())
}

func TestRealIPMiddleware_XRealIP(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.Use(middleware.RealIPMiddleware())
	router.GET("/ip", func(c *gin.Context) {
		clientIP, _ := c.Get("ClientIP")
		c.JSON(http.StatusOK, gin.H{
			"client_ip": clientIP,
		})
	})

	req, _ := http.NewRequest("GET", "/ip", nil)
	req.Header.Set("X-Real-IP", "203.0.113.196")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.JSONEq(t, `{"client_ip":"203.0.113.196"}`, w.Body.String())
}

func TestRealIPMiddleware_XForwardedFor(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.Use(middleware.RealIPMiddleware())
	router.GET("/ip", func(c *gin.Context) {
		clientIP, _ := c.Get("ClientIP")
		c.JSON(http.StatusOK, gin.H{
			"client_ip": clientIP,
		})
	})

	req, _ := http.NewRequest("GET", "/ip", nil)
	req.Header.Set("X-Forwarded-For", "203.0.113.197, 198.51.100.1")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.JSONEq(t, `{"client_ip":"203.0.113.197"}`, w.Body.String())
}

func TestRealIPMiddleware_RemoteAddr(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.Use(middleware.RealIPMiddleware())
	router.GET("/ip", func(c *gin.Context) {
		clientIP, _ := c.Get("ClientIP")
		c.JSON(http.StatusOK, gin.H{
			"client_ip": clientIP,
		})
	})

	req, _ := http.NewRequest("GET", "/ip", nil)
	req.RemoteAddr = "203.0.113.198:12345"
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.JSONEq(t, `{"client_ip":"203.0.113.198"}`, w.Body.String())
}
