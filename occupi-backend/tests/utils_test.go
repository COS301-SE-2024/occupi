package tests

import (
	// "encoding/json"

	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/sirupsen/logrus"
	"github.com/sirupsen/logrus/hooks/test"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"

	// "github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
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

func TestValidateEmployeeID(t *testing.T) {
	tests := []struct {
		name     string
		empID    string
		expected bool
	}{
		{
			name:     "Valid Employee ID",
			empID:    "OCCUPI20240000",
			expected: true,
		},
		{
			name:     "Too short",
			empID:    "OCCUPI123",
			expected: false,
		},
		{
			name:     "Invalid prefix",
			empID:    "OCCUPY20240000",
			expected: false,
		},
		{
			name:     "Invalid suffix",
			empID:    "OCCUPI2024000",
			expected: false,
		},
		{
			name:     "Non-numeric characters",
			empID:    "OCCUPI2024A000",
			expected: false,
		},
		{
			name:     "Empty string",
			empID:    "",
			expected: false,
		},
		{
			name:     "Alphanumeric Employee ID",
			empID:    "OCCUPI2024A00",
			expected: false,
		},
		{
			name:     "Employee ID with special characters",
			empID:    "OCCUPI2024@000",
			expected: false,
		},
		{
			name:     "Whitespace in Employee ID",
			empID:    "OCCUPI2024 000",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ValidateEmployeeID(tt.empID)
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

func TestCompareArgon2IDHashAfterSanitizing(t *testing.T) {
	password := "password123$"
	wrongPassword := "wrongpassword"

	hash, err := utils.Argon2IDHash(utils.SanitizeInput(password))
	assert.NoError(t, err)
	assert.NotEmpty(t, hash)

	t.Run("Correct password sanitized", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(utils.SanitizeInput(password), hash)
		assert.NoError(t, err)
		assert.True(t, match)
	})

	t.Run("Incorrect password sanitized", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(utils.SanitizeInput(wrongPassword), hash)
		assert.NoError(t, err)
		assert.False(t, match)
	})

	t.Run("Empty password sanitized", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(utils.SanitizeInput(""), hash)
		assert.NoError(t, err)
		assert.False(t, match)
	})

	t.Run("Empty hash sanitized", func(t *testing.T) {
		match, err := utils.CompareArgon2IDHash(utils.SanitizeInput(password), "")
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

// TestGetErrorMsg uses actual validation failures to generate FieldError objects.
func TestGetErrorMsg(t *testing.T) {
	validate := validator.New()
	type TestStruct struct {
		Username string `validate:"required"`
		Email    string `validate:"required,email"`
		Age      int    `validate:"min=18"`
	}

	// Instance of TestStruct that will fail validation for different reasons.
	testInstance := TestStruct{
		Username: "",             // Will trigger "required" validation for Username.
		Email:    "not-an-email", // Will trigger "email" validation for Email.
		Age:      16,             // Will trigger "min" validation for Age.
	}

	err := validate.Struct(testInstance)
	assert.NotNil(t, err)

	// Assuming err is of type validator.ValidationErrors, which implements the error interface.
	validationErrors := err.(validator.ValidationErrors)

	for _, fe := range validationErrors {
		t.Run("Field: "+fe.Field(), func(t *testing.T) {
			result := utils.GetErrorMsg(fe)
			switch fe.Field() {
			case "Username":
				assert.Equal(t, "The username field is required", result)
			case "Email":
				assert.Equal(t, "The Email field must be a valid email address", result)
			case "Age":
				assert.Equal(t, "The Age field must be greater than 18", result)
			default:
				t.Errorf("Unhandled field: %s", fe.Field())
			}
		})
	}

	// Instance of TestStruct that will pass validation.
	testInstance = TestStruct{
		Username: "john.doe",
		Email:    "john.doe@gmail.com",
		Age:      21,
	}

	err = validate.Struct(testInstance)
	assert.Nil(t, err)

	// No errors should be returned.
	assert.Empty(t, err)

	// Instance of Teststruct that will fail as username is not valid
	testInstance = TestStruct{
		Username: "",
		Email:    "john.doe@gmail.com",
		Age:      21,
	}

	err = validate.Struct(testInstance)
	assert.NotNil(t, err)

	// Assuming err is of type validator.ValidationErrors, which implements the error interface.
	validationErrors = err.(validator.ValidationErrors)

	for _, fe := range validationErrors {
		t.Run("Field: "+fe.Field(), func(t *testing.T) {
			result := utils.GetErrorMsg(fe)
			switch fe.Field() {
			case "Username":
				assert.Equal(t, "The username field is required", result)
			default:
				t.Errorf("Unhandled field: %s", fe.Field())
			}
		})
	}

	// Instance of Teststruct that will fail as email is not valid
	testInstance = TestStruct{
		Username: "john.doe",
		Email:    "john.doe",
		Age:      21,
	}

	err = validate.Struct(testInstance)
	assert.NotNil(t, err)

	// Assuming err is of type validator.ValidationErrors, which implements the error interface.
	validationErrors = err.(validator.ValidationErrors)

	for _, fe := range validationErrors {
		t.Run("Field: "+fe.Field(), func(t *testing.T) {
			result := utils.GetErrorMsg(fe)
			switch fe.Field() {
			case "Email":
				assert.Equal(t, "The Email field must be a valid email address", result)
			default:
				t.Errorf("Unhandled field: %s", fe.Field())
			}
		})
	}

	// Instance of Teststruct that will fail as age is not valid
	testInstance = TestStruct{
		Username: "john.doe",
		Email:    "john.doe@gmail.com",
		Age:      16,
	}

	err = validate.Struct(testInstance)
	assert.NotNil(t, err)

	// Assuming err is of type validator.ValidationErrors, which implements the error interface.
	validationErrors = err.(validator.ValidationErrors)

	for _, fe := range validationErrors {
		t.Run("Field: "+fe.Field(), func(t *testing.T) {
			result := utils.GetErrorMsg(fe)
			switch fe.Field() {
			case "Age":
				assert.Equal(t, "The Age field must be greater than 18", result)
			default:
				t.Errorf("Unhandled field: %s", fe.Field())
			}
		})
	}
}

func TestAppendHeader(t *testing.T) {
	tests := []struct {
		title    string
		expected string
	}{
		{
			title: "Booking",
			expected: `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Booking</title>
		<style>
			/* Inline CSS for better compatibility */
			.header {
				background-color: #f8f9fa;
				padding: 20px;
				text-align: center;
				font-family: Arial, sans-serif;
			}
			.content {
				padding: 20px;
				font-family: Arial, sans-serif;
			}
			.footer {
				padding: 10px;
				text-align: center;
				font-family: Arial, sans-serif;
				font-size: 12px;
				color: #888;
			}
		</style>
	</head>
	<body>
		<div class="header">
			<h1>Occupi Booking</h1>
		</div>
	`,
		},
		{
			title: "Confirmation",
			expected: `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Confirmation</title>
		<style>
			/* Inline CSS for better compatibility */
			.header {
				background-color: #f8f9fa;
				padding: 20px;
				text-align: center;
				font-family: Arial, sans-serif;
			}
			.content {
				padding: 20px;
				font-family: Arial, sans-serif;
			}
			.footer {
				padding: 10px;
				text-align: center;
				font-family: Arial, sans-serif;
				font-size: 12px;
				color: #888;
			}
		</style>
	</head>
	<body>
		<div class="header">
			<h1>Occupi Confirmation</h1>
		</div>
	`,
		},
	}

	for _, tt := range tests {
		t.Run("TestAppendHeader", func(t *testing.T) {
			actual := utils.AppendHeader(tt.title)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestAppendFooter(t *testing.T) {
	expected := `
		<div class="footer" style="text-align:center; padding:10px; font-size:12px;">
			<img src="https://raw.githubusercontent.com/COS301-SE-2024/occupi/develop/presentation/Occupi/Occupi-black.png" alt="Business Banner" style="width:80%; max-width:600px; height:auto; margin-bottom:10px;">
			<p style="margin:5px 0;">140 Lunnon Road, Hillcrest, Pretoria. PO Box 14679, Hatfield, 0028</p>
		</div>
		</body>
		</html>
	`

	actual := utils.AppendFooter()
	if strings.TrimSpace(actual) != strings.TrimSpace(expected) {
		t.Errorf("expected %q, got %q", expected, actual)
	}
}

func TestFormatBookingEmailBody(t *testing.T) {
	tests := []struct {
		bookingID string
		roomID    string
		slot      int
		expected  string
	}{
		{
			bookingID: "12345",
			roomID:    "A1",
			slot:      1,
			expected: `
		Dear User,

		Thank you for booking with Occupi. Here are your booking details:

		Booking ID: 12345
		Room ID: A1
		Slot: 1

		If you have any questions, feel free to contact us.

		Thank you,
		The Occupi Team
		`,
		},
		{
			bookingID: "67890",
			roomID:    "B2",
			slot:      2,
			expected: `
		Dear User,

		Thank you for booking with Occupi. Here are your booking details:

		Booking ID: 67890
		Room ID: B2
		Slot: 2

		If you have any questions, feel free to contact us.

		Thank you,
		The Occupi Team
		`,
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatBookingEmailBody", func(t *testing.T) {
			actual := utils.FormatBookingEmailBody(tt.bookingID, tt.roomID, tt.slot)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatBookingEmailBodyForBooker(t *testing.T) {
	tests := []struct {
		bookingID string
		roomID    string
		slot      int
		attendees []string
		email     string
		expected  string
	}{
		{
			bookingID: "12345",
			roomID:    "A1",
			slot:      1,
			attendees: []string{"attendee1@example.com", "attendee2@example.com"},
			email:     "booker@example.com",
			expected: utils.AppendHeader("Booking") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully booked an office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> 12345<br>
				<b>Room ID:</b> A1<br>
				<b>Slot:</b> 1<br><br>
				<b>Attendees:</b><ul><li>attendee1@example.com</li><li>attendee2@example.com</li></ul><br><br>
				Please ensure you arrive on time for your booking.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
		{
			bookingID: "67890",
			roomID:    "B2",
			slot:      2,
			attendees: []string{"attendee3@example.com"},
			email:     "booker@example.com",
			expected: utils.AppendHeader("Booking") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully booked an office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> 67890<br>
				<b>Room ID:</b> B2<br>
				<b>Slot:</b> 2<br><br>
				<b>Attendees:</b><ul><li>attendee3@example.com</li></ul><br><br>
				Please ensure you arrive on time for your booking.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatBookingEmailBodyForBooker", func(t *testing.T) {
			actual := utils.FormatBookingEmailBodyForBooker(tt.bookingID, tt.roomID, tt.slot, tt.attendees, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatCancellationEmailBodyForBooker(t *testing.T) {
	tests := []struct {
		bookingID string
		roomID    string
		slot      int
		email     string
		expected  string
	}{
		{
			bookingID: "12345",
			roomID:    "A1",
			slot:      1,
			email:     "booker@example.com",
			expected: utils.AppendHeader("Cancellation") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully cancelled your booked office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> 12345<br>
				<b>Room ID:</b> A1<br>
				<b>Slot:</b> 1<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
		{
			bookingID: "67890",
			roomID:    "B2",
			slot:      2,
			email:     "booker@example.com",
			expected: utils.AppendHeader("Cancellation") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully cancelled your booked office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> 67890<br>
				<b>Room ID:</b> B2<br>
				<b>Slot:</b> 2<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatCancellationEmailBodyForBooker", func(t *testing.T) {
			actual := utils.FormatCancellationEmailBodyForBooker(tt.bookingID, tt.roomID, tt.slot, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatBookingEmailBodyForAttendees(t *testing.T) {
	tests := []struct {
		bookingID string
		roomID    string
		slot      int
		email     string
		expected  string
	}{
		{
			bookingID: "12345",
			roomID:    "A1",
			slot:      1,
			email:     "organizer@example.com",
			expected: utils.AppendHeader("Booking") + `
		<div class="content">
			<p>Dear attendees,</p>
			<p>
				organizer@example.com has booked an office space and invited you to join. Here are the booking details:<br><br>
				<b>Booking ID:</b> 12345<br>
				<b>Room ID:</b> A1<br>
				<b>Slot:</b> 1<br><br>
				If you have any questions, feel free to contact us.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
		{
			bookingID: "67890",
			roomID:    "B2",
			slot:      2,
			email:     "booker@example.com",
			expected: utils.AppendHeader("Booking") + `
		<div class="content">
			<p>Dear attendees,</p>
			<p>
				booker@example.com has booked an office space and invited you to join. Here are the booking details:<br><br>
				<b>Booking ID:</b> 67890<br>
				<b>Room ID:</b> B2<br>
				<b>Slot:</b> 2<br><br>
				If you have any questions, feel free to contact us.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatBookingEmailBodyForAttendees", func(t *testing.T) {
			actual := utils.FormatBookingEmailBodyForAttendees(tt.bookingID, tt.roomID, tt.slot, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatCancellationEmailBodyForAttendees(t *testing.T) {
	tests := []struct {
		bookingID string
		roomID    string
		slot      int
		email     string
		expected  string
	}{
		{
			bookingID: "B123",
			roomID:    "R456",
			slot:      7,
			email:     "user@example.com",
			expected: utils.AppendHeader("Booking") + `
		<div class="content">
			<p>Dear attendees,</p>
			<p>
				user@example.com has cancelled the booked office space with the following details:<br><br>
				<b>Booking ID:</b> B123<br>
				<b>Room ID:</b> R456<br>
				<b>Slot:</b> 7<br><br>
				If you have any questions, feel free to contact us.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatCancellationEmailBodyForAttendees", func(t *testing.T) {
			actual := utils.FormatCancellationEmailBodyForAttendees(tt.bookingID, tt.roomID, tt.slot, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatEmailVerificationBody(t *testing.T) {
	tests := []struct {
		otp      string
		email    string
		expected string
	}{
		{
			otp:   "123456",
			email: "user@example.com",
			expected: utils.AppendHeader("Registration") + `
		<div class="content">
			<p>Dear user@example.com,</p>
			<p>
				Thank you for registering with Occupi. <br><br>
				To complete your registration, please use the following One-Time Password (OTP) to verify your email address:<br>
				OTP: <b>123456</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
		{
			otp:   "654321",
			email: "example@domain.com",
			expected: utils.AppendHeader("Registration") + `
		<div class="content">
			<p>Dear example@domain.com,</p>
			<p>
				Thank you for registering with Occupi. <br><br>
				To complete your registration, please use the following One-Time Password (OTP) to verify your email address:<br>
				OTP: <b>654321</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatEmailVerificationBody", func(t *testing.T) {
			actual := utils.FormatEmailVerificationBody(tt.otp, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatReVerificationEmailBody(t *testing.T) {
	tests := []struct {
		otp      string
		email    string
		expected string
	}{
		{
			otp:   "123456",
			email: "user@example.com",
			expected: utils.AppendHeader("Re-verification") + `
		<div class="content">
			<p>Dear user@example.com,</p>
			<p>
				Thank you for using Occupi. <br><br>
				To verify your email address, please use the following One-Time Password (OTP):<br>
				OTP: <b>123456</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatReVerificationEmailBody", func(t *testing.T) {
			actual := utils.FormatReVerificationEmailBody(tt.otp, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatResetPasswordEmailBody(t *testing.T) {
	tests := []struct {
		otp      string
		email    string
		expected string
	}{
		{
			otp:   "123456",
			email: "user@example.com",
			expected: utils.AppendHeader("Password Reset") + `
		<div class="content">
			<p>Dear user@example.com,</p>
			<p>
				You have requested to reset your password. Your One-Time Password (OTP) is:<br>
				<h2 style="color: #4a4a4a; background-color: #f0f0f0; padding: 10px; display: inline-block;">123456</h2><br><br>
				Please use this OTP to reset your password. If you did not request this email, please ignore it.<br><br>
				This OTP will expire in 10 minutes.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatResetPasswordEmailBody", func(t *testing.T) {
			actual := utils.FormatResetPasswordEmailBody(tt.otp, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatTwoFAEmailBody(t *testing.T) {
	tests := []struct {
		otp      string
		email    string
		expected string
	}{
		{
			otp:   "123456",
			email: "user@example.com",
			expected: utils.AppendHeader("Two-Factor Authentication") + `
		<div class="content">
			<p>Dear user@example.com,</p>
			<p>
				You have requested to enable Two-Factor Authentication. Your One-Time Password (OTP) is:<br>
				<h2 style="color: #4a4a4a; background-color: #f0f0f0; padding: 10px; display: inline-block;">123456</h2><br><br>
				Please use this OTP to enable Two-Factor Authentication. If you did not request this email, please ignore it.<br><br>
				This OTP will expire in 10 minutes.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatTwoFAEmailBody", func(t *testing.T) {
			actual := utils.FormatTwoFAEmailBody(tt.otp, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestSantizeFilter(t *testing.T) {
	tests := []struct {
		name     string
		input    models.QueryInput
		expected primitive.M
	}{
		{
			name:     "Empty Filter",
			input:    models.QueryInput{},
			expected: bson.M{},
		},
		{
			name: "Removes password field from filter",
			input: models.QueryInput{
				Filter: map[string]interface{}{
					"username": "testuser",
					"password": "password123",
				},
			},
			expected: bson.M{
				"username": "testuser",
			},
		},
		{
			name: "Filter without password field",
			input: models.QueryInput{
				Filter: map[string]interface{}{
					"username": "testuser",
				},
			},
			expected: bson.M{
				"username": "testuser",
			},
		},
		{
			name: "Nil filter",
			input: models.QueryInput{
				Filter: nil,
			},
			expected: bson.M{},
		},
		{
			name: "Filter with Password",
			input: models.QueryInput{
				Filter: map[string]interface{}{
					"username": "testuser",
					"password": "secret",
				},
			},
			expected: bson.M{
				"username": "testuser",
			},
		},
		{
			name: "Filter with Operator",
			input: models.QueryInput{
				Operator: "gt",
				Filter: map[string]interface{}{
					"age": 30,
				},
			},
			expected: bson.M{
				"age": bson.M{"$gt": 30},
			},
		},
		{
			name: "Filter with Invalid Operator",
			input: models.QueryInput{
				Operator: "invalid",
				Filter: map[string]interface{}{
					"age": 30,
				},
			},
			expected: bson.M{
				"age": 30,
			},
		},
		{
			name: "Filter with UnsentExpoPushTokens",
			input: models.QueryInput{
				Filter: map[string]interface{}{
					"username":             "testuser",
					"unsentExpoPushTokens": []string{"token1", "token2"},
				},
			},
			expected: bson.M{
				"username": "testuser",
			},
		},
		{
			name: "Valid Filter with Multiple Conditions",
			input: models.QueryInput{
				Operator: "in",
				Filter: map[string]interface{}{
					"status": []string{"active", "inactive"},
				},
			},
			expected: bson.M{
				"status": bson.M{"$in": []string{"active", "inactive"}},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.SantizeFilter(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("SantizeFilter() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestSanitizeSort(t *testing.T) {
	tests := []struct {
		name     string
		input    models.QueryInput
		expected primitive.M
	}{
		{
			name:     "Empty Sort",
			input:    models.QueryInput{},
			expected: bson.M{},
		},
		{
			name: "Sort by OrderAsc",
			input: models.QueryInput{
				OrderAsc: "username",
			},
			expected: bson.M{"username": 1},
		},
		{
			name: "Sort by OrderDesc",
			input: models.QueryInput{
				OrderDesc: "age",
			},
			expected: bson.M{"age": -1},
		},
		{
			name: "Sort by Both OrderAsc and OrderDesc",
			input: models.QueryInput{
				OrderAsc:  "username",
				OrderDesc: "age",
			},
			expected: bson.M{"username": 1, "age": -1},
		},
		{
			name: "Filter with Password and UnsentExpoPushTokens",
			input: models.QueryInput{
				Filter: map[string]interface{}{
					"username":             "testuser",
					"password":             "secret",
					"unsentExpoPushTokens": []string{"token1", "token2"},
				},
				OrderAsc: "username",
			},
			expected: bson.M{"username": 1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.SanitizeSort(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("SanitizeSort() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestSantizeProjection(t *testing.T) {
	tests := []struct {
		name     string
		input    models.QueryInput
		expected []string
	}{
		{
			name:     "Empty Projection",
			input:    models.QueryInput{},
			expected: []string{},
		},
		{
			name: "Projection without Password and UnsentExpoPushTokens",
			input: models.QueryInput{
				Projection: []string{"username", "age"},
			},
			expected: []string{"username", "age"},
		},
		{
			name: "Projection with Password",
			input: models.QueryInput{
				Projection: []string{"username", "password", "age"},
			},
			expected: []string{"username", "age"},
		},
		{
			name: "Projection with UnsentExpoPushTokens",
			input: models.QueryInput{
				Projection: []string{"username", "unsentExpoPushTokens", "age"},
			},
			expected: []string{"username", "age"},
		},
		{
			name: "Projection with Emails",
			input: models.QueryInput{
				Projection: []string{"username", "emails", "age"},
			},
			expected: []string{"username", "emails", "age"},
		},
		{
			name: "Projection with Password, UnsentExpoPushTokens, and Emails",
			input: models.QueryInput{
				Projection: []string{"username", "password", "unsentExpoPushTokens", "emails", "age"},
			},
			expected: []string{"username", "emails", "age"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.SantizeProjection(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("SantizeProjection() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestConstructProjection(t *testing.T) {
	tests := []struct {
		name                string
		queryInput          models.QueryInput
		sanitizedProjection []string
		expected            bson.M
	}{
		{
			name:                "Empty Projection",
			queryInput:          models.QueryInput{},
			sanitizedProjection: []string{},
			expected: bson.M{
				"password":             0,
				"unsentExpoPushTokens": 0,
				"_id":                  0,
			},
		},
		{
			name: "Sanitized Projection without Password and UnsentExpoPushTokens",
			queryInput: models.QueryInput{
				Projection: []string{"username", "age"},
			},
			sanitizedProjection: []string{"username", "age"},
			expected: bson.M{
				"username": 1,
				"age":      1,
				"_id":      0,
			},
		},
		{
			name: "Sanitized Projection with Password",
			queryInput: models.QueryInput{
				Projection: []string{"username", "password", "age"},
			},
			sanitizedProjection: []string{"username", "age"},
			expected: bson.M{
				"username": 1,
				"age":      1,
				"_id":      0,
			},
		},
		{
			name: "Sanitized Projection with UnsentExpoPushTokens",
			queryInput: models.QueryInput{
				Projection: []string{"username", "unsentExpoPushTokens", "age"},
			},
			sanitizedProjection: []string{"username", "age"},
			expected: bson.M{
				"username": 1,
				"age":      1,
				"_id":      0,
			},
		},
		{
			name: "Sanitized Projection with Emails",
			queryInput: models.QueryInput{
				Projection: []string{"username", "emails", "age"},
			},
			sanitizedProjection: []string{"username", "emails", "age"},
			expected: bson.M{
				"username": 1,
				"emails":   1,
				"age":      1,
				"_id":      0,
			},
		},
		{
			name: "Sanitized Projection with Password, UnsentExpoPushTokens, and Emails",
			queryInput: models.QueryInput{
				Projection: []string{"username", "password", "unsentExpoPushTokens", "emails", "age"},
			},
			sanitizedProjection: []string{"username", "age"},
			expected: bson.M{
				"username": 1,
				"age":      1,
				"_id":      0,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ConstructProjection(tt.queryInput, tt.sanitizedProjection)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("ConstructProjection() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestGetLimitPageSkip(t *testing.T) {
	tests := []struct {
		name       string
		queryInput models.QueryInput
		wantLimit  int64
		wantPage   int64
		wantSkip   int64
	}{
		{
			name: "Valid limit and page",
			queryInput: models.QueryInput{
				Limit: 10,
				Page:  2,
			},
			wantLimit: 10,
			wantPage:  2,
			wantSkip:  10,
		},
		{
			name: "Limit exceeds maximum",
			queryInput: models.QueryInput{
				Limit: 100,
				Page:  1,
			},
			wantLimit: 50,
			wantPage:  1,
			wantSkip:  0,
		},
		{
			name: "Negative limit",
			queryInput: models.QueryInput{
				Limit: -1,
				Page:  1,
			},
			wantLimit: 50,
			wantPage:  1,
			wantSkip:  0,
		},
		{
			name: "Zero page",
			queryInput: models.QueryInput{
				Limit: 10,
				Page:  0,
			},
			wantLimit: 10,
			wantPage:  1,
			wantSkip:  0,
		},
		{
			name: "Negative page",
			queryInput: models.QueryInput{
				Limit: 10,
				Page:  -1,
			},
			wantLimit: 10,
			wantPage:  1,
			wantSkip:  0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotLimit, gotPage, gotSkip := utils.GetLimitPageSkip(tt.queryInput)
			if gotLimit != tt.wantLimit {
				t.Errorf("GetLimitPageSkip() gotLimit = %v, want %v", gotLimit, tt.wantLimit)
			}
			if gotPage != tt.wantPage {
				t.Errorf("GetLimitPageSkip() gotPage = %v, want %v", gotPage, tt.wantPage)
			}
			if gotSkip != tt.wantSkip {
				t.Errorf("GetLimitPageSkip() gotSkip = %v, want %v", gotSkip, tt.wantSkip)
			}
		})
	}
}

func TestComputeLimitPageSkip(t *testing.T) {
	tests := []struct {
		name      string
		Limit     int64
		Page      int64
		wantLimit int64
		wantPage  int64
		wantSkip  int64
	}{
		{
			name:      "Valid limit and page",
			Limit:     10,
			Page:      2,
			wantLimit: 10,
			wantPage:  2,
			wantSkip:  10,
		},
		{
			name:      "Limit exceeds maximum",
			Limit:     100,
			Page:      1,
			wantLimit: 50,
			wantPage:  1,
			wantSkip:  0,
		},
		{
			name:      "Negative limit",
			Limit:     -1,
			Page:      1,
			wantLimit: 50,
			wantPage:  1,
			wantSkip:  0,
		},
		{
			name:      "Zero page",
			Limit:     10,
			Page:      0,
			wantLimit: 10,
			wantPage:  1,
			wantSkip:  0,
		},
		{
			name:      "Negative page",
			Limit:     10,
			Page:      -1,
			wantLimit: 10,
			wantPage:  1,
			wantSkip:  0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotLimit, gotPage, gotSkip := utils.ComputeLimitPageSkip(tt.Limit, tt.Page)
			if gotLimit != tt.wantLimit {
				t.Errorf("ComputeLimitPageSkip() gotLimit = %v, want %v", gotLimit, tt.wantLimit)
			}
			if gotPage != tt.wantPage {
				t.Errorf("ComputeLimitPageSkip() gotPage = %v, want %v", gotPage, tt.wantPage)
			}
			if gotSkip != tt.wantSkip {
				t.Errorf("ComputeLimitPageSkip() gotSkip = %v, want %v", gotSkip, tt.wantSkip)
			}
		})
	}
}

func TestFormatIPAddressConfirmationEmailBody(t *testing.T) {
	tests := []struct {
		otp      string
		email    string
		expected string
	}{
		{
			otp:   "123456",
			email: "user@example.com",
			expected: utils.AppendHeader("IP Address Confirmation") + `
		<div class="content">
			<p>Dear user@example.com,</p>
			<p>
				Thank you for using Occupi. <br><br>
				We have detected a new login attempt from an unrecognized IP address. To confirm this login, please use the following One-Time Password (OTP):<br>
				OTP: <b>123456</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatIPAddressConfirmationEmailBody", func(t *testing.T) {
			actual := utils.FormatIPAddressConfirmationEmailBody(tt.otp, tt.email)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestFormatIPAddressConfirmationEmailBodyWithIPInfo(t *testing.T) {
	tests := []struct {
		otp                string
		email              string
		unrecognizedLogger *ipinfo.Core
		expected           string
	}{
		{
			otp:   "123456",
			email: "user@example.com",
			unrecognizedLogger: &ipinfo.Core{
				IP:          net.ParseIP("8.8.8.8"),
				City:        "Mountain View",
				Region:      "California",
				CountryName: "United States",
			},
			expected: utils.AppendHeader("IP Address Confirmation") + `
		<div class="content">
			<p>Dear user@example.com,</p>
			<p>
				Thank you for using Occupi. <br><br>
				We have detected a new login attempt from 8.8.8.8 in Mountain View, California, United States<br>To confirm this login, please use the following One-Time Password (OTP):<br>
				OTP: <b>123456</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter(),
		},
	}

	for _, tt := range tests {
		t.Run("TestFormatIPAddressConfirmationEmailBodyWithIPInfo", func(t *testing.T) {
			actual := utils.FormatIPAddressConfirmationEmailBodyWithIPInfo(tt.otp, tt.email, tt.unrecognizedLogger)
			if strings.TrimSpace(actual) != strings.TrimSpace(tt.expected) {
				t.Errorf("expected %q, got %q", tt.expected, actual)
			}
		})
	}
}

func TestValidateEmails(t *testing.T) {
	tests := []struct {
		name   string
		emails []string
		want   bool
	}{
		{
			name:   "All valid emails",
			emails: []string{"test@example.com", "hello@world.com", "user.name+tag+sorting@example.com"},
			want:   true,
		},
		{
			name:   "One invalid email",
			emails: []string{"test@example.com", "invalid-email", "user.name+tag+sorting@example.com"},
			want:   false,
		},
		{
			name:   "All invalid emails",
			emails: []string{"invalid-email1", "invalid-email2", "invalid-email3"},
			want:   false,
		},
		{
			name:   "Empty email list",
			emails: []string{},
			want:   true,
		},
		{
			name:   "Mixed valid and invalid emails",
			emails: []string{"valid.email@example.com", "invalid-email"},
			want:   false,
		},
		{
			name:   "Single valid email",
			emails: []string{"valid.email@example.com"},
			want:   true,
		},
		{
			name:   "Single invalid email",
			emails: []string{"invalid-email"},
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := utils.ValidateEmails(tt.emails); got != tt.want {
				t.Errorf("ValidateEmails() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestSanitizeInputArray(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{
			name:     "Plain text",
			input:    []string{"Hello, world!", "This is a test.", "12345"},
			expected: []string{"Hello, world!", "This is a test.", "12345"},
		},
		{
			name:     "HTML input",
			input:    []string{"<p>Hello, world!</p>", "<h1>This is a test.</h1>", "<b>12345</b>"},
			expected: []string{"<p>Hello, world!</p>", "<h1>This is a test.</h1>", "<b>12345</b>"},
		},
		{
			name:     "HTML with allowed tags",
			input:    []string{"<b>Hello</b>, <i>world</i>!", "<b>Hello</b>"},
			expected: []string{"<b>Hello</b>, <i>world</i>!", "<b>Hello</b>"},
		},
		{
			name:     "HTML with disallowed tags",
			input:    []string{"<script>alert('xss')</script><b>Hello</b>", "<script>alert('attack')</script>", "<script>alert('hacked')</script>"},
			expected: []string{"<b>Hello</b>", "", ""},
		},
		{
			name:     "HTML with attributes",
			input:    []string{"<a href=\"http://example.com\" onclick=\"evil()\">link</a>", "<a href=\"http://example.com\" onclick=\"evil()\">link</a>"},
			expected: []string{"<a href=\"http://example.com\" rel=\"nofollow\">link</a>", "<a href=\"http://example.com\" rel=\"nofollow\">link</a>"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.SanitizeInputArray(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestConstructBookingScheduledString(t *testing.T) {
	tests := []struct {
		name     string
		emails   []string
		expected string
	}{
		{
			name:     "No Email",
			emails:   []string{},
			expected: "",
		},
		{
			name:     "Single Email",
			emails:   []string{"email1@example.com"},
			expected: "A booking with email1@example.com has been scheduled",
		},
		{
			name:     "Two Emails",
			emails:   []string{"email1@example.com", "email2@example.com"},
			expected: "A booking with email1@example.com and email2@example.com has been scheduled",
		},
		{
			name:     "Three Emails",
			emails:   []string{"email1@example.com", "email2@example.com", "email3@example.com"},
			expected: "A booking with email1@example.com, email2@example.com and 2 others has been scheduled",
		},
		{
			name:     "Four Emails",
			emails:   []string{"email1@example.com", "email2@example.com", "email3@example.com", "email4@example.com"},
			expected: "A booking with email1@example.com, email2@example.com and 3 others has been scheduled",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ConstructBookingScheduledString(tt.emails)
			if result != tt.expected {
				t.Errorf("ConstructBookingScheduledString() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestConstructBookingStartingInScheduledString(t *testing.T) {
	tests := []struct {
		name      string
		emails    []string
		startTime string
		expected  string
	}{
		{
			name:      "Single Email, Starts in Now",
			emails:    []string{"email1@example.com"},
			startTime: "now",
			expected:  "A booking with email1@example.com starts in a few seconds",
		},
		{
			name:      "Two Emails, Starts in 10 minutes",
			emails:    []string{"email1@example.com", "email2@example.com"},
			startTime: "10 minutes",
			expected:  "A booking with email1@example.com and email2@example.com starts in 10 minutes",
		},
		{
			name:      "Three Emails, Starts in 30 minutes",
			emails:    []string{"email1@example.com", "email2@example.com", "email3@example.com"},
			startTime: "30 minutes",
			expected:  "A booking with email1@example.com, email2@example.com and 2 others starts in 30 minutes",
		},
		{
			name:      "Four Emails, Starts in an hour",
			emails:    []string{"email1@example.com", "email2@example.com", "email3@example.com", "email4@example.com"},
			startTime: "an hour",
			expected:  "A booking with email1@example.com, email2@example.com and 3 others starts in an hour",
		},
		{
			name:      "No Emails",
			emails:    []string{},
			startTime: "10 minutes",
			expected:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Capture log output
			var logOutput string
			hook := test.NewLocal(logrus.StandardLogger())
			defer hook.Reset()

			result := utils.ConstructBookingStartingInScheduledString(tt.emails, tt.startTime)

			if tt.name == "No Emails" {
				if result != tt.expected {
					t.Errorf("ConstructBookingStartingInScheduledString() = %v, want %v", result, tt.expected)
				}
				for _, entry := range hook.AllEntries() {
					logOutput += entry.Message
				}
				if logOutput != "No emails provided" {
					t.Errorf("Expected log output to be 'No emails provided', but got %s", logOutput)
				}
			} else {
				if result != tt.expected {
					t.Errorf("ConstructBookingStartingInScheduledString() = %v, want %v", result, tt.expected)
				}
			}
		})
	}
}

func TestPrependEmailtoSlice(t *testing.T) {
	tests := []struct {
		name     string
		emails   []string
		email    string
		expected []string
	}{
		{
			name:     "Prepend to Empty Slice",
			emails:   []string{},
			email:    "newemail@example.com",
			expected: []string{"newemail@example.com"},
		},
		{
			name:     "Prepend to Non-Empty Slice",
			emails:   []string{"email1@example.com", "email2@example.com"},
			email:    "newemail@example.com",
			expected: []string{"newemail@example.com", "email1@example.com", "email2@example.com"},
		},
		{
			name:     "Prepend to Slice with One Element",
			emails:   []string{"email1@example.com"},
			email:    "newemail@example.com",
			expected: []string{"newemail@example.com", "email1@example.com"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.PrependEmailtoSlice(tt.emails, tt.email)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("PrependEmailtoSlice() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestConvertToStringArray(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected []string
	}{
		{
			name:     "Single String",
			input:    "singleString",
			expected: []string{"singleString"},
		},
		{
			name:     "Slice of Strings",
			input:    []string{"string1", "string2", "string3"},
			expected: []string{"string1", "string2", "string3"},
		},
		{
			name:     "Invalid Type",
			input:    123,
			expected: []string{},
		},
		{
			name:     "Nil Input",
			input:    nil,
			expected: []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Capture log output
			var logOutput string
			hook := test.NewLocal(logrus.StandardLogger())
			defer hook.Reset()

			result := utils.ConvertToStringArray(tt.input)

			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("ConvertToStringArray() = %v, want %v", result, tt.expected)
			}

			if tt.name == "Invalid Type" {
				for _, entry := range hook.AllEntries() {
					logOutput += entry.Message
				}
				if logOutput != "Invalid input type" {
					t.Errorf("Expected log output to be 'Invalid input type', but got %s", logOutput)
				}
			}
		})
	}
}

func TestConvertArrayToCommaDelimitedString(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected string
	}{
		{
			name:     "Empty Slice",
			input:    []string{},
			expected: "",
		},
		{
			name:     "Single Element",
			input:    []string{"one"},
			expected: "one",
		},
		{
			name:     "Multiple Elements",
			input:    []string{"one", "two", "three"},
			expected: "one,two,three",
		},
		{
			name:     "Elements with Spaces",
			input:    []string{"one", "two with space", "three"},
			expected: "one,two with space,three",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ConvertArrayToCommaDelimitedString(tt.input)
			if result != tt.expected {
				t.Errorf("ConvertArrayToCommaDelimitedString() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestConvertCommaDelimitedStringToArray(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []string
	}{
		{
			name:     "Empty String",
			input:    "",
			expected: []string{""},
		},
		{
			name:     "Single Element",
			input:    "one",
			expected: []string{"one"},
		},
		{
			name:     "Multiple Elements",
			input:    "one,two,three",
			expected: []string{"one", "two", "three"},
		},
		{
			name:     "Elements with Spaces",
			input:    "one,two with space,three",
			expected: []string{"one", "two with space", "three"},
		},
		{
			name:     "Trailing Comma",
			input:    "one,two,three,",
			expected: []string{"one", "two", "three", ""},
		},
		{
			name:     "Leading Comma",
			input:    ",one,two,three",
			expected: []string{"", "one", "two", "three"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ConvertCommaDelimitedStringToArray(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("ConvertCommaDelimitedStringToArray() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestRandomErr(t *testing.T) {
	// use a for loop to check if we can cover all the possible errors
	for i := 0; i < 10; i++ {
		t.Run(fmt.Sprintf("TestRandomError %d", i), func(t *testing.T) {
			err := utils.RandomError()
			if err != nil {
				// Check if the error is one of the expected errors
				assert.True(t, err.Error() == "failed to generate random number" || err.Error() == "random error")
			} else {
				assert.Nil(t, err)
			}
		})
	}
}

func TestGetClaimsFromCTX(t *testing.T) {
	gin.SetMode(configs.GetGinRunMode())

	token, _, claims, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	tests := []struct {
		name           string
		tokenCookie    string
		tokenHeader    string
		expectedClaims *authenticator.Claims
		expectedError  string
	}{
		{
			name:          "No token provided",
			tokenCookie:   "",
			tokenHeader:   "",
			expectedError: "no token provided",
		},
		{
			name:           "InValid token from cookie",
			tokenCookie:    "validToken",
			tokenHeader:    "",
			expectedClaims: nil,
			expectedError:  "error validating token",
		},
		{
			name:           "InValid token from header",
			tokenCookie:    "",
			tokenHeader:    "validToken",
			expectedClaims: nil,
			expectedError:  "error validating token",
		},
		{
			name:           "Valid token from cookie",
			tokenCookie:    token,
			tokenHeader:    "",
			expectedClaims: claims,
			expectedError:  "",
		},
		{
			name:           "Valid token from header",
			tokenCookie:    "",
			tokenHeader:    token,
			expectedClaims: claims,
			expectedError:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a Gin context with the necessary headers and cookies
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			if tt.tokenCookie != "" {
				c.Request = httptest.NewRequest("GET", "/", nil)
				c.Request.AddCookie(&http.Cookie{Name: "token", Value: tt.tokenCookie})
			} else {
				c.Request = httptest.NewRequest("GET", "/", nil)
				c.Request.Header.Set("Authorization", tt.tokenHeader)
			}

			// Call the function under test
			returnedclaims, err := utils.GetClaimsFromCTX(c)

			// Check the expected error
			if tt.expectedError != "" {
				assert.NotNil(t, err)
				assert.EqualError(t, err, tt.expectedError)
			} else {
				assert.Nil(t, err)
			}

			// check that originToken has been set properly in context
			if tt.tokenCookie != "" {
				assert.Equal(t, "cookie", c.GetString("tokenOrigin"))
			} else if tt.tokenHeader != "" {
				assert.Equal(t, "header", c.GetString("tokenOrigin"))
			}

			// Check the expected claims
			assert.Equal(t, tt.expectedClaims, returnedclaims)
		})
	}
}

func TestIsSessionSet(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	tests := []struct {
		name              string
		expected          bool
		setSessionHandler gin.HandlerFunc
	}{
		{
			name:              "Session not set",
			expected:          false,
			setSessionHandler: func(c *gin.Context) {},
		},
		{
			name:     "Email not set in session",
			expected: false,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("role", "basic")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
		{
			name:     "Role not set in session",
			expected: false,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("email", "test@example.com")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
		{
			name:     "Email and Role set in session",
			expected: true,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("role", "basic")
				session.Set("email", "test@example.com")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a Gin router
			r := gin.Default()

			store := cookie.NewStore([]byte("secret"))
			r.Use(sessions.Sessions("occupi-sessions-store", store))

			// Define a test handler to apply middleware
			r.GET("/test", func(c *gin.Context) {
				tt.setSessionHandler(c)
				res := utils.IsSessionSet(c)

				assert.Equal(t, tt.expected, res)
			})

			// Create a test context
			w := httptest.NewRecorder()
			req := httptest.NewRequest("GET", "/test", nil)
			r.ServeHTTP(w, req) // This line is important to ensure middleware is applied

			// Check the response
			assert.Equal(t, 200, w.Code)
		})
	}
}

func TestSetSession(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Define a test handler to apply middleware
	r.GET("/test", func(c *gin.Context) {
		claims := &authenticator.Claims{
			Email: "test@example.com",
			Role:  "basic",
		}
		res := utils.SetSession(c, claims)

		assert.Nil(t, res)

		session := sessions.Default(c)

		email := session.Get("email")
		role := session.Get("role")

		assert.NotNil(t, email)
		assert.NotNil(t, role)

		assert.Equal(t, "test@example.com", email.(string))
		assert.Equal(t, "basic", role.(string))
	})

	// Create a test context
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req) // This line is important to ensure middleware is applied

	// Check the response
	assert.Equal(t, 200, w.Code)
}

func TestClearSession(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Define a test handler to apply middleware
	r.GET("/test", func(c *gin.Context) {
		session := sessions.Default(c)
		session.Set("role", "basic")
		session.Set("email", "test@example.com")
		err := session.Save()
		assert.Nil(t, err)

		res := utils.ClearSession(c)

		assert.Nil(t, res)

		session_ := sessions.Default(c)
		email := session_.Get("email")
		role := session_.Get("role")

		assert.Nil(t, email)
		assert.Nil(t, role)
	})

	// Create a test context
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req) // This line is important to ensure middleware is applied

	// Check the response
	assert.Equal(t, 200, w.Code)
}

func TestGetSession(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("occupi-sessions-store", store))

	// Define a test handler to apply middleware
	r.GET("/test", func(c *gin.Context) {
		session := sessions.Default(c)
		session.Set("role", "basic")
		session.Set("email", "test@example.com")
		err := session.Save()
		assert.Nil(t, err)

		email, role := utils.GetSession(c)

		assert.NotNil(t, email)
		assert.NotNil(t, role)

		assert.Equal(t, "test@example.com", email)
		assert.Equal(t, "basic", role)

	})

	// Create a test context
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/test", nil)
	r.ServeHTTP(w, req) // This line is important to ensure middleware is applied

	// Check the response
	assert.Equal(t, 200, w.Code)
}

func TestCompareSessionAndClaims(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	tests := []struct {
		name              string
		claims            *authenticator.Claims
		expected          bool
		setSessionHandler gin.HandlerFunc
	}{
		{
			name:              "Session not set",
			claims:            &authenticator.Claims{},
			expected:          false,
			setSessionHandler: func(c *gin.Context) {},
		},
		{
			name: "Email not set in session",
			claims: &authenticator.Claims{
				Role: "basic",
			},
			expected: false,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("role", "basic")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
		{
			name: "Role not set in session",
			claims: &authenticator.Claims{
				Email: "test@example.com",
			},
			expected: false,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("email", "test@example.com")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
		{
			name: "Email and Role set in session",
			claims: &authenticator.Claims{
				Email: "test@example.com",
				Role:  "basic",
			},
			expected: true,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("role", "basic")
				session.Set("email", "test@example.com")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
		{
			name: "Email not equal claims email",
			claims: &authenticator.Claims{
				Email: "notequal@example.com",
				Role:  "basic",
			},
			expected: false,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("role", "basic")
				session.Set("email", "test@example.com")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
		{
			name: "Role not equal claims role",
			claims: &authenticator.Claims{
				Email: "test@example.com",
				Role:  "admin",
			},
			expected: false,
			setSessionHandler: func(c *gin.Context) {
				session := sessions.Default(c)
				session.Set("role", "basic")
				session.Set("email", "test@example.com")
				err := session.Save()
				assert.Nil(t, err)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a Gin router
			r := gin.Default()

			store := cookie.NewStore([]byte("secret"))
			r.Use(sessions.Sessions("occupi-sessions-store", store))

			// Define a test handler to apply middleware
			r.GET("/test", func(c *gin.Context) {
				tt.setSessionHandler(c)
				res := utils.CompareSessionAndClaims(c, tt.claims)

				assert.Equal(t, tt.expected, res)
			})

			// Create a test context
			w := httptest.NewRecorder()
			req := httptest.NewRequest("GET", "/test", nil)
			r.ServeHTTP(w, req) // This line is important to ensure middleware is applied

			// Check the response
			assert.Equal(t, 200, w.Code)
		})
	}
}

func TestGetClientIP_SetInContext(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.Use(func(c *gin.Context) {
		c.Set("ClientIP", "203.0.113.1")
		c.Next()
	})
	router.GET("/ip", func(c *gin.Context) {
		clientIP := utils.GetClientIP(c)
		c.JSON(http.StatusOK, gin.H{
			"client_ip": clientIP,
		})
	})

	req, _ := http.NewRequest("GET", "/ip", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.JSONEq(t, `{"client_ip":"203.0.113.1"}`, w.Body.String())
}

func TestGetClientIP_NotSetInContext(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())
	router := gin.Default()
	router.GET("/ip", func(c *gin.Context) {
		clientIP := utils.GetClientIP(c)
		c.JSON(http.StatusOK, gin.H{
			"client_ip": clientIP,
		})
	})

	req, _ := http.NewRequest("GET", "/ip", nil)
	req.RemoteAddr = "203.0.113.2:12345"
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.JSONEq(t, `{"client_ip":"203.0.113.2"}`, w.Body.String())
}

func TestGetClientTime(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name       string
		setupCtx   func(*gin.Context)
		wantTimeIn string
	}{
		{
			name: "With America/New_York timezone",
			setupCtx: func(c *gin.Context) {
				loc, _ := time.LoadLocation("America/New_York")
				c.Set("timezone", loc)
			},
			wantTimeIn: "America/New_York",
		},
		{
			name: "With Asia/Kolkata timezone",
			setupCtx: func(c *gin.Context) {
				loc, _ := time.LoadLocation("Asia/Kolkata")
				c.Set("timezone", loc)
			},
			wantTimeIn: "Asia/Kolkata",
		},
		{
			name:       "Without timezone (default to local)",
			setupCtx:   func(c *gin.Context) {},
			wantTimeIn: time.Local.String(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			tt.setupCtx(c)

			got := utils.GetClientTime(c)

			if tt.wantTimeIn == time.Local.String() {
				assert.Equal(t, time.Local, got.Location())
			} else {
				wantLoc, _ := time.LoadLocation(tt.wantTimeIn)
				assert.Equal(t, wantLoc, got.Location())
			}

			// Check that the time is recent (within the last second)
			assert.WithinDuration(t, time.Now(), got, time.Second)
		})
	}
}

func TestRemoveNumbersFromExtension(t *testing.T) {
	tests := []struct {
		name     string
		ext      string
		expected string
	}{
		{
			name:     "No numbers",
			ext:      "jpg",
			expected: "jpg",
		},
		{
			name:     "Single number",
			ext:      "jpeg2000",
			expected: "jpeg",
		},
		{
			name:     "Multiple numbers",
			ext:      "png1234",
			expected: "png",
		},
		{
			name:     "No extension",
			ext:      "1234",
			expected: "",
		},
		{
			name:     "Empty string",
			ext:      "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.RemoveNumbersFromExtension(tt.ext)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestConvertTokensToStringArray(t *testing.T) {
	t.Run("Successful conversion", func(t *testing.T) {
		// Arrange
		tokens := []primitive.M{
			{"token": "abc"},
			{"token": "def"},
			{"token": "ghi"},
		}
		expected := []string{"abc", "def", "ghi"}

		// Act
		result, err := utils.ConvertTokensToStringArray(tokens, "token")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
	})

	t.Run("Missing key in one of the tokens", func(t *testing.T) {
		// Arrange
		tokens := []primitive.M{
			{"token": "abc"},
			{"missing_key": "def"},
			{"token": "ghi"},
		}

		// Act
		result, err := utils.ConvertTokensToStringArray(tokens, "token")

		// Assert
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "key token does not exist")
	})

	t.Run("Non-string value for a key", func(t *testing.T) {
		// Arrange
		tokens := []primitive.M{
			{"token": "abc"},
			{"token": 123},
			{"token": "ghi"},
		}

		// Act
		result, err := utils.ConvertTokensToStringArray(tokens, "token")

		// Assert
		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "value for key token is not a string")
	})

	t.Run("Empty token array", func(t *testing.T) {
		// Arrange
		tokens := []primitive.M{}
		expected := []string{}

		// Act
		result, err := utils.ConvertTokensToStringArray(tokens, "token")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
	})

	t.Run("Key exists but value is empty string", func(t *testing.T) {
		// Arrange
		tokens := []primitive.M{
			{"token": ""},
			{"token": "abc"},
		}
		expected := []string{"", "abc"}

		// Act
		result, err := utils.ConvertTokensToStringArray(tokens, "token")

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
	})
}

func TestGenerateUUID(t *testing.T) {
	var emptyUUIDGenerated bool
	var validUUIDGenerated bool
	// Generate 1000 UUIDs
	for i := 0; i < 1000; i++ {
		uuid := utils.GenerateUUID()
		if uuid == "" {
			emptyUUIDGenerated = true
		} else {
			validUUIDGenerated = true
		}
	}

	assert.False(t, emptyUUIDGenerated)
	assert.True(t, validUUIDGenerated)
}

func TestRemoveImageExtension(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"Remove .jpg extension", "image1.jpg", "image1"},
		{"Remove .jpeg extension", "image2.jpeg", "image2"},
		{"Remove .png extension", "image3.png", "image3"},
		{"Case-insensitive .JPG", "image4.JPG", "image4.JPG"},
		{"Case-insensitive .JPEG", "image5.JPEG", "image5.JPEG"},
		{"Case-insensitive .PNG", "image6.PNG", "image6.PNG"},
		{"No extension", "image7", "image7"},
		{"Different extension", "image8.bmp", "image8.bmp"},
		{"Dot in name but no extension", "image9.name", "image9.name"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.RemoveImageExtension(tt.input)
			if result != tt.expected {
				t.Errorf("RemoveImageExtension(%s) = %s; expected %s", tt.input, result, tt.expected)
			}
		})
	}
}
