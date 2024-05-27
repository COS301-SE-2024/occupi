package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mock for utils.GenerateOTP
type MockUtils struct {
	mock.Mock
}

func (m *MockUtils) GenerateOTP() (string, error) {
	args := m.Called()
	return args.String(0), args.Error(1)
}

// Mock for mail.SendMail
type MockMail struct {
	mock.Mock
}

func (m *MockMail) SendMail(to, subject, body string) error {
	args := m.Called(to, subject, body)
	return args.Error(0)
}

func TestRegister(t *testing.T) {
	mockUtils := new(MockUtils)
	mockMail := new(MockMail)

	mockUtils.On("GenerateOTP").Return("123456", nil)
	mockMail.On("SendMail", "test@example.com", "Your OTP for Email Verification", "Your OTP is: 123456").Return(nil)

	reqBody := `{"email":"test@example.com"}`
	req, err := http.NewRequest("POST", "/register", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := handlers.Register(mockUtils.GenerateOTP, mockMail.SendMail)
	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	mockUtils.AssertExpectations(t)
	mockMail.AssertExpectations(t)

	var response map[string]string
	err = json.NewDecoder(rr.Body).Decode(&response)
	assert.NoError(t, err)
	assert.Equal(t, "Registration successful! Please check your email for the OTP to verify your account.", response["message"])
}

func TestVerifyOTP(t *testing.T) {
	handlers.Users["test@example.com"] = models.User{Email: "test@example.com", Token: "123456"}

	reqBody := `{"email":"test@example.com", "otp":"123456"}`
	req, err := http.NewRequest("POST", "/verify-otp", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.VerifyOTP)
	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var response map[string]string
	err = json.NewDecoder(rr.Body).Decode(&response)
	assert.NoError(t, err)
	assert.Equal(t, "Email verified successfully!", response["message"])
}

func TestVerifyOTP_InvalidOTP(t *testing.T) {
	handlers.Users["test@example.com"] = models.User{Email: "test@example.com", Token: "123456"}

	reqBody := `{"email":"test@example.com", "otp":"654321"}`
	req, err := http.NewRequest("POST", "/verify-otp", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.VerifyOTP)
	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)
}

func TestVerifyOTP_EmailNotRegistered(t *testing.T) {
	reqBody := `{"email":"notregistered@example.com", "otp":"123456"}`
	req, err := http.NewRequest("POST", "/verify-otp", bytes.NewBufferString(reqBody))
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.VerifyOTP)
	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)
}
