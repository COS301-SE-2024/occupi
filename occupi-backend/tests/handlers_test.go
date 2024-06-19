package tests

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	// "github.com/stretchr/testify/mock"
)

/*
// Mock for utils.GenerateOTP
type MockUtils struct {
	mock.Mock
}

// GenerateOTP simulates the generation of a One Time Password (OTP) for testing purposes.
func (m *MockUtils) GenerateOTP() (string, error) {
	args := m.Called()
	return args.String(0), args.Error(1)
}

// Mock for mail.SendMail
type MockMail struct {
	mock.Mock
}

// SendMail simulates the sending of an email for testing purposes.
func (m *MockMail) SendMail(to, subject, body string) error {
	args := m.Called(to, subject, body)
	return args.Error(0)
}

// TestRegister tests the user registration endpoint.
func TestRegister(t *testing.T) {
	mockUtils := new(MockUtils)
	mockMail := new(MockMail)

	// Mock the GenerateOTP method to return a specific OTP.
	mockUtils.On("GenerateOTP").Return("123456", nil)
	// Mock the SendMail method to simulate sending an email.
	mockMail.On("SendMail", "test@example.com", "Your OTP for Email Verification", "Your OTP is: 123456").Return(nil)

	// Create a new HTTP request to register a user.
	reqBody := `{"email":"test@example.com"}`
	req, err := http.NewRequest("POST", "/register", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	// Record the HTTP response.
	rr := httptest.NewRecorder()
	// Create the handler with mocked dependencies.
	handler := handlers.Register(mockUtils.GenerateOTP, mockMail.SendMail)
	handler.ServeHTTP(rr, req)

	// Assert the response status code.
	assert.Equal(t, http.StatusOK, rr.Code)
	// Assert that the mocked methods were called as expected.
	mockUtils.AssertExpectations(t)
	mockMail.AssertExpectations(t)

	// Decode and verify the response body.
	var response map[string]string
	err = json.NewDecoder(rr.Body).Decode(&response)
	assert.NoError(t, err)
	assert.Equal(t, "Registration successful! Please check your email for the OTP to verify your account.", response["message"])
}

// TestVerifyOTP tests the OTP verification endpoint.
func TestVerifyOTP(t *testing.T) {
	// Add a test user with a known OTP.
	handlers.Users["test@example.com"] = models.User{Email: "test@example.com", Token: "123456"}

	// Create a new HTTP request to verify OTP.
	reqBody := `{"email":"test@example.com", "otp":"123456"}`
	req, err := http.NewRequest("POST", "/verify-otp", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	// Record the HTTP response.
	rr := httptest.NewRecorder()
	// Create the handler.
	handler := http.HandlerFunc(handlers.VerifyOTP)
	handler.ServeHTTP(rr, req)

	// Assert the response status code.
	assert.Equal(t, http.StatusOK, rr.Code)

	// Decode and verify the response body.
	var response map[string]string
	err = json.NewDecoder(rr.Body).Decode(&response)
	assert.NoError(t, err)
	assert.Equal(t, "Email verified successfully!", response["message"])
}

// TestVerifyOTP_InvalidOTP tests OTP verification with an invalid OTP.
func TestVerifyOTP_InvalidOTP(t *testing.T) {
	// Add a test user with a known OTP.
	handlers.Users["test@example.com"] = models.User{Email: "test@example.com", Token: "123456"}

	// Create a new HTTP request with an incorrect OTP.
	reqBody := `{"email":"test@example.com", "otp":"654321"}`
	req, err := http.NewRequest("POST", "/verify-otp", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	// Record the HTTP response.
	rr := httptest.NewRecorder()
	// Create the handler.
	handler := http.HandlerFunc(handlers.VerifyOTP)
	handler.ServeHTTP(rr, req)

	// Assert the response status code.
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}


// TestVerifyOTP_EmailNotRegistered tests OTP verification for an unregistered email.
func TestVerifyOTP_EmailNotRegistered(t *testing.T) {
	// Create a new HTTP request with an unregistered email.
	reqBody := `{"email":"notregistered@example.com", "otp":"123456"}`
	req, err := http.NewRequest("POST", "/verify-otp", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	// Record the HTTP response.
	rr := httptest.NewRecorder()
	// Create the handler.
	handler := http.HandlerFunc(handlers.VerifyOTP)
	handler.ServeHTTP(rr, req)

	// Assert the response status code.
	assert.Equal(t, http.StatusBadRequest, rr.Code)

}*/

