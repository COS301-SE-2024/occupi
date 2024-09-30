package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
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
		configs.CaptureError(ctx, err)
		HandleValidationErrors(ctx, err)
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(bookingRequest, reflect.TypeOf(models.Booking{}))
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated data to Booking struct
	var booking models.Booking
	bookingBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(bookingBytes, &booking); err != nil {
		configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to save booking", constants.InternalServerErrorCode, "Failed to save booking", nil))
		return
	}

	if err := mail.SendBookingEmails(booking, appsession); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to send booking email", constants.InternalServerErrorCode, "Failed to send booking email", nil))
		return
	}

	tokens, err := database.GetUsersPushTokens(ctx, appsession, booking.Emails)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get push tokens", constants.InternalServerErrorCode, "Failed to get push tokens", nil))
		return
	}

	tokenArr, err := utils.ConvertTokensToStringArray(tokens, "expoPushToken")

	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to convert tokens to string array because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	scheduledNotification := models.ScheduledNotification{
		NotiID:               utils.GenerateUUID(),
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
		configs.CaptureError(ctx, errv)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	if !success {
		configs.CaptureMessage(ctx, "failed to schedule notification booking starting soon")
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	notification := models.ScheduledNotification{
		NotiID:               utils.GenerateUUID(),
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
		configs.CaptureError(ctx, errv)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	if !success {
		configs.CaptureMessage(ctx, "failed to schedule notification booking invitation")
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to schedule notification", constants.InternalServerErrorCode, "Failed to schedule notification", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully booked!", booking.OccupiID))
}

func CancelBooking(ctx *gin.Context, appsession *models.AppSession) {
	var cancelRequest map[string]interface{}
	if err := ctx.ShouldBindJSON(&cancelRequest); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(cancelRequest, reflect.TypeOf(models.Cancel{}))
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to Cancel struct
	var cancel models.Cancel
	cancelBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(cancelBytes, &cancel); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to cancel", constants.InternalServerErrorCode, "Failed to cancel", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession, cancel.BookingID)
	if !exists {
		configs.CaptureMessage(ctx, "booking not found")
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the cancellation to the database
	_, err = database.ConfirmCancellation(ctx, appsession, cancel.BookingID, cancel.Creator)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to cancel booking", constants.InternalServerErrorCode, "Failed to cancel booking", nil))
		return
	}

	if err := mail.SendCancellationEmails(cancel, appsession); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "An error occurred", constants.InternalServerErrorCode, "Failed to send booking email", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully cancelled booking!", nil))
}

// CheckIn handles the check-in process for a booking
func CheckIn(ctx *gin.Context, appsession *models.AppSession) {
	var checkInRequest map[string]interface{}
	if err := ctx.ShouldBindJSON(&checkInRequest); err != nil {
		configs.CaptureError(ctx, err)
		HandleValidationErrors(ctx, err)
		return
	}

	// Validate JSON
	validatedData, err := utils.ValidateJSON(checkInRequest, reflect.TypeOf(models.CheckIn{}))
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.BadRequestCode, err.Error(), nil))
		return
	}

	// Convert validated JSON to CheckIn struct
	var checkIn models.CheckIn
	checkInBytes, _ := json.Marshal(validatedData)
	if err := json.Unmarshal(checkInBytes, &checkIn); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to check in", constants.InternalServerErrorCode, "Failed to check in", nil))
		return
	}

	// Check if the booking exists
	exists := database.BookingExists(ctx, appsession, checkIn.BookingID)
	if !exists {
		configs.CaptureMessage(ctx, "booking not found")
		ctx.JSON(http.StatusNotFound, utils.ErrorResponse(http.StatusNotFound, "Booking not found", constants.InternalServerErrorCode, "Booking not found", nil))
		return
	}

	// Confirm the check-in to the database
	_, err = database.ConfirmCheckIn(ctx, appsession, checkIn)
	if err != nil {
		configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get user details", constants.InternalServerErrorCode, "Failed to get user details", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched user details!", user))
}

