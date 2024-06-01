package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	// "github.com/stretchr/testify/assert"
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
	// Create a new Gin router
	r := gin.Default()

	// Register the route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong -> I am alive and kicking"})
	})

	// Create a request to pass to the handler
	req, err := http.NewRequest("GET", "/ping", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a response recorder to record the response
	rr := httptest.NewRecorder()

	// Serve the request
	r.ServeHTTP(rr, req)

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

func TestGetResource(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	// Connect to the database
	db := database.ConnectToDatabase()

	// Create a Gin router
	r := gin.Default()

	// create a new valid session for management of shared variables
	appsession := models.New(nil, db)

	// Register the route
	r.GET("/api/resource", func(c *gin.Context) {
		handlers.FetchResource(c, appsession)
	})

	// Create a request to pass to the handler
	req, err := http.NewRequest("GET", "/api/resource", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a response recorder to record the response
	rr := httptest.NewRecorder()

	// Serve the request
	r.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}
