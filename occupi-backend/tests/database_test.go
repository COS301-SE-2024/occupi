package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
)

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
		users := database.GetAllData(mt.Client)

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

	gin.SetMode(gin.TestMode)

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
		exists := database.EmailExists(ctx, mt.Client, email)

		// Validate the result
		assert.True(t, exists)
	})

	mt.Run("Email does not exist", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCursorResponse(1, "Occupi.Users", mtest.FirstBatch))

		// Call the function under test
		exists := database.EmailExists(ctx, mt.Client, email)

		// Validate the result
		assert.False(t, exists)
	})

	mt.Run("Handle find error", func(mt *mtest.T) {
		mt.AddMockResponses(mtest.CreateCommandErrorResponse(mtest.CommandError{
			Code:    1,
			Message: "find error",
		}))

		// Call the function under test
		exists := database.EmailExists(ctx, mt.Client, email)

		// Validate the result
		assert.False(t, exists)
	})
}