func UpdateUserDetails(ctx *gin.Context, appsession *models.AppSession) {
	var user models.UserDetailsRequest
	if err := ctx.ShouldBindJSON(&user); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	// Update the user details in the database
	_, err := database.UpdateUserDetails(ctx, appsession, user)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to update user details", constants.InternalServerErrorCode, "Failed to update user details", nil))
		return
	}

	// if user is updating their email, create a new token for them
	if user.Email != "" {
		if err := AttemptToSignNewEmail(ctx, appsession, user.Email); err != nil {
			logrus.Error("Failed to sign new email because: ", err)
			configs.CaptureError(ctx, err)
		}
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
		configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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
			configs.CaptureError(ctx, errors.New("email field not set"))
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Email must be provided", nil))
			return
		}

		// delete email field from the filter
		email := filter.Filter["email"]
		delete(filter.Filter, "email")

		// set emails field in the filter
		filter.Filter["emails"] = bson.M{"$in": []string{email.(string)}}
	}

	res, totalResults, err := database.FilterCollectionWithProjection(ctx, appsession, collectionName, filter)

	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to filter collection because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	if collectionName == "Notifications" {
		email, err := AttemptToGetEmail(ctx, appsession)

		if err == nil {
			err := database.ReadNotifications(ctx, appsession, email)

			if err != nil {
				configs.CaptureError(ctx, err)
				logrus.Error("Failed to read notifications because: ", err)
				// it's not a critical error so we don't return an error response
			}
		}
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponseWithMeta(http.StatusOK, "success", res, gin.H{
		"totalResults": len(res), "totalPages": (totalResults + limit - 1) / limit, "currentPage": page}))
}

func DeleteNotification(ctx *gin.Context, appsession *models.AppSession) {
	var request models.DeleteNotiRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid JSON payload", nil))
		return
	}

	// check if email is set otherwise attempt to get it from the appsession
	if request.Email == "" {
		email, err := AttemptToGetEmail(ctx, appsession)
		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Email must be provided", nil))
			return
		}
		request.Email = email
	}

	// delete the notification
	err := database.DeleteNotificationForUser(ctx, appsession, request)

	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to delete notification because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to delete notification", constants.InternalServerErrorCode, "Failed to delete notification", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully deleted notification!", nil))
}

func GetPushTokens(ctx *gin.Context, appsession *models.AppSession) {
	var emails models.RequestEmails
	if err := ctx.ShouldBindJSON(&emails); err != nil {
		emailsStr := ctx.Query("emails")
		if emailsStr != "" {
			emails.Emails = utils.ConvertCommaDelimitedStringToArray(emailsStr)
		} else {
			configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, errors.New("one or more of the emails are of invalid format"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "One or more of email addresses are of Invalid format", nil))
		return
	}

	pushTokens, err := database.GetUsersPushTokens(ctx, appsession, emails.Emails)

	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to get users: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to get push tokens", constants.InternalServerErrorCode, "Failed to get push tokens", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched push tokens!", pushTokens))
}

