package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strconv"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/go-playground/validator/v10"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
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

	tokenArr, err := utils.ConvertTokensToStringArray(tokens, "expoPushToken")

	if err != nil {
		logrus.Error("Failed to convert tokens to string array because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	scheduledNotification := models.ScheduledNotification{
		Title:                "Booking Starting Soon",
		Message:              utils.ConstructBookingStartingInScheduledString(booking.Emails, "3 mins"),
		Sent:                 false,
		SendTime:             booking.Start.Add(-3 * time.Minute),
		Emails:               booking.Emails,
		UnsentExpoPushTokens: tokenArr,
		UnreadEmails:         booking.Emails,
	}

	success, errv := database.AddNotification(ctx, appsession, scheduledNotification, true)

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
		Message:              utils.ConstructBookingScheduledString(booking.Emails),
		Sent:                 true,
		SendTime:             utils.GetClientTime(ctx),
		Emails:               booking.Emails,
		UnsentExpoPushTokens: tokenArr,
		UnreadEmails:         booking.Emails,
	}

	success, errv = database.AddNotification(ctx, appsession, notification, false)

	if errv != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	if !success {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully booked!", booking.OccupiID))
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
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		emailStr := ctx.Query("email")
		if emailStr == "" {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
					http.StatusBadRequest,
					"Invalid request payload",
					constants.InvalidRequestPayloadCode,
					"Email must be provided",
					nil))
				return
			} else {
				request.Email = email
			}
		} else {
			request.Email = emailStr
		}
	}

	// Get all the user details
	user, err := database.GetUserDetails(ctx, appsession, request.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get user details", constants.InternalServerErrorCode, "Failed to get user details", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched user details!", user))
}

func UpdateUserDetails(ctx *gin.Context, appsession *models.AppSession) {
	var user models.UserDetailsRequest
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	// Update the user details in the database
	_, err := database.UpdateUserDetails(ctx, appsession, user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to update user details", constants.InternalServerErrorCode, "Failed to update user details", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully updated user details!", nil))
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

	if collectionName == "RoomBooking" {
		// check that the email field is set
		if _, ok := filter.Filter["email"]; !ok {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Email must be provided", nil))
			return
		}

		// delete email field from the filter
		email := filter.Filter["email"]
		delete(filter.Filter, "email")

		// set emails field in the filter
		filter.Filter["emails"] = bson.M{"$in": []string{email.(string)}}
	}

	fmt.Printf("Filter: %v\n", filter)
	fmt.Printf("Collection Name: %v\n", collectionName)

	res, totalResults, err := database.FilterCollectionWithProjection(ctx, appsession, collectionName, filter)

	if err != nil {
		logrus.Error("Failed to filter collection because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	if collectionName == "Notifications" {
		email, err := AttemptToGetEmail(ctx, appsession)

		if err == nil {
			err := database.ReadNotifications(ctx, appsession, email)

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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// check if the email is set
	if securitySettings.Email == "" {
		// get the email from the appsession
		email, err := AttemptToGetEmail(ctx, appsession)

		if err != nil {
			logrus.Error("Failed to get email because: ", err)
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"Email must be provided",
				nil))
			return
		}

		securitySettings.Email = email
	}

	// check that if current password is provided, new password and new password confirm are also provided and vice versa
	if (securitySettings.CurrentPassword == "" && (securitySettings.NewPassword != "" || securitySettings.NewPasswordConfirm != "")) ||
		(securitySettings.NewPassword == "" && (securitySettings.CurrentPassword != "" || securitySettings.NewPasswordConfirm != "")) ||
		(securitySettings.NewPasswordConfirm == "" && (securitySettings.CurrentPassword != "" || securitySettings.NewPassword != "")) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Current password, new password and new password confirm must all be provided",
			nil))
		return
	}

	// check if the password match
	if securitySettings.NewPassword != "" && securitySettings.NewPassword != securitySettings.NewPasswordConfirm {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"New password and new password confirm do not match",
			nil))
		return
	}

	// Validate the given passwords if they exist
	if securitySettings.CurrentPassword != "" && securitySettings.NewPassword != "" && securitySettings.NewPasswordConfirm != "" {
		securitySetting, err, success := SanitizeSecuritySettingsPassword(ctx, appsession, securitySettings)
		if err != nil || !success {
			logrus.Error("Failed to sanitize security settings because: ", err)
			return
		}

		securitySettings = securitySetting
	}

	// if mfa string is set, ensure it's either "on" or "off"
	if securitySettings.Mfa != "" && securitySettings.Mfa != constants.On && securitySettings.Mfa != constants.Off {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"mfa must be either 'on' or 'off'",
			nil))
		return
	}

	// if forceLogout string is set, ensure it's either "on" or "off"
	if securitySettings.ForceLogout != "" && securitySettings.ForceLogout != constants.On && securitySettings.ForceLogout != constants.Off {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"forceLogout must be either 'on' or 'off'",
			nil))
		return
	}

	if err := database.UpdateSecuritySettings(ctx, appsession, securitySettings); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to update security settings",
			constants.InternalServerErrorCode,
			"Failed to update security settings",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully updated security settings!", nil))
}

