package tests

import (
	"net/http"
	"reflect"
	"testing"
	"time"

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
func TestLowercaseFirstLetter(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"Hello", "hello"},
		{"world", "world"},
		{"Golang", "golang"},
		{"", ""},
		{"A", "a"},
		{"ABC", "aBC"},
	}

	for _, test := range tests {
		result := utils.LowercaseFirstLetter(test.input)
		if result != test.expected {
			t.Errorf("LowercaseFirstLetter(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}

type SampleStruct struct {
	Field1 string    `json:"field1" binding:"required"`
	Field2 int       `json:"field2" binding:"required"`
	Field3 time.Time `json:"field3" binding:"required"`
}

func TestValidateJSON(t *testing.T) {
	tests := []struct {
		name         string
		data         map[string]interface{}
		expectedType reflect.Type
		expectError  bool
		errorMessage string
	}{
		{
			name: "Valid JSON with required fields",
			data: map[string]interface{}{
				"field1": "value1",
				"field2": 123,
				"field3": "2024-07-01T09:00:00Z",
			},
			expectedType: reflect.TypeOf(SampleStruct{}),
			expectError:  false,
		},
		{
			name: "Missing required field",
			data: map[string]interface{}{
				"field2": 123,
				"field3": "2024-07-01T09:00:00Z",
			},
			expectedType: reflect.TypeOf(SampleStruct{}),
			expectError:  true,
			errorMessage: "missing required field: field1",
		},
		{
			name: "Invalid type for field",
			data: map[string]interface{}{
				"field1": "value1",
				"field2": "not-an-int",
				"field3": "2024-07-01T09:00:00Z",
			},
			expectedType: reflect.TypeOf(SampleStruct{}),
			expectError:  true,
			errorMessage: "field field2 is of incorrect type",
		},
		{
			name: "Invalid time format",
			data: map[string]interface{}{
				"field1": "value1",
				"field2": 123,
				"field3": "not-a-date",
			},
			expectedType: reflect.TypeOf(SampleStruct{}),
			expectError:  true,
			errorMessage: "field field3 is of incorrect format",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := utils.ValidateJSON(tt.data, tt.expectedType)
			if (err != nil) != tt.expectError {
				t.Errorf("ValidateJSON() error = %v, expectError %v", err, tt.expectError)
			}
			if tt.expectError && err.Error() != tt.errorMessage {
				t.Errorf("ValidateJSON() error = %v, errorMessage %v", err.Error(), tt.errorMessage)
			}
		})
	}
}

func TestTypeCheck(t *testing.T) {
	tests := []struct {
		name         string
		value        interface{}
		expectedType reflect.Type
		expected     bool
	}{
		// Basic types
		{"Match int", 42, reflect.TypeOf(42), true},
		{"Match string", "hello", reflect.TypeOf("hello"), true},
		{"Match float", 3.14, reflect.TypeOf(3.14), true},
		{"Mismatch int", "42", reflect.TypeOf(42), false},
		{"Mismatch string", 42, reflect.TypeOf("hello"), false},

		// Pointer types
		{"Pointer match", new(int), reflect.TypeOf(new(int)), true},
		{"Pointer mismatch", new(string), reflect.TypeOf(new(int)), false},
		{"Nil pointer", nil, reflect.TypeOf((*int)(nil)), true},
		{"Non-nil pointer match", new(int), reflect.TypeOf((*int)(nil)), true},
		{"Nil non-pointer", nil, reflect.TypeOf(42), false},

		// Time type
		{"Time type valid RFC3339", "2024-07-01T09:00:00Z", reflect.TypeOf(time.Time{}), true},
		{"Time type invalid RFC3339", "not-a-date", reflect.TypeOf(time.Time{}), false},

		// Slices and arrays
		{"Match slice int", []int{1, 2, 3}, reflect.TypeOf([]int{}), true},
		{"Match array int", [3]int{1, 2, 3}, reflect.TypeOf([3]int{}), true},
		{"Mismatch slice int", []string{"1", "2", "3"}, reflect.TypeOf([]int{}), false},
		{"Mismatch array int", [3]string{"1", "2", "3"}, reflect.TypeOf([3]int{}), false},
		{"Empty slice", []int{}, reflect.TypeOf([]int{}), true},
		{"Empty array", [0]int{}, reflect.TypeOf([0]int{}), true},

		// Nested slices/arrays
		{"Match nested slice int", [][]int{{1, 2}, {3, 4}}, reflect.TypeOf([][]int{}), true},
		{"Mismatch nested slice int", [][]string{{"1", "2"}, {"3", "4"}}, reflect.TypeOf([][]int{}), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.TypeCheck(tt.value, tt.expectedType)
			if result != tt.expected {
				t.Errorf("TypeCheck(%v, %v) = %v; want %v", tt.value, tt.expectedType, result, tt.expected)
			}
		})
	}
}