func TestPingRoute(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal(fmt.Printf("Error loading .env file with error as %s", err))
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode("test")

	// Create a Gin router
	ginRouter := gin.Default()

	// Register routes
	router.OccupiRouter(ginRouter, db)

	// Create a request to pass to the handler
	req, err := http.NewRequest("GET", "/ping", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a response recorder to record the response
	rr := httptest.NewRecorder()

	// Serve the request
	ginRouter.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Define the expected response
	expectedResponse := gin.H{"message": "pong -> I am alive and kicking"}

	// Unmarshal the actual response
	var actualResponse gin.H
	if err := json.Unmarshal(rr.Body.Bytes(), &actualResponse); err != nil {
		t.Fatalf("could not unmarshal response: %v", err)
	}

	// Compare the responses
	if actualResponse["message"] != expectedResponse["message"] {
		t.Errorf("handler returned unexpected body: got %v want %v",
			actualResponse, expectedResponse)
	}
}

func TestRateLimit(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal(fmt.Printf("Error loading .env file with error as %s", err))
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode("test")

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
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal(fmt.Printf("Error loading .env file with error as %s", err))
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode("test")

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

func TestInvalidLogoutHandler(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode("test")

	// Create a Gin router
	ginRouter := gin.Default()

	// Register routes
	router.OccupiRouter(ginRouter, db)

	// Create a request to pass to the handler
	req, err := http.NewRequest("POST", "/auth/logout", nil)
	if err != nil {
		t.Fatal("Error creating request: ", err)
	}

	// Record the HTTP response
	rr := httptest.NewRecorder()

	// Serve the request
	ginRouter.ServeHTTP(rr, req)

	// Check the status code is what we expect
	if status := rr.Code; status != http.StatusUnauthorized {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusUnauthorized)
	}
}

func TestValidLogoutHandler(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode("test")

	// Create a Gin router
	ginRouter := gin.Default()

	// Register routes
	router.OccupiRouter(ginRouter, db)

	// Create a request to pass to the handler
	req, err := http.NewRequest("POST", "/auth/logout", nil)
	if err != nil {
		t.Fatal("Error creating request: ", err)
	}

	// Set up cookies for the request, "token" and "occupi-sessions-store"
	token, _, err := authenticator.GenerateToken("example@gmail.com", constants.Basic)
	if err != nil {
		t.Fatal("Error generating token: ", err)
	}
	cookie1 := http.Cookie{
		Name:  "token",
		Value: token,
	}
	req.AddCookie(&cookie1)

	// Record the HTTP response
	rr := httptest.NewRecorder()

	// Serve the request
	ginRouter.ServeHTTP(rr, req)

	// Check the status code is what we expect
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// ensure that protected route cannot be accessed like ping-auth
	req, err = http.NewRequest("GET", "/ping-auth", nil)

	if err != nil {
		t.Fatal("Error creating request: ", err)
	}

	// record the HTTP response
	rr = httptest.NewRecorder()

	// serve the request
	ginRouter.ServeHTTP(rr, req)

	// check the status code is what we expect
	if status := rr.Code; status != http.StatusUnauthorized {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusUnauthorized)
	}
}

func TestValidLogoutHandlerFromDomains(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode("test")

	// Create a Gin router
	ginRouter := gin.Default()

	// Register routes
	router.OccupiRouter(ginRouter, db)

	// read domains
	domains := configs.GetOccupiDomains()

	// use a wait group to handle concurrency
	var wg sync.WaitGroup

	for _, domain := range domains {
		wg.Add(1)

		go func(domain string) {
			defer wg.Done()

			// Create a request to pass to the handler
			req, err := http.NewRequest("POST", "/auth/logout", nil)
			if err != nil {
				t.Errorf("Error creating request: %v", err)
				return
			}

			// set the domain
			req.Host = domain

			// Set up cookies for the request, "token" and "occupi-sessions-store"
			token, _, err := authenticator.GenerateToken("example@gmail.com", constants.Basic)
			if err != nil {
				t.Errorf("Error generating token: %s", err)
			}
			cookie1 := http.Cookie{
				Name:  "token",
				Value: token,
			}
			req.AddCookie(&cookie1)

			// Record the HTTP response
			rr := httptest.NewRecorder()

			// Serve the request
			ginRouter.ServeHTTP(rr, req)

			// Check the status code is what we expect
			if status := rr.Code; status != http.StatusOK {
				t.Errorf("handler returned wrong status code for domain %s: got %v want %v", domain, status, http.StatusOK)
			}

			// ensure that protected route cannot be accessed like ping-auth
			req, err = http.NewRequest("GET", "/ping-auth", nil)

			if err != nil {
				t.Errorf("Error creating request: %s", err)
			}

			// record the HTTP response
			rr = httptest.NewRecorder()

			// serve the request
			ginRouter.ServeHTTP(rr, req)

			// check the status code is what we expect
			if status := rr.Code; status != http.StatusUnauthorized {
				t.Errorf("handler returned wrong status code: got %v want %v for domain: %s", status, http.StatusUnauthorized, domain)
			}
		}(domain)
	}

	// Wait for all goroutines to finish
	wg.Wait()
}
