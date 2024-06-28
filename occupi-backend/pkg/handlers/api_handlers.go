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
	var bookingRequest map[string]interface{}
	if err := ctx.ShouldBindJSON(&bookingRequest); err != nil {
		HandleValidationErrors(ctx, err)
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(bookingRequest, reflect.TypeOf(models.Booking{}))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, err.Error(), constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated data to Booking struct
	var booking models.Booking
	bookingBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(bookingBytes, &booking); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to book", constants.InternalServerErrorCode, "Failed to check in", nil))
		return
	}

	// Generate a unique ID for the booking
	booking.ID = primitive.NewObjectID().Hex()
	booking.OccupiID = utils.GenerateBookingID()
	booking.CheckedIn = false

	// Save the booking to the database
	_, err = database.SaveBooking(ctx, appsession.DB, booking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to save booking", constants.InternalServerErrorCode, "Failed to save booking", nil))
		return
	}

	if err := mail.SendBookingEmails(booking); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send booking email", constants.InternalServerErrorCode, "Failed to send booking email", nil))
		return
	}

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
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusNotFound, "Failed to get bookings", constants.InternalServerErrorCode, "Failed to get bookings", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched bookings!", bookings))
}

func CancelBooking(ctx *gin.Context, appsession *models.AppSession) {
	var cancelRequest map[string]interface{}
	if err := ctx.ShouldBindJSON(&cancelRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(cancelRequest, reflect.TypeOf(models.Cancel{}))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, err.Error(), constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to Cancel struct
	var cancel models.Cancel
	cancelBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(cancelBytes, &cancel); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to cancel", constants.InternalServerErrorCode, "Failed to check in", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession.DB, cancel.ID)
	if !exists {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusNotFound, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the cancellation to the database
	_, err = database.ConfirmCancellation(ctx, appsession.DB, cancel.ID, cancel.Creator)
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
	var checkInRequest map[string]interface{}
	if err := ctx.ShouldBindJSON(&checkInRequest); err != nil {
		HandleValidationErrors(ctx, err)
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(checkInRequest, reflect.TypeOf(models.CheckIn{}))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, err.Error(), constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to CheckIn struct
	var checkIn models.CheckIn
	checkInBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(checkInBytes, &checkIn); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to check in", constants.InternalServerErrorCode, "Failed to check in", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession.DB, checkIn.BookingID)
	if !exists {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(404, "Failed to find booking", constants.InternalServerErrorCode, "Failed to find booking", nil))
		return
	}

	// Confirm the check-in to the database
	_, err = database.ConfirmCheckIn(ctx, appsession.DB, checkIn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to check in", constants.InternalServerErrorCode, "Failed to check in. Email not associated with booking", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully checked in!", nil))
}

func ViewRooms(ctx *gin.Context, appsession *models.AppSession) {
	var roomRequest map[string]interface{}
	var room models.RoomRequest
	if err := ctx.ShouldBindJSON(&roomRequest); err != nil && !errors.Is(err, io.EOF) {
		HandleValidationErrors(ctx, err)
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(roomRequest, reflect.TypeOf(models.RoomRequest{}))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, err.Error(), constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to RoomRequest struct
	roomBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(roomBytes, &room); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get room", constants.InternalServerErrorCode, "Failed to check in", nil))
		return
	}

	var floorNo string
	if room.FloorNo == "" {
		floorNo = "0"
	} else {
		floorNo = room.FloorNo
	}

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
