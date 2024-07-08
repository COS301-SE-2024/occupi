package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	// "github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	// "github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
)

// Tests the ViewBookings handler
func TestViewBookingsHandler(t *testing.T) {
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

	// Store the cookies from the login response
	cookies := req.Cookies()

	// Define test cases
	testCases := []struct {
		name               string
		email              string
		expectedStatusCode float64
		expectedMessage    string
		expectedBookings   int
	}{
		{
			name:               "Valid Request",
			email:              "test.example@gmail.com",
			expectedStatusCode: float64(http.StatusOK),
			expectedMessage:    "Successfully fetched bookings!",
			expectedBookings:   2,
		},
		{
			name:               "Invalid Request",
			email:              "",
			expectedStatusCode: float64(http.StatusBadRequest),
			expectedMessage:    "Invalid request payload",
			expectedBookings:   0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create a request to pass to the handler
			req, err := http.NewRequest("GET", "/api/view-bookings?email="+tc.email, nil)
			if err != nil {
				t.Fatal(err)
			}

			// Add the stored cookies to the request
			for _, cookie := range cookies {
				req.AddCookie(cookie)
			}

			// Create a response recorder to record the response
			rr := httptest.NewRecorder()

			// Serve the request
			r.ServeHTTP(rr, req)

			// Check the status code is what we expect
			assert.Equal(t, tc.expectedStatusCode, float64(rr.Code), "handler returned wrong status code")

			// Define the expected response
			expectedResponse := gin.H{
				"message": tc.expectedMessage,
				"data":    make([]map[string]interface{}, tc.expectedBookings), // Adjust expected data length
				"status":  tc.expectedStatusCode,
			}

			// Unmarshal the actual response
			var actualResponse gin.H
			if err := json.Unmarshal(rr.Body.Bytes(), &actualResponse); err != nil {
				t.Fatalf("could not unmarshal response: %v", err)
			}

			// Compare the responses
			assert.Equal(t, expectedResponse["message"], actualResponse["message"], "handler returned unexpected message")
			assert.Equal(t, expectedResponse["status"], actualResponse["status"], "handler returned unexpected status")
		})
	}
}

type testCase struct {
	name               string
	payload            string
	expectedStatusCode int
	expectedMessage    string
	setupFunc          func() string // Return booking ID for valid setup
}

// Helper function to create a mock booking for testing
func createMockBooking(r *gin.Engine, payload string, cookies []*http.Cookie) (map[string]interface{}, error) {
	req, err := http.NewRequest("POST", "/api/book-room", bytes.NewBuffer([]byte(payload)))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	// Add the stored cookies to the request
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		return nil, fmt.Errorf("expected status 200 but got %d", rr.Code)
	}

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		return nil, fmt.Errorf("could not unmarshal response: %v", err)
	}

	return response, nil
}
func BoolPtr(b bool) *bool {
	return &b
}

// SetupTestEnvironment initializes the test environment and returns the router and cookies
func setupTestEnvironment(t *testing.T) (*gin.Engine, []*http.Cookie) {
	// Connect to the test database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Set Gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

	// Generate a token
	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	// Ping-auth test to ensure everything is set up correctly
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

	// Store the cookies from the login response
	cookies := req.Cookies()

	return r, cookies
}

// Clean up the test database
func CleanupTestDatabase(db *mongo.Database) {
	collection := db.Collection("users")
	collection.DeleteMany(context.Background(), bson.M{})
}

