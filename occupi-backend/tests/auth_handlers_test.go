package tests

import (
	//"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
)

func TestInvalidLogoutHandler(t *testing.T) {
	// connect to the database
	appsession := &models.AppSession{
		DB:    configs.ConnectToDatabase(constants.AdminDBAccessOption),
		Cache: configs.CreateCache(),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// creating a new valid session for management of shared variables
	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register routes
	router.OccupiRouter(ginRouter, appsession)

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
	appsession := &models.AppSession{
		DB:    configs.ConnectToDatabase(constants.AdminDBAccessOption),
		Cache: configs.CreateCache(),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// creating a new valid session for management of shared variables
	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register routes
	router.OccupiRouter(ginRouter, appsession)

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
	appsession := &models.AppSession{
		DB:    configs.ConnectToDatabase(constants.AdminDBAccessOption),
		Cache: configs.CreateCache(),
	}

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// creating a new valid session for management of shared variables
	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))

	// Register routes
	router.OccupiRouter(ginRouter, appsession)

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

/*
// Test reverifyUsersEmail handler
func TestReverifyUsersEmail(t *testing.T) {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create a new HTTP request with the POST method
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder to record the response
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Set any values in the context
	ctx.Set("test", "test")

	// Mock AppSession
	db := configs.ConnectToDatabase()
	appSession := models.New(db)

	// Test cases
	tests := []struct {
		name            string
		mockOTPGenError error
		mockDBError     error
		mockMailError   error
		expectedStatus  int
		expectedBody    gin.H
	}{
		{
			name:            "OTP generation error",
			mockOTPGenError: errors.New("OTP generation failed"),
			expectedStatus:  http.StatusInternalServerError,
			expectedBody:    utils.InternalServerError(),
		},
		{
			name:           "Database save error",
			mockDBError:    errors.New("Database save failed"),
			expectedStatus: http.StatusInternalServerError,
			expectedBody:   utils.InternalServerError(),
		},
		{
			name:           "Mail send error",
			mockMailError:  errors.New("Mail send failed"),
			expectedStatus: http.StatusInternalServerError,
			expectedBody:   utils.InternalServerError(),
		},
		{
			name:           "Success",
			expectedStatus: http.StatusOK,
			expectedBody: gin.H{
				"code":    http.StatusOK,
				"message": "Please check your email for the OTP to re-verify your account.",
				"data":    nil,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Mock OTP generation
			utils.GenerateOTP = func() (string, error) {
				if tt.mockOTPGenError != nil {
					return "", tt.mockOTPGenError
				}
				return "123456", nil
			}

			// Mock database AddOTP method
			database.AddOTP = func(ctx *gin.Context, db *mongo.Client, email string, otp string) (interface{}, error) {
				if tt.mockDBError != nil {
					return nil, tt.mockDBError
				}
				return nil, nil
			}

			// Mock mail SendMail method
			mail.SendMail = func(email string, subject string, body string) error {
				if tt.mockMailError != nil {
					return tt.mockMailError
				}
				return nil
			}

			// Call the handler
			handlers.ReverifyUsersEmail(ctx, appSession, "test@example.com")

			// Assert the response
			assert.Equal(t, tt.expectedStatus, w.Code)
			assert.JSONEq(t, tt.expectedBody, w.Body.String())
		})
	}
}
*/