func UpdateSecuritySettings(ctx *gin.Context, appsession *models.AppSession) {
	var securitySettings models.SecuritySettingsRequest
	if err := ctx.ShouldBindJSON(&securitySettings); err != nil {
		configs.CaptureError(ctx, err)
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
			configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, errors.New("current password, new password and new password confirm must all be provided"))
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
		configs.CaptureError(ctx, errors.New("new password and new password confirm do not match"))
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
			configs.CaptureError(ctx, fmt.Errorf("failed to sanitize security settings because: %v", err))
			logrus.Error("Failed to sanitize security settings because: ", err)
			return
		}

		securitySettings = securitySetting
	}

	// if mfa string is set, ensure it's either "on" or "off"
	if securitySettings.Mfa != "" && securitySettings.Mfa != constants.On && securitySettings.Mfa != constants.Off {
		configs.CaptureMessage(ctx, "mfa must be either 'on' or 'off'")
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
		configs.CaptureMessage(ctx, "forceLogout must be either 'on' or 'off'")
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"forceLogout must be either 'on' or 'off'",
			nil))
		return
	}

	if err := database.UpdateSecuritySettings(ctx, appsession, securitySettings); err != nil {
		configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, err)
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
			configs.CaptureError(ctx, err)
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
		configs.CaptureMessage(ctx, "invites must be either 'on' or 'off'")
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
		configs.CaptureMessage(ctx, "bookingReminder must be either 'on' or 'off'")
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
		configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, err)
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
		configs.CaptureError(ctx, err)
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
		// attempt to get email from form data
		email := ctx.PostForm("email")
		if email == "" {
			emaila, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				configs.CaptureError(ctx, err)
				ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
					http.StatusBadRequest,
					"Invalid request payload",
					constants.InvalidRequestPayloadCode,
					"Email must be provided",
					nil))
				return
			}
			requestEmail.Email = emaila
		} else {
			requestEmail.Email = email
		}
	}

	// remove @ from email
	email := requestEmail.Email
	requestEmail.Email = strings.ReplaceAll(requestEmail.Email, "@", "")

	imageIds := []string{requestEmail.Email + constants.ThumbnailRes, requestEmail.Email + constants.LowRes, requestEmail.Email + constants.MidRes, requestEmail.Email + constants.HighRes}

	// del user image if it exists
	if err := MultiDeleteImages(ctx, appsession, configs.GetAzurePFPContainerName(), imageIds); err != nil {
		return
	}

	files, err := ResizeImagesAndReturnAsFiles(ctx, appsession, file, requestEmail.Email)

	if err != nil {
		return
	}

	// upload image associated with this email
	if err := MultiUploadImages(ctx, appsession, configs.GetAzurePFPContainerName(), files); err != nil {
		return
	}

	// update has image field in the database
	if err := database.SetHasImage(ctx, appsession, email, true); err != nil {
		configs.CaptureError(ctx, err)
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
				configs.CaptureError(ctx, err)
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

	if hasImage := database.UserHasImage(ctx, appsession, request.Email); !hasImage {
		gender, err := database.GetUsersGender(ctx, appsession, request.Email)

		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return
		}

		var blobURL string

		switch gender {
		case "Male":
			blobURL = fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s", configs.GetAzureAccountName(), configs.GetAzurePFPContainerName(), DefaultMalePFP())
		case "Female":
			blobURL = fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s", configs.GetAzureAccountName(), configs.GetAzurePFPContainerName(), DefaultMalePFP())
		default:
			blobURL = fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s", configs.GetAzureAccountName(), configs.GetAzurePFPContainerName(), DefaultNBPFP())
		}

		http.Redirect(ctx.Writer, ctx.Request, blobURL, http.StatusSeeOther)
		return
	}

	if request.Quality != "" && request.Quality != constants.ThumbnailRes && request.Quality != constants.LowRes && request.Quality != constants.MidRes && request.Quality != constants.HighRes {
		request.Quality = constants.MidRes
	} else if request.Quality == "" {
		request.Quality = constants.MidRes
	}

	// remove @ from email
	request.Email = strings.ReplaceAll(request.Email, "@", "")

	// redirect to the image on azure
	blobURL := fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s%s", configs.GetAzureAccountName(), configs.GetAzurePFPContainerName(), request.Email, request.Quality)

	http.Redirect(ctx.Writer, ctx.Request, blobURL, http.StatusSeeOther)
}

func DeleteProfileImage(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		email := ctx.Query("email")
		if email == "" {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				configs.CaptureError(ctx, err)
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
	}

	// remove @ from email
	email := request.Email
	request.Email = strings.ReplaceAll(request.Email, "@", "")

	imageIds := []string{request.Email + constants.ThumbnailRes, request.Email + constants.LowRes, request.Email + constants.MidRes, request.Email + constants.HighRes}

	// del user image if it exists
	if err := MultiDeleteImages(ctx, appsession, configs.GetAzurePFPContainerName(), imageIds); err != nil {
		return
	}

	// update has image field in the database
	if err := database.SetHasImage(ctx, appsession, email, false); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully deleted image!", nil))
}