// Helper function to send a request and verify the response
func sendRequestAndVerifyResponse(t *testing.T, r *gin.Engine, method, url string, payload string, cookies []*http.Cookie, expectedStatusCode int, expectedMessage string) {
	// Create a request to pass to the handler
	var req *http.Request
	var err error

	if method == http.MethodGet {
		req, err = http.NewRequest(method, url, nil)
	} else {
		req, err = http.NewRequest(method, url, bytes.NewBuffer([]byte(payload)))
	}

	if err != nil {
		t.Fatal(err)
	}

	// Set the request header
	req.Header.Set("Content-Type", "application/json")

	// Add the stored cookies to the request
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	// Create a response recorder to record the response
	rr := httptest.NewRecorder()

	// Serve the request
	r.ServeHTTP(rr, req)

	// Check the status code is what we expect
	assert.Equal(t, expectedStatusCode, rr.Code, "handler returned wrong status code")

	// Check the response message
	var actualResponse map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &actualResponse)
	if err != nil {
		t.Fatalf("could not unmarshal response: %v", err)
	}

	assert.Equal(t, expectedMessage, actualResponse["message"], "handler returned unexpected message")
}
func getSharedTestCases(r *gin.Engine, cookies []*http.Cookie) []testCase {
	return []testCase{
		{
			name: "Valid Request",
			payload: `{
				"bookingId": "mock_id",
				"creator": "test@example.com"
			}`,
			expectedStatusCode: http.StatusOK,
			expectedMessage:    "Successfully checked in!",
			setupFunc: func() string {
				// Insert a booking to be cancelled using the helper function
				bookingPayload := `{
					"roomId": "12345",
					"emails": ["test@example.com"],
					"creator": "test@example.com",
					"floorNo": "1",
					"roomName": "Test Room",
					"date": "2024-07-01T00:00:00Z",
					"start": "2024-07-01T09:00:00Z",
					"end": "2024-07-01T10:00:00Z"
				}`
				response, err := createMockBooking(r, bookingPayload, cookies)
				if err != nil {
					panic(fmt.Sprintf("could not create mock booking: %v", err))
				}
				return response["data"].(string) // Assuming "data" contains the booking ID
			},
		},
		{
			name: "Invalid Request Payload",
			payload: `{
				"bookingID": "",
				"creator": "test@example.com"
			}`,
			expectedStatusCode: http.StatusBadRequest,
			expectedMessage:    "Invalid request payload",
			setupFunc:          func() string { return "" },
		},
		{
			name: "Booking Not Found",
			payload: `{
				"bookingId": "nonexistent",
				"creator": "test@example.com"
			}`,
			expectedStatusCode: http.StatusNotFound,
			expectedMessage:    "Booking not found",
			setupFunc:          func() string { return "" },
		},
	}
}

// Tests the ViewUserDetails handler

// Tests the CancelBooking handler
func TestCancelBooking(t *testing.T) {
	// Setup the test environment
	r, cookies := setupTestEnvironment(t)

	// Define test cases
	testCases := []struct {
		name               string
		payload            string
		expectedStatusCode int
		expectedMessage    string
		setupFunc          func() string // Return booking ID for valid setup
	}{
		{
			name: "Valid Request",
			payload: `{
                	"bookingId": "mock_id",
					"creator": "test@example.com",
					"roomId": "12345",
                    "emails": ["test@example.com"],
                    "creator": "test@example.com",
                    "floorNo": "1",
                    "roomName": "Test Room",
                    "date": "2024-07-01T09:00:00Z",
                    "start": "2024-07-01T09:00:00Z",
                    "end": "2024-07-01T10:00:00Z"
            }`,
			expectedStatusCode: http.StatusOK,
			expectedMessage:    "Successfully cancelled booking!",
			setupFunc: func() string {
				// Insert a booking to be cancelled using the helper function
				bookingPayload := `{
                    "roomId": "12345",
					"emails": ["test@example.com"],
					"creator": "test@example.com",
					"floorNo": "1",
					"roomName": "Test Room",
					"date": "2024-07-01T00:00:00Z",
					"start": "2024-07-01T09:00:00Z",
					"end": "2024-07-01T10:00:00Z"
                }`
				response, err := createMockBooking(r, bookingPayload, cookies)
				if err != nil {
					t.Fatalf("could not create mock booking: %v", err)
				}
				return response["data"].(string) // Assuming "data" contains the booking ID
			},
		},
		{
			name: "Invalid Request Payload",
			payload: `{
                "id": "",
                "creator": ""
            }`,
			expectedStatusCode: http.StatusBadRequest,
			expectedMessage:    "Invalid request payload",
			setupFunc:          func() string { return "" },
		},
		{
			name: "Booking Not Found",
			payload: `{
                "bookingId": "nonexistent",
				"creator": "test@example.com",
				"roomId": "12345",
				"emails": ["test@example.com"],
				"creator": "test@example.com",
				"floorNo": "1",
				"roomName": "Test Room",
				"date": "2024-07-01T09:00:00Z",
				"start": "2024-07-01T09:00:00Z",
				"end": "2024-07-01T10:00:00Z"
            }`,
			expectedStatusCode: http.StatusNotFound,
			expectedMessage:    "Booking not found",
			setupFunc:          func() string { return "" },
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Setup the test case and get the booking ID if applicable
			id := tc.setupFunc()

			// Replace the mock_id placeholder in the payload with the actual booking ID
			if id != "" {
				tc.payload = strings.Replace(tc.payload, "mock_id", id, 1)
			}

			sendRequestAndVerifyResponse(t, r, "POST", "/api/cancel-booking", tc.payload, cookies, tc.expectedStatusCode, tc.expectedMessage)
		})
	}
}

