package tests

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	// "github.com/stretchr/testify/mock"
)

func TestProtectedRoute(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ping-auth", nil)

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Equal(t, "{\"error\":{\"code\":\"INVALID_AUTH\",\"details\":null,\"message\":\"User not authorized\"},\"message\":\"Bad Request\",\"status\":401}", w.Body.String())
}

func TestUnauthorizedAdminAccess(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

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