func DownloadRoomImage(ctx *gin.Context, appsession *models.AppSession) {
	var request models.ImageRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		request.ID = ctx.Param("id")
		request.Quality = ctx.Query("quality")
		if request.ID == "" {
			configs.CaptureError(ctx, errors.New("id must be provided"))
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

	if request.ID == "null" {
		request.ID = "emproom.jpg"
		request.Quality = ""
	}

	// redirect to the image on azure
	blobURL := fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s%s", configs.GetAzureAccountName(), configs.GetAzureRoomsContainerName(), request.ID, request.Quality)

	http.Redirect(ctx.Writer, ctx.Request, blobURL, http.StatusSeeOther)
}

func UploadRoomImage(ctx *gin.Context, appsession *models.AppSession) {
	file, err := ctx.FormFile("image")
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid file format",
			nil))
		return
	}

	uuid := utils.GenerateUUID()

	files, err := ResizeImagesAndReturnAsFiles(ctx, appsession, file, uuid)

	if err != nil {
		return
	}

	// upload image associated with this email
	if err := MultiUploadImages(ctx, appsession, configs.GetAzureRoomsContainerName(), files); err != nil {
		return
	}

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
	err = database.AddImageToRoom(ctx, appsession, roomid, uuid)

	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.WithError(err).Error("Failed to update image id")
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to update room image id", constants.InternalServerErrorCode, "Failed to update room image", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully uploaded image!", gin.H{"id": uuid}))
}

func DeleteRoomImage(ctx *gin.Context, appsession *models.AppSession) {
	var request models.ImageRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		request.ID = ctx.Query("id")
		request.RoomID = ctx.Query("roomid")
		if request.ID == "" || request.RoomID == "" {
			configs.CaptureError(ctx, errors.New("id and roomid must be provided"))
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"ID and roomid must be provided",
				nil))
			return
		}
	}

	// del user image if it exists
	if err := MultiDeleteImages(ctx, appsession, configs.GetAzureRoomsContainerName(), []string{request.ID + constants.ThumbnailRes, request.ID + constants.LowRes, request.ID + constants.MidRes, request.ID + constants.HighRes}); err != nil {
		return
	}

	// Update the room details with the image id
	if err := database.DeleteImageFromRoom(ctx, appsession, request.RoomID, request.ID); err != nil {
		configs.CaptureError(ctx, err)
		logrus.WithError(err).Error("Failed to delete image id")
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Failed to delete room image id", constants.InternalServerErrorCode, "Failed to delete room image", nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully deleted image!", nil))
}

func AddRoom(ctx *gin.Context, appsession *models.AppSession) {
	var room models.RequestRoom
	if err := ctx.ShouldBindJSON(&room); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// Save the room to the database
	roomID, err := database.AddRoom(ctx, appsession, room)
	if err != nil {
		var msg string
		if err.Error() == "room already exists" {
			msg = "Room already exists"
		} else {
			msg = "Failed to add room"
		}
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to add room",
			constants.InternalServerErrorCode,
			"Failed to add room",
			gin.H{"message": msg}))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully added room!", gin.H{"roomid": roomID}))
}

func GetAvailableSlots(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestAvailableSlots

	// Try binding from JSON payload
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		// If JSON binding fails, try to bind from URL parameters
		roomID := ctx.Query("roomId")
		dateStr := ctx.Query("date")

		// If URL parameters are not empty, try parsing them
		if roomID != "" {
			request.RoomID = roomID
		}
		if dateStr != "" {
			// Parse the date string to time.Time
			parsedDate, err := time.Parse(time.RFC3339, dateStr)
			if err != nil {
				configs.CaptureError(ctx, err)
				ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
				return
			}
			request.Date = parsedDate
		}

		// Validate roomID and Date
		if request.RoomID == "" || request.Date.IsZero() {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Valid room id and date are required",
				constants.BadRequestCode,
				"You may have sent an empty room id or an invalid date",
				nil))
			return
		}
	}

	// Get the available slots
	availableSlots, err := database.GetAvailableSlots(ctx, appsession, request)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to get available slots",
			constants.InternalServerErrorCode,
			"Failed to get available slots",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched available slots!", availableSlots))
}