// Tests the GetUserDetails handler
// func TestGetUserDetails(t *testing.T) {
// 	// connect to the database
// 	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
// 	collection := db.Database("Occupi").Collection("users")
// 	parsedTime, _ := time.Parse(time.RFC3339, "2024-09-15T00:00:00Z")
// 	documents := []interface{}{
// 		models.UserDetails{
// 			OccupiID:             "OCCUPI20245311",
// 			Password:             "hashedpassword",
// 			Email:                "john.doe@example.com",
// 			Role:                 "admin",
// 			OnSite:               true,
// 			IsVerified:           true,
// 			NextVerificationDate: parsedTime,
// 			Details: &models.Details{
// 				ContactNo: "123-456-7890",
// 				DOB:       parsedTime,
// 				Gender:    "male",
// 				Name:      "John Doe",
// 				Pronouns:  "He/him",
// 			},
// 			Notifications: &models.Notifications{
// 				Allow:           BoolPtr(true),
// 				BookingReminder: BoolPtr(true),
// 				Max_Capacity:    BoolPtr(true),
// 			},
// 			Security: &models.Security{
// 				MFA:        BoolPtr(true),
// 				Biometrics: BoolPtr(true),
// 			},
// 			Position: "Manager",
// 			Status:   "Active",
// 		},
// 	}
// 	setup.InsertData(collection, documents)
// 	// Setup the test environment
// 	r, cookies := setupTestEnvironment(t)

// 	// Define test cases
// 	testCases := []testCase{
// 		{
// 			name:               "Valid Request",
// 			payload:            "/api/user-details?email=john.doe@example.com",
// 			expectedStatusCode: http.StatusOK,
// 			expectedMessage:    "Successfully fetched user details",
// 			setupFunc:          func() string { return "" },
// 		},
// 		{
// 			name:               "Invalid Request",
// 			payload:            "/api/user-details",
// 			expectedStatusCode: http.StatusBadRequest,
// 			expectedMessage:    "Invalid request payload",
// 			setupFunc:          func() string { return "" },
// 		},
// 		{
// 			name:               "User Not Found",
// 			payload:            "/api/user-details?email=jane.doe@example.com",
// 			expectedStatusCode: http.StatusNotFound,
// 			expectedMessage:    "User not found",
// 			setupFunc:          func() string { return "" },
// 		},
// 	}

// 	for _, tc := range testCases {
// 		t.Run(tc.name, func(t *testing.T) {
// 			sendRequestAndVerifyResponse(t, r, "GET", tc.payload, "", cookies, tc.expectedStatusCode, tc.expectedMessage)
// 		})
// 	}
// }

// Tests the BookRoom handler
func TestBookRoom(t *testing.T) {
	// Setup the test environment
	r, cookies := setupTestEnvironment(t)

	// Define test cases
	testCases := []struct {
		name               string
		payload            string
		expectedStatusCode int
		expectedMessage    string
	}{
		{
			name: "Valid Request",
			payload: `{
				"roomId": "12345",
				"emails": ["test@example.com"],
				"creator": "test@example.com",
				"floorNo": "1",
				"roomName": "Test Room",
				"date": "2024-07-01T00:00:00Z",
				"start": "2024-07-01T09:00:00Z",
				"end": "2024-07-01T10:00:00Z"
			}`,
			expectedStatusCode: http.StatusOK,
			expectedMessage:    "Successfully booked!",
		},
		{
			name: "Invalid Request Payload",
			payload: `{
				"roomId": "",
				"emails": [],
				"creator": "",
				"floorNo": "0",
				"roomName": "",
				"date": "",
				"start": "",
				"end": ""
			}`,
			expectedStatusCode: http.StatusBadRequest,
			expectedMessage:    "Invalid request payload",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create a request to pass to the handler
			req, err := http.NewRequest("POST", "/api/book-room", bytes.NewBuffer([]byte(tc.payload)))
			if err != nil {
				t.Fatal(err)
			}

			// Add the stored cookies to the request
			for _, cookie := range cookies {
				req.AddCookie(cookie)
			}

			// Create a response recorder to record the response
			rr := httptest.NewRecorder()

			// Serve the request
			r.ServeHTTP(rr, req)

			// Check the status code is what we expect
			assert.Equal(t, tc.expectedStatusCode, rr.Code, "handler returned wrong status code")

			// Check the response message
			var actualResponse map[string]interface{}
			err = json.Unmarshal(rr.Body.Bytes(), &actualResponse)
			if err != nil {
				t.Fatalf("could not unmarshal response: %v", err)
			}

			assert.Equal(t, tc.expectedMessage, actualResponse["message"], "handler returned unexpected message")

			// For successful booking, check if the ID is generated
			if tc.expectedStatusCode == http.StatusOK {
				assert.NotEmpty(t, actualResponse["data"], "booking ID should not be empty")
			}
		})
	}
}

