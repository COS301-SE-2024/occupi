package tests

import (
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
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

func FormatCancellationEmailBodyForBooker(bookingID string, roomID string, slot int, email string) string {
	return utils.AppendHeader("Cancellation") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully cancelled your booked office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> ` + bookingID + `<br>
				<b>Room ID:</b> ` + roomID + `<br>
				<b>Slot:</b> ` + strconv.Itoa(slot) + `<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + utils.AppendFooter()
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
			actual := FormatCancellationEmailBodyForBooker(tt.bookingID, tt.roomID, tt.slot, tt.email)
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