func ToggleOnsite(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestOnsite
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// if email is not set, get it from the appsession
	if request.Email == "" {
		email, err := AttemptToGetEmail(ctx, appsession)
		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"Email must be provided",
				nil))
			return
		}
		request.Email = email
	}

	// Toggle the onsite status
	err := database.ToggleOnsite(ctx, appsession, request)
	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to toggle onsite status because: ", err)
		if err.Error() == "invalid status" || err.Error() == "user is already onsite" || err.Error() == "user is already offsite" {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Failed to toggle onsite status",
				constants.InvalidRequestPayloadCode,
				"Failed due to invalid status or user is perhaps already onsite or offsite",
				nil))
			return
		}
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to toggle onsite status",
			constants.InternalServerErrorCode,
			"Failed to toggle onsite status",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully toggled onsite status!", nil))
}

func GetAnalyticsOnHours(ctx *gin.Context, appsession *models.AppSession, calculate string, forAllUsers bool) {
	var request models.RequestHours
	if err := ctx.ShouldBindJSON(&request); err != nil {
		emailStr := ctx.DefaultQuery("email", "")
		if emailStr == "" && !forAllUsers {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				configs.CaptureError(ctx, err)
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

		// default time is since 1970
		timeFromStr := ctx.DefaultQuery("timeFrom", "1970-01-01T00:00:00Z")
		// default time is now
		timeToStr := ctx.DefaultQuery("timeTo", time.Now().Format(time.RFC3339))

		timeFrom, err1 := time.Parse(time.RFC3339, timeFromStr)
		timeTo, err2 := time.Parse(time.RFC3339, timeToStr)

		if err1 != nil || err2 != nil {
			configs.CaptureError(ctx, err1)
			ctx.JSON(http.StatusBadRequest, utils.InternalServerError())
			return
		}

		request.TimeFrom = timeFrom
		request.TimeTo = timeTo

		limitStr := ctx.DefaultQuery("limit", "50")
		limit, err := strconv.ParseInt(limitStr, 10, 64)
		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.InternalServerError())
			return
		}

		request.Limit = limit

		pageStr := ctx.DefaultQuery("page", "1")
		page, err := strconv.ParseInt(pageStr, 10, 64)
		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.InternalServerError())
			return
		}

		request.Page = page
	} else {
		// ensure that the time from and time to are set else set them to default
		if request.TimeFrom.IsZero() || request.TimeTo.IsZero() {
			request.TimeFrom = time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
			request.TimeTo = time.Now()
		}

		// ensure that the limit is set else set it to default
		if request.Limit == 0 {
			request.Limit = 50
		}

	}

	limit, page, skip := utils.ComputeLimitPageSkip(request.Limit, request.Page)

	filter := models.AnalyticsFilterStruct{
		Filter: bson.M{
			"timeFrom": request.TimeFrom,
			"timeTo":   request.TimeTo,
		},
		Limit: limit, // or whatever limit you want to apply
		Skip:  skip,  // or whatever skip you want to apply
	}

	// if for all users set email to empty string
	if forAllUsers {
		request.Email = ""
	}

	// Get the user analytics
	userHours, totalResults, err := database.GetAnalyticsOnHours(ctx, appsession, request.Email, filter, calculate)
	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to get user analytics because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to get user analytics",
			constants.InternalServerErrorCode,
			"Failed to get user analytics",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponseWithMeta(http.StatusOK, "Successfully fetched user analytics! Note that all analytics are measured in hours.", userHours,
		gin.H{"totalResults": len(userHours), "totalPages": (totalResults + limit - 1) / limit, "currentPage": page}))
}

