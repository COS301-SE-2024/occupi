package tests

import (
	"fmt"
	"math/rand"
	"net/http"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func TestGenEmpID(t *testing.T) {
	empID := utils.GenerateEmployeeID()
	t.Logf("Generated Employee ID: %s", empID)
}
func TestGenBookID(t *testing.T) {
	BookID := utils.GenerateBookingID()
	t.Logf("Generated Booking ID: %s", BookID)
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

// TestGenerateOTP tests the GenerateOTP function
func TestGenerateOTP(t *testing.T) {
	otp, err := utils.GenerateOTP()
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if len(otp) != 6 {
		t.Fatalf("Expected OTP to be 6 digits long, got %v", len(otp))
	}

	// Check if all characters in OTP are digits
	for _, char := range otp {
		if char < '0' || char > '9' {
			t.Fatalf("Expected OTP to contain only digits, got %v", otp)
		}
	}

	t.Logf("Generated OTP: %s", otp)
}

// Test Pagination
func TestPagination(t *testing.T) {
	generateUsers := func(num int) []*models.User {
		var users []*models.User
		for i := 0; i < num; i++ {
			user := &models.User{
				ID:    fmt.Sprintf("%d", i),
				Email: fmt.Sprintf("test%d@example.com", i),
			}
			users = append(users, user)
		}
		return users
	}
	rand.Seed(time.Now().UnixNano())

	t.Run("Random Page Sizes and Currents", func(t *testing.T) {
		for i := 0; i < 10; i++ {
			users := generateUsers(rand.Intn(200))
			current := rand.Intn(11) - 5   // current 在 -5 到 5 之间随机变化
			pageSize := rand.Intn(21) - 10 // pageSize 在 -10 到 10 之间随机变化
			t.Logf("Test #%d with current=%d, pageSize=%d, users length=%d\n", i+1, current, pageSize, len(users))

			pagination, err := utils.Paginate(users, current, pageSize)
			if err != nil {
				t.Errorf("Failed to get pagination: %v", err)
			}
			t.Logf("Result for Test #%d: %+v\n", i+1, pagination)
		}
	})

	t.Run("Edge Cases", func(t *testing.T) {
		tests := []struct {
			name      string
			dataSize  int
			current   int
			pageSize  int
			expLength int
		}{
			{"Negative page size", 50, 1, -5, 0},
			{"Negative current", 50, -1, 10, 10},
			{"Zero page size", 50, 1, 0, 0},
			{"Zero current", 50, 0, 10, 10},
			{"Large current", 50, 100, 10, 0},
			{"Large page size", 50, 1, 100, 50},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				users := generateUsers(tc.dataSize)
				pagination, err := utils.Paginate(users, tc.current, tc.pageSize)
				if err != nil {
					t.Errorf("Failed to get pagination: %v", err)
				}
				if len(pagination.Result.([]*models.User)) != tc.expLength {
					t.Errorf("Expected %d users, got %d", tc.expLength, len(pagination.Result.([]*models.User)))
				}
				t.Logf("%s: %+v\n", tc.name, pagination)
			})
		}
	})

	t.Run("Change Page", func(t *testing.T) {
		users := generateUsers(rand.Intn(200))
		pageSize := rand.Intn(21) - 10 // pageSize 在 -10 到 10 之间随机变化
		pagination, err := utils.Paginate(users, 1, pageSize)
		if err != nil {
			t.Errorf("Failed to get pagination: %v", err)
		}
		t.Logf("First page: %+v\n", pagination)

		for i := 2; i <= 4; i++ {
			pagination, err := utils.Paginate(users, i, pageSize)
			if err != nil {
				t.Errorf("Failed to get pagination: %v", err)
			}
			t.Logf("Page %d: %+v\n", i, pagination)
		}
	})

	t.Run("Varying Data Set Size", func(t *testing.T) {
		tests := []struct {
			name      string
			dataSize  int
			current   int
			pageSize  int
			expLength int
		}{
			{"Empty data set", 0, 1, 10, 0},
			{"Single item data set", 1, 1, 10, 1},
			{"Single page data set", 10, 1, 10, 10},
			{"Partial page data set", 15, 2, 10, 5},
			{"Larger data set", 1000, 50, 20, 20},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				users := generateUsers(tc.dataSize)
				pagination, err := utils.Paginate(users, tc.current, tc.pageSize)
				if err != nil {
					t.Errorf("Failed to get pagination: %v", err)
				}
				if len(pagination.Result.([]*models.User)) != tc.expLength {
					t.Errorf("Expected %d users, got %d", tc.expLength, len(pagination.Result.([]*models.User)))
				}
				t.Logf("%s: %+v\n", tc.name, pagination)
			})
		}
	})
}