func GetSecuritySettings(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		emailStr := ctx.Query("email")
		if emailStr == "" {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
					http.StatusBadRequest,
					"Invalid request payload",
					constants.InvalidRequestPayloadCode,
					"Email must be provided",
					nil))
				return
			} else {
				request.Email = email
			}
		} else {
			request.Email = emailStr
		}
	}

	securitySettings, err := database.GetSecuritySettings(ctx, appsession, request.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to get security settings",
			constants.InternalServerErrorCode,
			"Failed to get security settings",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched security settings!", securitySettings))
}

func UpdateNotificationSettings(ctx *gin.Context, appsession *models.AppSession) {
	var notificationsSettings models.NotificationsRequest
	if err := ctx.ShouldBindJSON(&notificationsSettings); err != nil {
		email, err := AttemptToGetEmail(ctx, appsession)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"Invalid JSON payload",
				nil))
			return
		}
		notificationsSettings.Email = email

		invitesStr := ctx.Query("invites")
		if invitesStr != "" {
			notificationsSettings.Invites = invitesStr
		}

		bookingReminderStr := ctx.Query("bookingReminder")
		if bookingReminderStr != "" {
			notificationsSettings.BookingReminder = bookingReminderStr
		}
	}

	// If invites is set, ensure it's either "on" or "off"
	if notificationsSettings.Invites != "" && notificationsSettings.Invites != constants.On && notificationsSettings.Invites != constants.Off {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"invites must be either 'on' or 'off'",
			nil))
		return
	}

	// If bookingReminder is set, ensure it's either "on" or "off"
	if notificationsSettings.BookingReminder != "" && notificationsSettings.BookingReminder != constants.On && notificationsSettings.BookingReminder != constants.Off {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"bookingReminder must be either 'on' or 'off'",
			nil))
		return
	}

	// update the notification settings
	if err := database.UpdateNotificationSettings(ctx, appsession, notificationsSettings); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to update notification settings",
			constants.InternalServerErrorCode,
			"Failed to update notification settings",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully updated notification settings!", nil))
}

func GetNotificationSettings(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		emailStr := ctx.Query("email")
		if emailStr == "" {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
					http.StatusBadRequest,
					"Invalid request payload",
					constants.InvalidRequestPayloadCode,
					"Email must be provided",
					nil))
				return
			} else {
				request.Email = email
			}
		} else {
			request.Email = emailStr
		}
	}

	notificationSettings, err := database.GetNotificationSettings(ctx, appsession, request.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to get notification settings",
			constants.InternalServerErrorCode,
			"Failed to get notification settings",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched notification settings!", notificationSettings))
}

func UploadProfileImage(ctx *gin.Context, appsession *models.AppSession) {
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid file format",
			nil))
		return
	}

	var requestEmail models.RequestEmail
	if err := ctx.ShouldBindJSON(&requestEmail); err != nil {
		email, err := AttemptToGetEmail(ctx, appsession)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"Email must be provided",
				nil))
			return
		}
		requestEmail.Email = email
	}

	// get user image if it exists and delete it
	id, err := database.GetUserImage(ctx, appsession, requestEmail.Email)
	if err == nil {
		err = database.DeleteImageData(ctx, appsession, id)
		if err != nil {
			logrus.WithError(err).Error("Failed to delete user image")
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return
		}
	}

	// convert to bytes
	fileBytesThumbnail, errThumbnail := utils.ConvertImageToBytes(file, constants.ThumbnailWidth, true)
	fileBytesLow, errLow := utils.ConvertImageToBytes(file, constants.LowWidth, false)
	fileBytesMid, errMid := utils.ConvertImageToBytes(file, constants.MidWidth, false)
	fileBytesHigh, errHigh := utils.ConvertImageToBytes(file, constants.HighWidth, false)

	if err != nil || errThumbnail != nil || errLow != nil || errMid != nil || errHigh != nil {
		logrus.WithError(err).Error("Failed to convert image to bytes")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// Create a ProfileImage document
	profileImage := models.Image{
		FileName:     file.Filename,
		Thumbnail:    fileBytesThumbnail,
		ImageLowRes:  fileBytesLow,
		ImageMidRes:  fileBytesMid,
		ImageHighRes: fileBytesHigh,
	}

	// Save the image to the database
	newID, err := database.UploadImageData(ctx, appsession, profileImage)

	if err != nil {
		logrus.WithError(err).Error("Failed to upload image data")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// Update the user details with the image id
	err = database.SetUserImage(ctx, appsession, requestEmail.Email, newID)

	if err != nil {
		logrus.WithError(err).Error("Failed to set user image")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully uploaded image!", nil))
}

func DownloadProfileImage(ctx *gin.Context, appsession *models.AppSession) {
	var request models.ProfileImageRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		email := ctx.Query("email")
		quality := ctx.Query("quality")
		if email == "" {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
					http.StatusBadRequest,
					"Invalid request payload",
					constants.InvalidRequestPayloadCode,
					"Email must be provided",
					nil))
				return
			}
			request.Email = email
		} else {
			request.Email = email
		}
		request.Quality = quality

	}

	if request.Quality != "" && request.Quality != constants.ThumbnailRes && request.Quality != constants.LowRes && request.Quality != constants.MidRes && request.Quality != constants.HighRes {
		request.Quality = constants.MidRes
	} else if request.Quality == "" {
		request.Quality = constants.MidRes
	}

	// get the image id
	id, err := database.GetUserImage(ctx, appsession, request.Email)
	if err != nil {
		logrus.WithError(err).Error("Failed to get user image")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// get the image data
	imageData, err := database.GetImageData(ctx, appsession, id, request.Quality)
	if err != nil {
		logrus.WithError(err).Error("Failed to get image data")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// set the response headers
	ctx.Header("Content-Disposition", "attachment; filename="+imageData.FileName)
	ctx.Header("/Content-Type", "application/octet-stream")
	switch request.Quality {
	case constants.ThumbnailRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.Thumbnail)

		go PreloadAllImageResolutions(ctx, appsession, id)
	case constants.LowRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageLowRes)

		go PreloadMidAndHighResolutions(ctx, appsession, id)
	case constants.MidRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageMidRes)

		go PreloadHighResolution(ctx, appsession, id)
	case constants.HighRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageHighRes)
	default:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageMidRes)
	}
}

