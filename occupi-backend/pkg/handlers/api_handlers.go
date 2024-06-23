package handlers

import (
	"errors"
	"io"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected RoomID,Slot,Emails[],Creator,FloorNo ", nil))
		return
	}

	// Generate a unique ID for the booking
	booking.ID = primitive.NewObjectID().Hex()
	booking.OccupiID = utils.GenerateBookingID()
	booking.CheckedIn = false

	// Save the booking to the database
	_, err := database.SaveBooking(ctx, appsession.DB, booking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to save booking", constants.InternalServerErrorCode, "Failed to save booking", nil))
		return
	}

	// Prepare the email content
	subject := "Booking Confirmation - Occupi"
	body := mail.FormatBookingEmailBodyForBooker(booking.ID, booking.RoomID, booking.Slot, booking.Emails)

	// Send the confirmation email concurrently to all recipients
	emailErrors := mail.SendMultipleEmailsConcurrently(booking.Emails, subject, body)

	if len(emailErrors) > 0 {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send confirmation email", constants.InternalServerErrorCode, "Failed to send confirmation email", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully booked!", booking.ID))
}

// ViewBookings handles the retrieval of all bookings for a user
func ViewBookings(ctx *gin.Context, appsession *models.AppSession) {
	// Extract the email query parameter
	email := ctx.Query("email")
	if email == "" {
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
	var booking models.Booking
	if err := ctx.ShouldBindJSON(&booking); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Booking ID, Room ID, and Email Address", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession.DB, booking.ID)
	if !exists {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(404, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the cancellation to the database
	_, err := database.ConfirmCancellation(ctx, appsession.DB, booking.ID, booking.Creator)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to cancel booking", constants.InternalServerErrorCode, "Failed to cancel booking", nil))
		return
	}

	// Prepare the email content
	subject := "Booking Cancelled - Occupi"
	body := mail.FormatBookingEmailBody(booking.ID, booking.RoomID, booking.Slot)

	// Send the confirmation email concurrently to all recipients
	emailErrors := mail.SendMultipleEmailsConcurrently(booking.Emails, subject, body)

	if len(emailErrors) > 0 {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send cancellation email", constants.InternalServerErrorCode, "Failed to send cancellation email", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully cancelled booking!", nil))
}

// CheckIn handles the check-in process for a booking
func CheckIn(ctx *gin.Context, appsession *models.AppSession) {
	var checkIn models.CheckIn

	if err := ctx.ShouldBindJSON(&checkIn); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Booking ID, Room ID, and Creator Email Address", nil))
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
	var room models.Room
	if err := ctx.ShouldBindJSON(&room); err != nil && !errors.Is(err, io.EOF) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Floor No", nil))
		return
	}
	var rooms []models.Room
	var err error
	if room.FloorNo != -1 {
		// If FloorNo is provided, filter by FloorNo
		rooms, err = database.GetAllRooms(ctx, appsession.DB, room.FloorNo)
	} else {
		// If FloorNo is not provided, fetch all rooms on the ground floor
		rooms, err = database.GetAllRooms(ctx, appsession.DB, 0)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get rooms", constants.InternalServerErrorCode, "Failed to get rooms", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched rooms!", rooms))
}
