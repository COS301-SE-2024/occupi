package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
	"strconv"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
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
	data := database.GetAllData(ctx, appsession)

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Data fetched successfully", data))
}

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResourceAuth(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(ctx, appsession)

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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.BadRequestCode, err.Error(), nil))
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
	_, err = database.SaveBooking(ctx, appsession, booking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to save booking", constants.InternalServerErrorCode, "Failed to save booking", nil))
		return
	}

	if err := mail.SendBookingEmails(booking); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send booking email", constants.InternalServerErrorCode, "Failed to send booking email", nil))
		return
	}

	tokens, err := database.GetUsersPushTokens(ctx, appsession, booking.Emails)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get push tokens", constants.InternalServerErrorCode, "Failed to get push tokens", nil))
		return
	}

	scheduledNotification := models.ScheduledNotification{
		Title:                "Booking Starting Soon",
		Message:              utils.ConstructBookingStartingInScheduledString(utils.PrependEmailtoSlice(booking.Emails, booking.Creator), "3 mins"),
		SendTime:             booking.Start.Add(-3 * time.Minute),
		Emails:               booking.Emails,
		UnsentExpoPushTokens: utils.ConvertToStringArray(tokens),
		UnreadEmails:         booking.Emails,
	}

	success, errv := database.AddScheduledNotification(ctx, appsession, scheduledNotification, true)

	if errv != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	if !success {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	notification := models.ScheduledNotification{
		Title:                "Booking Invitation",
		Message:              utils.ConstructBookingScheduledString(utils.PrependEmailtoSlice(booking.Emails, booking.Creator)),
		SendTime:             time.Now(),
		Emails:               booking.Emails,
		UnsentExpoPushTokens: utils.ConvertToStringArray(tokens),
		UnreadEmails:         booking.Emails,
	}

	success, errv = database.AddScheduledNotification(ctx, appsession, notification, false)

	if errv != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	if !success {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
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
	bookings, err := database.GetUserBookings(ctx, appsession, email)
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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to Cancel struct
	var cancel models.Cancel
	cancelBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(cancelBytes, &cancel); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to cancel", constants.InternalServerErrorCode, "Failed to cancel", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession, cancel.BookingID)
	if !exists {
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the cancellation to the database
	_, err = database.ConfirmCancellation(ctx, appsession, cancel.BookingID, cancel.Creator)
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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.BadRequestCode, err.Error(), nil))
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
	exists := database.BookingExists(ctx, appsession, checkIn.BookingID)
	if !exists {
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the check-in to the database
	_, err = database.ConfirmCheckIn(ctx, appsession, checkIn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to check in", constants.InternalServerErrorCode, "Failed to check in. Email not associated with booking", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully checked in!", nil))
}

func GetUserDetails(ctx *gin.Context, appsession *models.AppSession) {
	// Extract the email query parameter
	email := ctx.Query("email")
	if email == "" || !utils.ValidateEmail(email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Expected Email Address", nil))
		return
	}

	if !database.EmailExists(ctx, appsession, email) {
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "User not found", constants.InternalServerErrorCode, "User not found", nil))
		return
	}

	// Get all the user details
	user, err := database.GetUserDetails(ctx, appsession, email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusNotFound, "Failed to get user details", constants.InternalServerErrorCode, "Failed to get user details", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched user details!", user))
}
func UpdateUserDetails(ctx *gin.Context, appsession *models.AppSession) {
	var user models.UserDetails
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	// Check if the user exists
	if !database.EmailExists(ctx, appsession, user.Email) {
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "User not found", constants.InternalServerErrorCode, "User not found", nil))
		return
	}
	var err error
	// Update the user details in the database
	_, err = database.UpdateUserDetails(ctx, appsession, user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to update user details", constants.InternalServerErrorCode, "Failed to update user details", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully updated user details!", nil))
}

