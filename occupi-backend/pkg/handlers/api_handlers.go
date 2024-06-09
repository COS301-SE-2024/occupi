package handlers

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResource(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(appsession.DB)

	ctx.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully",
		"data":    data,
	})
}

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResourceAuth(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(appsession.DB)

	ctx.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully and authenticated",
		"data":    data,
	})
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
	booking.OccupiID = 1
	booking.CheckedIn = false

	// Save the booking to the database
	_, err := database.SaveBooking(ctx, appsession.DB, booking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to save booking", constants.InternalServerErrorCode, "Failed to save booking", nil))
		return
	}

	// Prepare the email content
	subject := "Booking Confirmation - Occupi"
	body := mail.FormatBookingEmailBody(booking.ID, booking.RoomID, booking.Slot)

	// Send the confirmation email concurrently to all recipients
	emailErrors := utils.SendMultipleEmailsConcurrently(booking.Emails, subject, body)

	if len(emailErrors) > 0 {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send confirmation email", constants.InternalServerErrorCode, "Failed to send confirmation email", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully booked!", booking.ID))
}

// ViewBookings handles the retrieval of all bookings for a user
func ViewBookings(ctx *gin.Context, appsession *models.AppSession) {
	var userBooking models.User
	if err := ctx.ShouldBindJSON(&userBooking); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Email Address", nil))
		return
	}

	// Get all bookings for the userBooking
	bookings, err := database.GetUserBookings(ctx, appsession.DB, userBooking.Email)
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
	emailErrors := utils.SendMultipleEmailsConcurrently(booking.Emails, subject, body)

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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Booking ID, Room ID, and Email Address", nil))
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
