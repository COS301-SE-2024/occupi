package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
)

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

func TestGetAllData(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	// Define the mock responses
	onSiteTrueDocs := []bson.D{
		{{Key: "onSite", Value: true}, {Key: "name", Value: "User1"}},
		{{Key: "onSite", Value: true}, {Key: "name", Value: "User2"}},
	}

	mt.Run("Find onSite true users", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, onSiteTrueDocs...))

		// Call the function under test
		users := database.GetAllData(models.New(mt.Client, nil))

		// Validate the result
		expected := []bson.M{
			{"onSite": true, "name": "User1"},
			{"onSite": true, "name": "User2"},
		}

		assert.Equal(t, expected, users)
	})
}

func TestEmailExists(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Email exists", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
		}))

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.True(t, exists)
	})

	mt.Run("Email does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch))

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Call the function under test
		exists := database.EmailExists(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.False(t, exists)
	})
}

func TestAddUser(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	user := models.RequestUser{
		EmployeeID: "12345",
		Password:   "password123",
		Email:      "test@example.com",
	}

	mt.Run("Add user successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.AddUser(ctx, models.New(mt.Client, nil), user)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)
	})

	mt.Run("InsertOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		// Call the function under test
		success, err := database.AddUser(ctx, models.New(mt.Client, nil), user)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestOTPExists(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	otp := "123456"
	expiredOTP := time.Now().Add(-1 * time.Hour)
	validOTP := time.Now().Add(1 * time.Hour)

	mt.Run("OTP exists and is valid", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "otp", Value: otp},
			{Key: "expireWhen", Value: validOTP},
		}))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	mt.Run("OTP exists but is expired", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.OTPS", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "otp", Value: otp},
			{Key: "expireWhen", Value: expiredOTP},
		}))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	mt.Run("OTP does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.OTPS", mtest.FirstBatch))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, exists)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		exists, err := database.OTPExists(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, exists)
	})
}

func TestAddOTP(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	otp := "123456"

	mt.Run("Add OTP successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.AddOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the inserted document
	})

	mt.Run("InsertOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "duplicate key error",
		}))

		// Call the function under test
		success, err := database.AddOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestDeleteOTP(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	otp := "123456"

	mt.Run("Delete OTP successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.DeleteOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the deletion
	})

	mt.Run("DeleteOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "delete error",
		}))

		// Call the function under test
		success, err := database.DeleteOTP(ctx, models.New(mt.Client, nil), email, otp)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestVerifyUser(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Verify user successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("UpdateOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Call the function under test
		success, err := database.VerifyUser(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestGetPassword(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"
	password := "hashedpassword123"

	mt.Run("Get password successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "password", Value: password},
		}))

		// Call the function under test
		pass, err := database.GetPassword(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.Equal(t, password, pass)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		pass, err := database.GetPassword(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.Equal(t, "", pass)
	})
}

func TestCheckIfUserIsVerified(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("User is verified", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: true},
		}))

		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isVerified)
	})

	mt.Run("User is not verified", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "isVerified", Value: false},
		}))

		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isVerified)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		isVerified, err := database.CheckIfUserIsVerified(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isVerified)
	})
}

func TestUpdateVerificationStatusTo(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Update verification status successfully", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateSuccessResponse())

		// Call the function under test
		success, err := database.UpdateVerificationStatusTo(ctx, models.New(mt.Client, nil), email, true)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, success)

		// Verify the update
	})

	mt.Run("UpdateOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "update error",
		}))

		// Call the function under test
		success, err := database.UpdateVerificationStatusTo(ctx, models.New(mt.Client, nil), email, true)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, success)
	})
}

func TestCheckIfUserIsAdmin(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("User is admin", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "role", Value: constants.Admin},
		}))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, isAdmin)
	})

	mt.Run("User is not admin", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "role", Value: constants.Basic},
		}))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, isAdmin)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, isAdmin)
	})
}

/*

type MockUpdateVerificationStatus struct {
	mock.Mock
}

func (m *MockUpdateVerificationStatus) UpdateVerificationStatusTo(ctx *gin.Context, db *mongo.Client, email string, status bool) (bool, error) {
	args := m.Called(ctx, db, email, status)
	return args.Bool(0), args.Error(1)
}

func TestCheckIfNextVerificationDateIsDue(t *testing.T) {
	// Setup mock MongoDB instance
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))

	gin.SetMode(configs.GetGinRunMode())

	// Create a new HTTP request with the POST method.
	req, _ := http.NewRequest("POST", "/", nil)

	// Create a new ResponseRecorder (which satisfies http.ResponseWriter) to record the response.
	w := httptest.NewRecorder()

	// Create a new context with the Request and ResponseWriter.
	ctx, _ := gin.CreateTestContext(w)
	ctx.Request = req

	// Optionally, set any values in the context.
	ctx.Set("test", "test")

	email := "test@example.com"

	mt.Run("Next verification date is due", func(mt *mtest.T) {
		nextVerificationDate := time.Now().Add(-24 * time.Hour)
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "nextVerificationDate", Value: nextVerificationDate},
		}))

		mockUpdate := new(MockUpdateVerificationStatus)
		mockUpdate.On("UpdateVerificationStatusTo", ctx, models.New(mt.Client, nil), email, false).Return(true, nil)

		// Replace the original function with the mock
		originalFunc := database.UpdateVerificationStatusTo
		database.UpdateVerificationStatusTo = mockUpdate.UpdateVerificationStatusTo
		defer func() { database.UpdateVerificationStatusTo = originalFunc }()

		// Call the function under test
		due, err := database.CheckIfNextVerificationDateIsDue(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.True(t, due)

		// Verify the mock
		mockUpdate.AssertCalled(t, "UpdateVerificationStatusTo", ctx, models.New(mt.Client, nil), email, false)
	})

	mt.Run("Next verification date is not due", func(mt *mtest.T) {
		nextVerificationDate := time.Now().Add(24 * time.Hour)
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "nextVerificationDate", Value: nextVerificationDate},
		}))

		// Call the function under test
		due, err := database.CheckIfNextVerificationDateIsDue(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.NoError(t, err)
		assert.False(t, due)
	})

	mt.Run("FindOne error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    11000,
			Message: "find error",
		}))

		// Call the function under test
		due, err := database.CheckIfNextVerificationDateIsDue(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, due)
	})

	mt.Run("UpdateVerificationStatusTo error", func(mt *mtest.T) {
		nextVerificationDate := time.Now().Add(-24 * time.Hour)
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch, bson.D{
			{Key: "email", Value: email},
			{Key: "nextVerificationDate", Value: nextVerificationDate},
		}))

		mockUpdate := new(MockUpdateVerificationStatus)
		mockUpdate.On("UpdateVerificationStatusTo", ctx, models.New(mt.Client, nil), email, false).Return(false, assert.AnError)

		// Replace the original function with the mock
		originalFunc := database.UpdateVerificationStatusTo
		database.UpdateVerificationStatusTo = mockUpdate.UpdateVerificationStatusTo
		defer func() { database.UpdateVerificationStatusTo = originalFunc }()

		// Call the function under test
		due, err := database.CheckIfNextVerificationDateIsDue(ctx, models.New(mt.Client, nil), email)

		// Validate the result
		assert.Error(t, err)
		assert.False(t, due)

		// Verify the mock
		mockUpdate.AssertCalled(t, "UpdateVerificationStatusTo", ctx, models.New(mt.Client, nil), email, false)
	})
}
*/