func CreateUser(ctx *gin.Context, appsession *models.AppSession) {
	var user models.UserRequest
	if err := ctx.ShouldBindJSON(&user); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// if employee id is not set, generate a random one
	if user.EmployeeID == "" {
		user.EmployeeID = utils.GenerateEmployeeID()
	}

	// check email does not exist
	if exists := database.EmailExists(ctx, appsession, user.Email); exists {
		configs.CaptureError(ctx, errors.New("email already exists"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Email already exists",
			constants.InvalidRequestPayloadCode,
			"Email already exists",
			nil))
		return
	}

	// hash the password
	hashedPassword, err := utils.Argon2IDHash(user.Password)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	user.Password = hashedPassword

	// Create the user in the database
	errv := database.CreateUser(ctx, appsession, user)
	if errv != nil {
		configs.CaptureError(ctx, errv)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to create user",
			constants.InternalServerErrorCode,
			"Failed to create user",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully created user!", nil))
}

func GetIPInfo(ctx *gin.Context, appsession *models.AppSession) {
	ipAddress := ctx.ClientIP()
	info, err := configs.GetIPInfo(ipAddress, appsession.IPInfo)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched IP information!", info))
}

func AddIP(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestIP
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// validate the IP
	if !utils.ValidateIP(request.IP) {
		configs.CaptureError(ctx, errors.New("invalid IP address"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid IP address",
			nil))
		return
	}

	// valdidate the emails
	if !utils.ValidateEmails(request.Emails) || len(request.Emails) == 0 {
		configs.CaptureError(ctx, errors.New("one or more of the emails are of invalid format"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "One or more of email addresses are of Invalid format", nil))
		return
	}

	// Add the IP to the database
	ipInfo, err := database.AddIP(ctx, appsession, request)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to add IP",
			constants.InternalServerErrorCode,
			"Failed to add IP",
			nil))
		return
	}

	// get logged users email from ctx
	email, errv := AttemptToGetEmail(ctx, appsession)
	if errv != nil {
		configs.CaptureError(ctx, errv)
		logrus.Error("Failed to get logged users email because: ", errv)
		// we are more focused on theadding of the ip address so we will not return an error
		ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully toggled admin status!", nil))
		return
	}

	if err := CreateAndSendNotificationLogic(
		ctx,
		appsession,
		email,
		request.Emails,
		"IP address added",
		fmt.Sprintf("%s has added %s to the list of allowed IP addresses for you. Check your email for more details.", email, request.IP),
		fmt.Sprintf("You have successfully added %s to the list of allowed IP addresses for %s.", request.IP, utils.ConvertArrayToCommaDelimitedString(request.Emails)),
	); err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to send notification because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	subject := "IP address added"
	body := utils.FormatIPAddressAddedEmailBody(ipInfo, email)

	if err := mail.SendBulkEmailWithBCC(request.Emails, subject, body, appsession); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully added IP!", nil))
}

func RemoveIP(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestIP
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// valdidate the emails
	if !utils.ValidateEmails(request.Emails) || len(request.Emails) == 0 {
		configs.CaptureError(ctx, errors.New("one or more of the emails are of invalid format"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "One or more of email addresses are of Invalid format", nil))
		return
	}

	// Remove the IP from the database
	ipInfo, err := database.RemoveIP(ctx, appsession, request)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to remove IP",
			constants.InternalServerErrorCode,
			"Failed to remove IP",
			nil))
		return
	}

	// get logged users email from ctx
	email, errv := AttemptToGetEmail(ctx, appsession)
	if errv != nil {
		configs.CaptureError(ctx, errv)
		logrus.Error("Failed to get logged users email because: ", errv)
		// we are more focused on the removing the ip address so we will not return an error
		ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully toggled admin status!", nil))
		return
	}

	if err := CreateAndSendNotificationLogic(
		ctx,
		appsession,
		email,
		request.Emails,
		"IP address removed",
		fmt.Sprintf("%s has removed %s from the list of allowed IP addresses for you. Check your email for more details.", email, request.IP),
		fmt.Sprintf("You have successfully removed %s from the list of allowed IP addresses for %s.", request.IP, utils.ConvertArrayToCommaDelimitedString(request.Emails)),
	); err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to send notification because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	subject := "IP address removed"
	body := utils.FormatIPAddressRemovedEmailBody(ipInfo, email)

	if err := mail.SendBulkEmailWithBCC(request.Emails, subject, body, appsession); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully removed IP!", nil))
}

