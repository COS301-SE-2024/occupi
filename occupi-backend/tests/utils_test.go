package tests

import (
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func TestGenEmpID(t *testing.T) {
	empID := utils.GenerateEmployeeID()
	t.Logf("Generated Employee ID: %s", empID)
}
func TestGenBookID(t *testing.T) {
	BookID := utils.ID()
	t.Logf("Generated Employee ID: %s", BookID)
}
func TestSanitizeInput(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Plain text",
			input:    "Hello, world!",
			expected: "Hello, world!",
		},
		{
			name:     "HTML input",
			input:    "<p>Hello, world!</p>",
			expected: "<p>Hello, world!</p>",
		},
		{
			name:     "HTML with allowed tags",
			input:    "<b>Hello</b>, <i>world</i>!",
			expected: "<b>Hello</b>, <i>world</i>!",
		},
		{
			name:     "HTML with disallowed tags",
			input:    "<script>alert('xss')</script><b>Hello</b>",
			expected: "<b>Hello</b>",
		},
		{
			name:     "HTML with attributes",
			input:    "<a href=\"http://example.com\" onclick=\"evil()\">link</a>",
			expected: "<a href=\"http://example.com\" rel=\"nofollow\">link</a>",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.SanitizeInput(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		expected bool
	}{
		{
			name:     "Valid email",
			email:    "test@example.com",
			expected: true,
		},
		{
			name:     "Valid email with subdomain",
			email:    "user@mail.example.co.uk",
			expected: true,
		},
		{
			name:     "Invalid email without @",
			email:    "invalidemail.com",
			expected: false,
		},
		{
			name:     "Invalid email with special characters",
			email:    "user!@example.com",
			expected: false,
		},
		{
			name:     "Invalid email with consecutive dots",
			email:    "user..name@example.com",
			expected: true,
		},
		{
			name:     "Invalid email with trailing dot",
			email:    "user@example.com.",
			expected: false,
		},
		{
			name:     "Invalid email with leading dot",
			email:    ".user@example.com",
			expected: true,
		},
		{
			name:     "Invalid email with space",
			email:    "user@ example.com",
			expected: false,
		},
		{
			name:     "Invalid email with missing domain",
			email:    "user@.com",
			expected: false,
		},
		{
			name:     "Invalid email with missing TLD",
			email:    "user@example",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ValidateEmail(tt.email)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		expected bool
	}{
		{
			name:     "Valid password",
			password: "Valid1@password",
			expected: true,
		},
		{
			name:     "Too short",
			password: "V1@pwd",
			expected: false,
		},
		{
			name:     "No lowercase letter",
			password: "VALID1@PASSWORD",
			expected: false,
		},
		{
			name:     "No uppercase letter",
			password: "valid1@password",
			expected: false,
		},
		{
			name:     "No digit",
			password: "Valid@password",
			expected: false,
		},
		{
			name:     "No special character",
			password: "Valid1password",
			expected: false,
		},
		{
			name:     "All required characters",
			password: "A1b2c3d4@",
			expected: true,
		},
		{
			name:     "Special characters only",
			password: "@$!%*?&",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ValidatePassword(tt.password)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateOTP(t *testing.T) {
	tests := []struct {
		name     string
		otp      string
		expected bool
	}{
		{
			name:     "Valid OTP",
			otp:      "123456",
			expected: true,
		},
		{
			name:     "Too short",
			otp:      "12345",
			expected: false,
		},
		{
			name:     "Too long",
			otp:      "1234567",
			expected: false,
		},
		{
			name:     "Non-numeric characters",
			otp:      "12a456",
			expected: false,
		},
		{
			name:     "Empty string",
			otp:      "",
			expected: false,
		},
		{
			name:     "Alphanumeric OTP",
			otp:      "12345a",
			expected: false,
		},
		{
			name:     "OTP with special characters",
			otp:      "123@56",
			expected: false,
		},
		{
			name:     "Whitespace in OTP",
			otp:      "123 56",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ValidateOTP(tt.otp)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestArgon2IDHash(t *testing.T) {
	tests := []struct {
		name     string
		password string
	}{
		{
			name:     "Valid password",
			password: "password123",
		},
		{
			name:     "Empty password",
			password: "",
		},
		{
			name:     "Password with special characters",
			password: "P@ssw0rd!",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hash, err := utils.Argon2IDHash(tt.password)
			assert.NoError(t, err)
			assert.NotEmpty(t, hash)

			match, err := utils.CompareArgon2IDHash(tt.password, hash)
			assert.NoError(t, err)
			assert.True(t, match)
		})
	}
}

func TestCompareArgon2IDHash(t *testing.T) {
	password := "password123"
	wrongPassword := "wrongpassword"

	hash, err := utils.Argon2IDHash(password)
	assert.NoError(t, err)
	assert.NotEmpty(t, hash)

	t.Run("Correct password", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(password, hash)
		assert.NoError(t, err)
		assert.True(t, match)
	})

	t.Run("Incorrect password", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(wrongPassword, hash)
		assert.NoError(t, err)
		assert.False(t, match)
	})

	t.Run("Empty password", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash("", hash)
		assert.NoError(t, err)
		assert.False(t, match)
	})

	t.Run("Empty hash", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(password, "")
		assert.Error(t, err)
		assert.False(t, match)
	})
}

func TestSuccessResponse(t *testing.T) {
	expected := gin.H{
		"status":  http.StatusOK,
		"message": "Success",
		"data": gin.H{
			"key": "value",
		},
	}

	response := utils.SuccessResponse(http.StatusOK, "Success", gin.H{"key": "value"})
	assert.Equal(t, expected, response)
}

func TestSuccessResponseWithMeta(t *testing.T) {
	expected := gin.H{
		"status":  http.StatusOK,
		"message": "Success",
		"data": gin.H{
			"key": "value",
		},
		"meta": gin.H{
			"page": 1,
		},
	}

	response := utils.SuccessResponseWithMeta(http.StatusOK, "Success", gin.H{"key": "value"}, gin.H{"page": 1})
	assert.Equal(t, expected, response)
}

func TestErrorResponse(t *testing.T) {
	expected := gin.H{
		"status":  http.StatusBadRequest,
		"message": "Bad Request",
		"error": gin.H{
			"code":    "INVALID_INPUT",
			"message": "Invalid input provided",
			"details": gin.H{"field": "value"},
		},
	}

	response := utils.ErrorResponse(http.StatusBadRequest, "Bad Request", "INVALID_INPUT", "Invalid input provided", gin.H{"field": "value"})
	assert.Equal(t, expected, response)
}

func TestInternalServerError(t *testing.T) {
	expected := gin.H{
		"status":  http.StatusInternalServerError,
		"message": "Internal Server Error",
		"error": gin.H{
			"code":    constants.InternalServerErrorCode,
			"message": "Internal Server Error",
			"details": gin.H{},
		},
	}

	response := utils.InternalServerError()
	assert.Equal(t, expected, response)
}

func TestErrorResponseWithMeta(t *testing.T) {
	expected := gin.H{
		"status":  http.StatusBadRequest,
		"message": "Bad Request",
		"error": gin.H{
			"code":    "INVALID_INPUT",
			"message": "Invalid input provided",
			"details": gin.H{"field": "value"},
		},
		"meta": gin.H{
			"request_id": "12345",
		},
	}

	response := utils.ErrorResponseWithMeta(http.StatusBadRequest, "Bad Request", "INVALID_INPUT", "Invalid input provided", gin.H{"field": "value"}, gin.H{"request_id": "12345"})
	assert.Equal(t, expected, response)
}