func DownloadImage(ctx *gin.Context, appsession *models.AppSession) {
	var request models.ImageRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		request.ID = ctx.Param("id")
		request.Quality = ctx.Query("quality")
		if request.ID == "" {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"ID must be provided",
				nil))
			return
		}
	}

	if request.Quality != "" && request.Quality != constants.ThumbnailRes && request.Quality != constants.LowRes && request.Quality != constants.MidRes && request.Quality != constants.HighRes {
		request.Quality = constants.MidRes
	} else if request.Quality == "" {
		request.Quality = constants.MidRes
	}

	// print the request
	fmt.Println(request)

	// get the image data
	imageData, err := database.GetImageData(ctx, appsession, request.ID, request.Quality)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get image", constants.InternalServerErrorCode, "Failed to get image", nil))
		return
	}

	// set the response headers
	ctx.Header("Content-Disposition", "attachment; filename="+imageData.FileName)
	ctx.Header("/Content-Type", "application/octet-stream")
	switch request.Quality {
	case constants.ThumbnailRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.Thumbnail)
	case constants.LowRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageLowRes)
	case constants.MidRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageMidRes)
	case constants.HighRes:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageHighRes)
	default:
		ctx.Data(http.StatusOK, "application/octet-stream", imageData.ImageMidRes)
	}
}

func UploadImage(ctx *gin.Context, appsession *models.AppSession, roomUpload bool) {
	file, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid file format",
			nil))
		return
	}

	// convert to bytes
	fileBytesThumbnail, errThumbnail := utils.ConvertImageToBytes(file, constants.ThumbnailWidth, true)
	fileBytesLow, errLow := utils.ConvertImageToBytes(file, constants.LowWidth, false)
	fileBytesMid, errMid := utils.ConvertImageToBytes(file, constants.MidWidth, false)
	fileBytesHigh, errHigh := utils.ConvertImageToBytes(file, constants.HighWidth, false)

	if errThumbnail != nil || errLow != nil || errMid != nil || errHigh != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to convert file to bytes", constants.InternalServerErrorCode, "Failed to convert file to bytes", nil))
		return
	}

	// Create a ProfileImage document
	profileImage := models.Image{
		FileName:     file.Filename,
		Thumbnail:    fileBytesThumbnail,
		ImageLowRes:  fileBytesLow,
		ImageMidRes:  fileBytesMid,
		ImageHighRes: fileBytesHigh,
	}

	// Save the image to the database
	newID, err := database.UploadImageData(ctx, appsession, profileImage)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to upload image", constants.InternalServerErrorCode, "Failed to upload image", nil))
		return
	}

	if roomUpload {
		// get room id from json body
		roomid := ctx.Query("roomid")

		if roomid == "" {
			roomid = ctx.PostForm("roomid")
			if roomid == "" {
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
				return
			}
		}

		// Update the room details with the image id
		err = database.AddImageIDToRoom(ctx, appsession, roomid, newID)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to update room image", constants.InternalServerErrorCode, "Failed to update room image", nil))
			return
		}
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully uploaded image!", gin.H{"id": newID}))
}
