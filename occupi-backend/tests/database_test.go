package tests

import (
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/integration/mtest"
)

func TestConfirmCheckIn(t *testing.T) {
	mt := mtest.New(t, mtest.NewOptions().ClientType(mtest.Mock))
	defer mtest.Teardown()
	mt.Run("successful check-in", func(mt *mtest.T) {
		checkIn := models.CheckIn{
			BookingID: 12345,
			RoomID:    "67890",
			Email:     "test@example.com",
		}

		mt.AddMockResponses(
			mtest.CreateCursorResponse(1, "Occupi.bookings", mtest.FirstBatch, bson.D{
				{Key: "bookingId", Value: checkIn.BookingID},
				{Key: "roomId", Value: checkIn.RoomID},
				{Key: "emails", Value: bson.A{checkIn.Email}},
			}),
			mtest.CreateSuccessResponse(),
		)

		ctx, _ := gin.CreateTestContext(nil)
		success, err := database.ConfirmCheckIn(ctx, mt.Client, checkIn)
		assert.True(t, success)
		assert.NoError(t, err)
	})

	mt.Run("email not associated with the room", func(mt *mtest.T) {
		checkIn := models.CheckIn{
			BookingID: 12345,
			RoomID:    "67890",
			Email:     "notfound@example.com",
		}

		mt.AddMockResponses(
			mtest.CreateCursorResponse(0, "Occupi.bookings", mtest.FirstBatch),
		)

		ctx, _ := gin.CreateTestContext(nil)
		success, err := database.ConfirmCheckIn(ctx, mt.Client, checkIn)
		assert.False(t, success)
		assert.EqualError(t, err, "Email not associated with the room")
	})

	mt.Run("database error", func(mt *mtest.T) {
		checkIn := models.CheckIn{
			BookingID: 12345,
			RoomID:    "67890",
			Email:     "test@example.com",
		}

		mt.AddMockResponses(
			mtest.CreateCommandErrorResponse(mtest.CommandError{
				Code:    11000,
				Message: "duplicate key error",
			}),
		)

		ctx, _ := gin.CreateTestContext(nil)
		success, err := database.ConfirmCheckIn(ctx, mt.Client, checkIn)
		assert.False(t, success)
		assert.Error(t, err)
	})
}
