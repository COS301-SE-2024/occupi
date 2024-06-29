package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	// "github.com/stretchr/testify/mock"
)

func TestViewBookingsHandler(t *testing.T) {
	// connect to the database
	db := database.ConnectToDatabase(constants.AdminDBAccessOption)

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

/*
func TestBookRoom(t *testing.T) {
	// connect to the database
	db := database.ConnectToDatabase(constants.AdminDBAccessOption)

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
		payload            string
		expectedStatusCode int
		expectedMessage    string
		expectedData       gin.H
	}{
		{
			name: "Valid Request",
			payload: `{
				"roomId": "12345",
				"Slot": 1,
				"Emails": ["test@example.com"],
				"Creator": "test@example.com",
				"FloorNo": 1
			}`,
			expectedStatusCode: http.StatusOK,
			expectedMessage:    "Successfully booked!",
			expectedData:       gin.H{"id": "some_generated_id"}, // The exact value will be replaced dynamically
		},
		{
			name: "Invalid Request Payload",
			payload: `{
				"RoomID": "",
				"Slot": "",
				"Emails": [],
				"Creator": "",
				"FloorNo": 0
			}`,
			expectedStatusCode: http.StatusBadRequest,
			expectedMessage:    "Invalid request payload",
			expectedData:       nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create a request to pass to the handler
			req, err := http.NewRequest("POST", "/api/book-room", strings.NewReader(tc.payload))
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

			// Define the expected response
			expectedResponse := gin.H{
				"message": tc.expectedMessage,
				"status":  float64(tc.expectedStatusCode),
				"data":    tc.expectedData,
			}

			// Unmarshal the actual response
			var actualResponse gin.H
			if err := json.Unmarshal(rr.Body.Bytes(), &actualResponse); err != nil {
				t.Fatalf("could not unmarshal response: %v", err)
			}

			// Check the response message and status
			assert.Equal(t, expectedResponse["message"], actualResponse["message"], "handler returned unexpected message")
			assert.Equal(t, expectedResponse["status"], actualResponse["status"], "handler returned unexpected status")

			// For successful booking, check if the ID is generated
			if tc.expectedStatusCode == http.StatusOK {
				assert.NotEmpty(t, actualResponse["data"], "booking ID should not be empty")
			}
		})
	}
}
*/

func TestPingRoute(t *testing.T) {
	// connect to the database
	db := database.ConnectToDatabase(constants.AdminDBAccessOption)

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

func TestMockDatabase(t *testing.T) {
	// connect to the database
	db := database.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	r := gin.Default()

	// Register the route
	router.OccupiRouter(r, db)

	token, _, _ := authenticator.GenerateToken("test@example.com", constants.Basic)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/resource-auth", nil)
	req.AddCookie(&http.Cookie{Name: "token", Value: token})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	/*
		Expected response body:
		{
			"data": [], -> array of data
			"message": "Successfully fetched resource!", -> message
			"status": 200 -> status code
	*/
	// check that the data length is greater than 0 after converting the response body to a map
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("could not unmarshal response: %v", err)
	}

	// check that the data length is greater than 0
	data := response["data"].([]interface{})
	assert.Greater(t, len(data), 0)
}