// Tests CheckIn handler
func TestCheckIn(t *testing.T) {
	// Setup the test environment
	r, cookies := setupTestEnvironment(t)

	// Define test cases
	testCases := getSharedTestCases(r, cookies)

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Setup the test case and get the booking ID if applicable
			bookingID := tc.setupFunc()

			// Replace the mock_id placeholder in the payload with the actual booking ID
			if bookingID != "" {
				tc.payload = strings.Replace(tc.payload, "mock_id", bookingID, 1)
			}

			sendRequestAndVerifyResponse(t, r, "POST", "/api/check-in", tc.payload, cookies, tc.expectedStatusCode, tc.expectedMessage)
		})
	}
}
func TestPingRoute(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

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

// handler test fot forgot password
// func TestForgotPassword(t *testing.T) {
//     // Setup the test environment
//     r, cookies := setupTestEnvironment(t)

//     // Define test cases
//     testCases := []struct {
//         name               string
//         payload            string
//         expectedStatusCode int
//         expectedMessage    string
//     }{
//         {
//             name: "Valid Request",
//             payload: `{
//                 "email": "cmokou@icloud.com"
//             }`,
//             expectedStatusCode: http.StatusOK,
//             expectedMessage:    "Password reset OTP sent to your email",
//         },
//         {
//             name: "Invalid Email Format",
//             payload: `{
//                 "email": "invalid-email"
//             }`,
//             expectedStatusCode: http.StatusBadRequest,
//             expectedMessage:    "Invalid email address",
//         },
//         {
//             name: "Non-existent Email",
//             payload: `{
//                 "email": "nonexistent@example.com"
//             }`,
//             expectedStatusCode: http.StatusBadRequest,
//             expectedMessage:    "Email not registered",
//         },
//     }

//     for _, tc := range testCases {
//         t.Run(tc.name, func(t *testing.T) {
//             sendRequestAndVerifyResponse(t, r, "POST", "/auth/forgot-password", tc.payload, cookies, tc.expectedStatusCode, tc.expectedMessage)
//         })
//     }
// }

// handler test fot reset password
// func TestResetPassword(t *testing.T) {
//     // Setup the test environment
//     r, cookies := setupTestEnvironment(t)

//     // Define test cases
//     testCases := []struct {
//         name               string
//         payload            string
//         expectedStatusCode int
//         expectedMessage    string
//     }{
//         {
//             name: "Valid Request",
//             payload: `{
//                 "email": "cmokou@icloud.com",
//                 "otp": "123456",
//                 "newPassword": "newPassword123"
//             }`,
//             expectedStatusCode: http.StatusOK,
//             expectedMessage:    "Password reset successful",
//         },
//         {
//             name: "Invalid Email Format",
//             payload: `{
//                 "email": "invalid-email",
//                 "otp": "123456",
//                 "newPassword": "newPassword123"
//             }`,
//             expectedStatusCode: http.StatusBadRequest,
//             expectedMessage:    "Invalid email address",
//         },
//         {
//             name: "Non-existent Email",
//             payload: `{
//                 "email": "nonexistent@example.com",
//                 "otp": "123456",
//                 "newPassword": "newPassword123"
//             }`,
//             expectedStatusCode: http.StatusBadRequest,
//             expectedMessage:    "Email not registered",
//         },
//         {
//             name: "Invalid OTP",
//             payload: `{
//                 "email": "test@example.com",
//                 "otp": "invalid",
//                 "newPassword": "newPassword123"
//             }`,
//             expectedStatusCode: http.StatusBadRequest,
//             expectedMessage:    "Invalid OTP",
//         },
//         {
//             name: "Weak Password",
//             payload: `{
//                 "email": "test@example.com",
//                 "otp": "123456",
//                 "newPassword": "weak"
//             }`,
//             expectedStatusCode: http.StatusBadRequest,
//             expectedMessage:    "Password does not meet security requirements",
//         },
//     }

//     for _, tc := range testCases {
//         t.Run(tc.name, func(t *testing.T) {
//             sendRequestAndVerifyResponse(t, r, "POST", "/auth/reset-password", tc.payload, cookies, tc.expectedStatusCode, tc.expectedMessage)
//         })
//     }
// }