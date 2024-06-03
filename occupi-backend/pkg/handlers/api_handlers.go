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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Generate a unique ID for the booking
	booking.ID = primitive.NewObjectID().Hex()

	// Save the booking to the database
	_, err := database.SaveBooking(ctx, appsession.DB, booking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save booking"})
		return
	}

	// Prepare the email content
	subject := "Booking Confirmation - Occupi"
	body := mail.FormatBookingEmailBody(booking.BookingID, booking.RoomID, booking.Slot)

	// Send the confirmation email concurrently to all recipients
	emailErrors := utils.SendMultipleEmailsConcurrently(booking.Emails, subject, body)

	if len(emailErrors) > 0 {
		// avoid letting the user know which emails failed
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation emails to some addresses"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Booking successful! Confirmation emails sent."})
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
	//Confirm the check-in to the database
	_, err := database.ConfirmCheckIn(ctx, appsession.DB, checkIn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save booking"})
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully checked in!", nil))
}
