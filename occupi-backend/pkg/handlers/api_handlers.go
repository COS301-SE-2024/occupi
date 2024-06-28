package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"reflect"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// PingHandler is a simple handler for testing if the server is up and running
func PingHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "pong -> I am alive and kicking", nil))
}

func PingHandlerOpen(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "pong -> I am alive and kicking and you are not auth'd, only non-auth'd users can access this endpoint", nil))
}

// PingHandlerAuth is a simple handler for testing if the server is up and running but requires authentication
func PingHandlerAuth(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "pong -> I am alive and kicking and you are auth'd", nil))
}

// PingHandlerAdmin is a simple handler for testing if the server is up and running but requires admin authentication
func PingHandlerAdmin(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "pong -> I am alive and kicking and you are an admin", nil))
}

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResource(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(appsession.DB)

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Data fetched successfully", data))
}

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResourceAuth(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(appsession.DB)

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Data fetched successfully", data))
}

// BookRoom handles booking a room and sends a confirmation email
func BookRoom(ctx *gin.Context, appsession *models.AppSession) {
	// consider structuring api responses to match that as outlined in our coding standards documentation
	//link: https://cos301-se-2024.github.io/occupi/coding-standards/go-coding-standards#response-and-error-handling
	var booking models.Booking

	if err := ctx.ShouldBindJSON(&booking); err != nil {
		HandleValidationErrors(ctx, err)
		return
	}
	if booking.RoomID == "" || booking.RoomName == "" || booking.Creator == "" || len(booking.Emails) == 0 {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid inputs", nil))
		return
	}

	// Generate a unique ID for the booking
	booking.ID = primitive.NewObjectID().Hex()
	booking.OccupiID = utils.GenerateBookingID()
	booking.CheckedIn = false

	// // Save the booking to the database
	// _, err := database.SaveBooking(ctx, appsession.DB, booking)
	// if err != nil {
	// 	ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to save booking", constants.InternalServerErrorCode, "Failed to save booking", nil))
	// 	return
	// }

	// if err := mail.SendBookingEmails(booking); err != nil {
	// 	ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send booking email", constants.InternalServerErrorCode, "Failed to send booking email", nil))
	// 	return
	// }

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully booked!", booking.ID))
}

// ViewBookings handles the retrieval of all bookings for a user
func ViewBookings(ctx *gin.Context, appsession *models.AppSession) {
	// Extract the email query parameter
	email := ctx.Query("email")
	if email == "" || !utils.ValidateEmail(email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Email Address", nil))
		return
	}

	// Get all bookings for the userBooking
	bookings, err := database.GetUserBookings(ctx, appsession.DB, email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get bookings", constants.InternalServerErrorCode, "Failed to get bookings", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched bookings!", bookings))
}

// Cancel booking handles the cancellation of a booking
func CancelBooking(ctx *gin.Context, appsession *models.AppSession) {
	var cancel models.Cancel
	if err := ctx.ShouldBindJSON(&cancel); err != nil || cancel.ID == "" || cancel.Creator == "" {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Booking ID, Room ID, and Email Address", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession.DB, cancel.ID)
	if !exists {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(404, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the cancellation to the database
	_, err := database.ConfirmCancellation(ctx, appsession.DB, cancel.ID, cancel.Creator)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to cancel booking", constants.InternalServerErrorCode, "Failed to cancel booking", nil))
		return
	}

	if err := mail.SendCancellationEmails(cancel); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "An error occurred", constants.InternalServerErrorCode, "Failed to send booking email", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully cancelled booking!", nil))
}

// CheckIn handles the check-in process for a booking
func CheckIn(ctx *gin.Context, appsession *models.AppSession) {
	var checkIn models.CheckIn

	if err := ctx.ShouldBindJSON(&checkIn); err != nil {
		HandleValidationErrors(ctx, err)
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession.DB, checkIn.BookingID)
	if !exists {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to find booking", constants.InternalServerErrorCode, "Failed to find booking", nil))
		return
	}
	// Confirm the check-in to the database
	_, err := database.ConfirmCheckIn(ctx, appsession.DB, checkIn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to check in", constants.InternalServerErrorCode, "Failed to check in. Email not associated with booking", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully checked in!", nil))
}

// View all available rooms
func ViewRooms(ctx *gin.Context, appsession *models.AppSession) {
	var roomRequest map[string]interface{}
	var room models.RoomRequest
	if err := ctx.ShouldBindJSON(&roomRequest); err != nil && !errors.Is(err, io.EOF) {
		HandleValidationErrors(ctx, err)
		return
	}

	// Validate JSON
	if err := utils.ValidateJSON(roomRequest, reflect.TypeOf(models.RoomRequest{})); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, err.Error(), constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to RoomRequest struct
	roomBytes, _ := json.Marshal(roomRequest)
	json.Unmarshal(roomBytes, &room)

	var floorNo string
	if room.FloorNo == "" {
		floorNo = "0"
	} else {
		floorNo = room.FloorNo
	}

	var err error
	var rooms []models.Room
	rooms, err = database.GetAllRooms(ctx, appsession.DB, floorNo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get rooms", constants.InternalServerErrorCode, "Failed to get rooms", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched rooms!", rooms))
}

// Helper function to handle validation of requests
func HandleValidationErrors(ctx *gin.Context, err error) {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		out := make([]models.ErrorMsg, len(ve))
		for i, err := range ve {
			out[i] = models.ErrorMsg{
				Field:   utils.LowercaseFirstLetter(err.Field()),
				Message: models.GetErrorMsg(err),
			}
		}
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid request payload", gin.H{"errors": out}))
	}
}