func ToggleAllowAnonymousIP(ctx *gin.Context, appsession *models.AppSession) {
	var request models.AllowAnonymousIPRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// valdidate the emails
	if !utils.ValidateEmails(request.Emails) || len(request.Emails) == 0 {
		configs.CaptureError(ctx, errors.New("one or more of the emails are of invalid format"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "One or more of email addresses are of Invalid format", nil))
		return
	}

	// Toggle the allow anonymous IP status
	if err := database.ToggleAllowAnonymousIP(ctx, appsession, request); err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to toggle allow anonymous IP because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// get logged users email from ctx
	email, errv := AttemptToGetEmail(ctx, appsession)
	if errv != nil {
		configs.CaptureError(ctx, errv)
		logrus.Error("Failed to get logged users email because: ", errv)
		// we are more focused on the removing the ip address so we will not return an error
		ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully toggled admin status!", nil))
		return
	}

	var receiverAllow string
	var senderAllow string
	if request.BlockAnonymousIPAddress {
		receiverAllow = fmt.Sprintf(("%s has allowed anonymous IP addresses for you."), email)
		senderAllow = fmt.Sprintf("You have successfully allowed anonymous IP addresses for %s.", utils.ConvertArrayToCommaDelimitedString(request.Emails))
	} else {
		receiverAllow = fmt.Sprintf(("%s has disallowed anonymous IP addresses for you."), email)
		senderAllow = fmt.Sprintf("You have successfully disallowed anonymous IP addresses for %s.", utils.ConvertArrayToCommaDelimitedString(request.Emails))
	}

	if err := CreateAndSendNotificationLogic(
		ctx,
		appsession,
		email,
		request.Emails,
		"Allow anonymous IP address toggled",
		receiverAllow,
		senderAllow,
	); err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to send notification because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully toggled allow anonymous IP status!", nil))
}

func GetAnalyticsOnBookings(ctx *gin.Context, appsession *models.AppSession, calculate string) {
	var request models.RequestBooking
	if err := ctx.ShouldBindJSON(&request); err != nil {
		request.Creator = ctx.DefaultQuery("creator", "")
		attendees := ctx.DefaultQuery("attendeeEmails", "")
		if attendees == "" {
			request.Attendees = []string{}
		} else {
			request.Attendees = strings.Split(attendees, ",")
		}

		// default time is since 1970
		timeFromStr := ctx.DefaultQuery("timeFrom", "1970-01-01T00:00:00Z")
		// default time is now
		timeToStr := ctx.DefaultQuery("timeTo", time.Now().Format(time.RFC3339))

		timeFrom, err1 := time.Parse(time.RFC3339, timeFromStr)
		timeTo, err2 := time.Parse(time.RFC3339, timeToStr)

		if err1 != nil || err2 != nil {
			configs.CaptureError(ctx, err1)
			ctx.JSON(http.StatusBadRequest, utils.InternalServerError())
			return
		}

		request.TimeFrom = timeFrom
		request.TimeTo = timeTo

		limitStr := ctx.DefaultQuery("limit", "50")
		limit, err := strconv.ParseInt(limitStr, 10, 64)
		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.InternalServerError())
			return
		}

		request.Limit = limit

		pageStr := ctx.DefaultQuery("page", "1")
		page, err := strconv.ParseInt(pageStr, 10, 64)
		if err != nil {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.InternalServerError())
			return
		}

		request.Page = page
	} else {
		// ensure that the time from and time to are set else set them to default
		if request.TimeFrom.IsZero() || request.TimeTo.IsZero() {
			request.TimeFrom = time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
			request.TimeTo = time.Now()
		}

		// ensure that the limit is set else set it to default
		if request.Limit == 0 {
			request.Limit = 50
		}

	}

	limit, page, skip := utils.ComputeLimitPageSkip(request.Limit, request.Page)

	filter := models.AnalyticsFilterStruct{
		Filter: bson.M{
			"timeFrom": request.TimeFrom,
			"timeTo":   request.TimeTo,
		},
		Limit: limit, // or whatever limit you want to apply
		Skip:  skip,  // or whatever skip you want to apply
	}

	// Get the analytics
	result, totalResults, err := database.GetAnalyticsOnBookings(ctx, appsession, request.Creator, request.Attendees, filter, calculate)
	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to get analytics because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Failed to get analytics",
			constants.InternalServerErrorCode,
			"Failed to get analytics",
			nil))
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponseWithMeta(http.StatusOK, "Successfully fetched analytics!", result,
		gin.H{"totalResults": len(result), "totalPages": (totalResults + limit - 1) / limit, "currentPage": page}))
}