func ViewRooms(ctx *gin.Context, appsession *models.AppSession) {
	// Fetch floor number from query parameters
	floorNo := ctx.Query("floorNo")
	if floorNo == "" {
		floorNo = "0"
	}

	var rooms []models.Room
	rooms, err := database.GetAllRooms(ctx, appsession, floorNo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get rooms", constants.InternalServerErrorCode, "Failed to get rooms", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched rooms!", rooms))
}

func GetUsers(ctx *gin.Context, appsession *models.AppSession) {
	users, err := database.GetAllUsers(ctx, appsession)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get users", constants.InternalServerErrorCode, "Failed to get users", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched users!", users))
}

// Helper function to handle validation of requests
func HandleValidationErrors(ctx *gin.Context, err error) {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		out := make([]models.ErrorMsg, len(ve))
		for i, err := range ve {
			out[i] = models.ErrorMsg{
				Field:   utils.LowercaseFirstLetter(err.Field()),
				Message: utils.GetErrorMsg(err),
			}
		}
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid request payload", gin.H{"errors": out}))
	}
}

func FilterCollection(ctx *gin.Context, appsession *models.AppSession, collectionName string) {
	var queryInput models.QueryInput
	if err := ctx.ShouldBindJSON(&queryInput); err != nil {
		// try to bind the query input to the struct
		queryInput = models.QueryInput{}
		operatorStr := ctx.Query("operator")
		if operatorStr != "" {
			queryInput.Operator = operatorStr
		}

		orderAscStr := ctx.Query("order_asc")
		if orderAscStr != "" {
			queryInput.OrderAsc = orderAscStr
		}

		orderDescStr := ctx.Query("order_desc")
		if orderDescStr != "" {
			queryInput.OrderDesc = orderDescStr
		}

		projectionStr := ctx.Query("projection")
		if projectionStr != "" {
			queryInput.Projection = utils.ConvertCommaDelimitedStringToArray(projectionStr)
		}

		limitStr := ctx.Query("limit")
		if limitStr != "" {
			limit, err := strconv.ParseInt(limitStr, 10, 64) // Base 10, 64-bit size
			if err != nil {
				// Handle the error if the conversion fails, maybe set an error response
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid limit format", constants.InvalidRequestPayloadCode, "Invalid limit format", nil))
				return
			}
			queryInput.Limit = limit
		}

		pageStr := ctx.Query("page")
		if pageStr != "" {
			page, err := strconv.ParseInt(pageStr, 10, 64) // Base 10, 64-bit size
			if err != nil {
				// Handle the error if the conversion fails, maybe set an error response
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid page format", constants.InvalidRequestPayloadCode, "Invalid page format", nil))
				return
			}
			queryInput.Page = page
		}

		// For Filter, which expects a map[string]interface{}, unmarshal the JSON string
		filterStr := ctx.Query("filter")
		if filterStr != "" {
			var filterMap map[string]interface{}
			if err := json.Unmarshal([]byte(filterStr), &filterMap); err != nil {
				// Handle JSON unmarshal error, maybe set an error response
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid filter format", constants.InvalidRequestPayloadCode, "Invalid filter format", nil))
				return
			}
			queryInput.Filter = filterMap
		}
	}

	sanitizedFilter := utils.SantizeFilter(queryInput)
	sanitizedSort := utils.SanitizeSort(queryInput)

	sanitizedProjection := utils.SantizeProjection(queryInput)

	projection := utils.ConstructProjection(queryInput, sanitizedProjection)

	limit, page, skip := utils.GetLimitPageSkip(queryInput)

	filter := models.FilterStruct{
		Filter:     sanitizedFilter,
		Projection: projection,
		Limit:      limit,
		Skip:       skip,
		Sort:       sanitizedSort,
	}

	res, totalResults, err := database.FilterCollectionWithProjection(ctx, appsession, collectionName, filter)

	if err != nil {
		logrus.Error("Failed to filter collection because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	if collectionName != "Notifications" {
		ctx.JSON(http.StatusOK, utils.SuccessResponseWithMeta(http.StatusOK, "success", res, gin.H{
			"totalResults": len(res), "totalPages": (totalResults + limit - 1) / limit, "currentPage": page}))
		return
	}

	// get the users email from the session
	if utils.IsSessionSet(ctx) {
		email, _ := utils.GetSession(ctx)
		err := database.ReadNotifications(ctx, appsession, email)

		if err != nil {
			logrus.Error("Failed to read notifications because: ", err)
			// it's not a critical error so we don't return an error response
		}
	} else {
		claims, err := utils.GetClaimsFromCTX(ctx)

		if err == nil {
			err := database.ReadNotifications(ctx, appsession, claims.Email)

			if err != nil {
				logrus.Error("Failed to read notifications because: ", err)
				// it's not a critical error so we don't return an error response
			}
		}
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponseWithMeta(http.StatusOK, "success", res, gin.H{
		"totalResults": len(res), "totalPages": (totalResults + limit - 1) / limit, "currentPage": page}))
}

func GetPushTokens(ctx *gin.Context, appsession *models.AppSession) {
	var emails models.RequestEmails
	if err := ctx.ShouldBindJSON(&emails); err != nil {
		emailsStr := ctx.Query("emails")
		if emailsStr != "" {
			emails.Emails = utils.ConvertCommaDelimitedStringToArray(emailsStr)
		} else {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"Unexpected fields found or invalid format",
				nil))
			return
		}
	}

	// sanitize the emails
	emails.Emails = utils.SanitizeInputArray(emails.Emails)

	// validate the emails
	if !utils.ValidateEmails(emails.Emails) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "One or more of email addresses are of Invalid format", nil))
		return
	}

	pushTokens, err := database.GetUsersPushTokens(ctx, appsession, emails.Emails)

	if err != nil {
		logrus.Error("Failed to get users: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get push tokens", constants.InternalServerErrorCode, "Failed to get push tokens", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched push tokens!", pushTokens))
}

func UpdateSecuritySettings(ctx *gin.Context, appsession *models.AppSession) {
	var securitySettings models.SecuritySettingsRequest
	if err := ctx.ShouldBindJSON(&securitySettings); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	//validate email
	if !utils.ValidateEmail(securitySettings.Email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid email format", nil))
		return
	}

	// Check if the user exists
	if !database.EmailExists(ctx, appsession, securitySettings.Email) {
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "User not found", constants.InternalServerErrorCode, "User not found", nil))
		return
	}

	// Validate the given passwords if they exist
	if securitySettings.CurrentPassword != "" && securitySettings.NewPassword != "" && securitySettings.NewPasswordConfirm != "" {
		if !utils.ValidatePassword(securitySettings.CurrentPassword) {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid password format", nil))
			return
		}

		if !utils.ValidatePassword(securitySettings.NewPassword) {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid password format", nil))
			return
		}

		if !utils.ValidatePassword(securitySettings.NewPasswordConfirm) {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid password format", nil))
			return
		}

		// Check if the new passwords match
		if securitySettings.NewPassword != securitySettings.NewPasswordConfirm {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Passwords do not match", nil))
			return
		}

		// check if the current password matches the one in the database
		password, err := database.GetPassword(ctx, appsession, securitySettings.Email)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get password", constants.InternalServerErrorCode, "Failed to get password", nil))
			return
		}

		// validate the password match
		res, err := utils.CompareArgon2IDHash(securitySettings.CurrentPassword, password)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to compare passwords", constants.InternalServerErrorCode, "Failed to compare passwords", nil))
			return
		}

		if !res {
			ctx.JSON(http.StatusUnauthorized, utils.ErrorResponse(http.StatusUnauthorized, "Invalid request payload", constants.InvalidRequestPayloadCode, "Passwords do not match", nil))
			return
		}
	}

	if err := database.UpdateSecuritySettings(ctx, appsession, securitySettings); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to update security settings", constants.InternalServerErrorCode, "Failed to update security settings", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully updated security settings!", nil))
}
