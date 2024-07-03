package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	// "github.com/stretchr/testify/mock"
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

// Helper function to send a request and verify the response
func sendRequestAndVerifyResponse(t *testing.T, r *gin.Engine, method, url string, payload string, cookies []*http.Cookie, expectedStatusCode int, expectedMessage string) {
	// Create a request to pass to the handler
	req, err := http.NewRequest(method, url, bytes.NewBuffer([]byte(payload)))
	if err != nil {
		t.Fatal(err)
	}
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

func TestRateLimit(t *testing.T) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

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
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

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
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

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
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

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
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

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

func TestMockDatabase(t *testing.T) {
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