func ToggleAdminStatus(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RoleRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		email := ctx.Query("email")
		role := ctx.Query("role")
		if email == "" || role == "" {
			configs.CaptureError(ctx, err)
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Invalid request payload",
				constants.InvalidRequestPayloadCode,
				"Email and role must be provided",
				nil))
			return
		} else {
			request.Email = email
			request.Role = role
		}
	}

	// validate email
	if !utils.ValidateEmail(request.Email) {
		configs.CaptureError(ctx, errors.New("invalid email address"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid email address", nil))
		return
	}

	// Toggle the admin status
	err := database.ToggleAdminStatus(ctx, appsession, request)
	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to toggle admin status because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	email, err := AttemptToGetEmail(ctx, appsession)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Email must be provided",
			nil))
		return
	}

	if err := CreateAndSendNotificationLogic(
		ctx,
		appsession,
		email,
		[]string{request.Email},
		"Role status changed",
		fmt.Sprintf("%s has changed your role status to %s", email, request.Role),
		fmt.Sprintf("You have changed %s's role status to %s", request.Email, request.Role),
	); err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to send notification because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully toggled admin status and sent notifications!", nil))
}

func SendDownloadReportNotification(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Invalid JSON payload",
			nil))
		return
	}

	// valdidate the email
	if !utils.ValidateEmail(request.Email) {
		configs.CaptureError(ctx, errors.New("invalid email address"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid email address", nil))
		return
	}

	email, err := AttemptToGetEmail(ctx, appsession)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Email must be provided",
			nil))
		return
	}

	if err := CreateAndSendNotificationLogic(
		ctx,
		appsession,
		email,
		[]string{request.Email},
		"Report Downloaded",
		email+" has downloaded your worker analytics report",
		fmt.Sprintf("You have downloaded %s's worker analytics report", request.Email),
	); err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to send notification because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully sent notification!", nil))
}

func GetNotificationCount(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		emailStr := ctx.Query("email")
		if emailStr == "" {
			email, err := AttemptToGetEmail(ctx, appsession)
			if err != nil {
				configs.CaptureError(ctx, err)
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

	// get count
	unReadCount, totalCount, err := database.CountNotifications(ctx, appsession, request.Email)
	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to get notification count because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Successfully fetched notification count!", gin.H{"unread": unReadCount, "total": totalCount}))
}

func GetUsersLocations(ctx *gin.Context, appsession *models.AppSession) {
	var email string
	var order string
	var limit int64
	var page int64
	var err error
	order = ctx.Query("sort")
	if order == "" || (order != "asc" && order != "desc") {
		order = "asc"
	}

	limitStr := ctx.Query("limit")
	if limitStr != "" {
		limit, err = strconv.ParseInt(limitStr, 10, 64) // Base 10, 64-bit size
		if err != nil {
			limit = 50 // Default limit
		}
	}

	pageStr := ctx.Query("page")
	if pageStr != "" {
		page, err = strconv.ParseInt(pageStr, 10, 64) // Base 10, 64-bit size
		if err != nil {
			page = 1 // Default page
		}
	}

	// For email filter
	email = ctx.Query("email")
	// validate email
	if email != "" && !utils.ValidateEmail(email) {
		configs.CaptureError(ctx, errors.New("invalid email address"))
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(http.StatusBadRequest, "Invalid request payload", constants.InvalidRequestPayloadCode, "Invalid email address", nil))
		return
	}

	if limit <= 0 || limit > 50 {
		limit = 50 // Default limit
	}

	if page <= 0 {
		page = 1
	}
	skip := (page - 1) * limit

	locations, totalResults, err := database.GetUsersLocations(ctx, appsession, limit, skip, order, email)
	if err != nil {
		configs.CaptureError(ctx, err)
		logrus.Error("Failed to get users locations because: ", err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponseWithMeta(http.StatusOK, "Successfully fetched users locations!", locations, gin.H{
		"totalResults": len(locations), "totalPages": (totalResults + limit - 1) / limit, "currentPage": page}))
}
