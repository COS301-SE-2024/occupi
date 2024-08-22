package handlers

import (
	"fmt"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/go-webauthn/webauthn/webauthn"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// handler for logging a new user on occupi /auth/login
func Login(ctx *gin.Context, appsession *models.AppSession, role string, cookies bool) {
	var requestUser models.RequestUser
	if err := ctx.ShouldBindBodyWithJSON(&requestUser); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected email and password fields or you may have placed a comma at the end of the json payload",
			nil))
		return
	}

	// sanitize user password and email
	requestUser.EmployeeID = utils.SanitizeInput(requestUser.EmployeeID)

	// validate employee id if it exists
	if requestUser.EmployeeID != "" {
		captureMessage(ctx, "Employee ID found in request payload, this field is not required for login")
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Unexpected payload field",
			constants.InvalidRequestPayloadCode,
			"Unexpected employee ID found in request payload, this field is not required for login",
			nil))
		return
	}

	// validate email exists
	if valid, err := ValidateEmailExists(ctx, appsession, requestUser.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	// validate password
	if valid, err := ValidatePasswordCorrectness(ctx, appsession, requestUser); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating password")
		}
		captureMessage(ctx, "ValidatePasswordCorrectness failed")
		return
	}

	// pre-login checks
	if configs.GetTestPassPhrase() != requestUser.IsTest {
		if success, err := PreLoginAccountChecks(ctx, appsession, requestUser.Email, role); !success {
			if err != nil {
				captureError(ctx, err)
				logrus.WithError(err).Error("Error validating email")
			}
			captureMessage(ctx, "PreLoginAccountChecks failed")
			return
		}
	}

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, requestUser.Email, role)

	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error generating JWT token")
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expirationTime, cookies)
}

func BeginLoginAdmin(ctx *gin.Context, appsession *models.AppSession) {
	var requestEmail models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&requestEmail); err != nil {
		captureError(ctx, err)

		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected email field",
			nil))
		return
	}

	// validate email exists
	if valid, err := ValidateEmailExists(ctx, appsession, requestEmail.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	// pre-login checks
	if success, err := PreLoginAccountChecks(ctx, appsession, requestEmail.Email, constants.Admin); !success {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "PreLoginAccountChecks failed")
		return
	}

	// Begin WebAuthn login process
	cred, err := database.GetUserCredentials(ctx, appsession, requestEmail.Email)
	if err != nil || len(cred.ID) == 0 {
		captureError(ctx, err)
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Error getting user credentials, please register for WebAuthn",
			gin.H{"error": "Error getting user credentials, please register for WebAuthn"}))
		fmt.Printf("error getting user credentials: %v", err)
		return
	}
	webauthnUser := models.NewWebAuthnUser([]byte(requestEmail.Email), requestEmail.Email, requestEmail.Email, cred)
	options, sessionData, err := appsession.WebAuthn.BeginLogin(webauthnUser)
	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		fmt.Printf("error beginning WebAuthn login: %v", err)
		return
	}

	uuid := utils.GenerateUUID()

	session := models.WebAuthnSession{
		UUID:        uuid,
		Email:       requestEmail.Email,
		Cred:        cred,
		SessionData: sessionData,
	}

	// Save the session data - cache will expire in x defined minutes according to the config
	if err := cache.SetSession(appsession, session, uuid); err != nil && err.Error() != "cache not found" {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		fmt.Printf("error saving WebAuthn session data: %v", err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"WebAuthn login initiated",
		gin.H{"options": options, "sessionData": sessionData, "uuid": uuid},
	))
}

func FinishLoginAdmin(ctx *gin.Context, appsession *models.AppSession, role string, cookies bool) {
	uuid := ctx.Param("id")

	if uuid == "" {
		captureMessage(ctx, "Expected id field")
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected id field",
			nil))
		return
	}

	// fetch sessionData from the cache
	sessionData, err := cache.GetSession(appsession, uuid)

	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.WithError(err).Error("Error fetching session data from cache")
		return
	}

	user := models.NewWebAuthnUser([]byte(sessionData.Email), sessionData.Email, sessionData.Email, sessionData.Cred)

	credential, err := appsession.WebAuthn.FinishLogin(user, *sessionData.SessionData, ctx.Request)

	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.WithError(err).Error("Error finishing login")
		return
	}

	err = database.AddUserCredential(ctx, appsession, sessionData.Email, credential)

	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.WithError(err).Error("Error finishing login")
		return
	}

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, sessionData.Email, role)

	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error generating JWT token")
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expirationTime, cookies)
}

func BeginRegistrationAdmin(ctx *gin.Context, appsession *models.AppSession) {
	var requestEmail models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&requestEmail); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected email field",
			nil))
		return
	}

	// validate email exists
	if valid, err := ValidateEmailExists(ctx, appsession, requestEmail.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	// pre-login checks
	if success, err := PreLoginAccountChecks(ctx, appsession, requestEmail.Email, constants.Admin); !success {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "PreLoginAccountChecks failed")
		return
	}

	webauthnUser := models.NewWebAuthnUser([]byte(requestEmail.Email), requestEmail.Email, requestEmail.Email, webauthn.Credential{})
	options, sessionData, err := appsession.WebAuthn.BeginRegistration(webauthnUser)
	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error beginning WebAuthn registration")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	uuid := utils.GenerateUUID()

	session := models.WebAuthnSession{
		UUID:        uuid,
		Email:       requestEmail.Email,
		Cred:        webauthn.Credential{},
		SessionData: sessionData,
	}

	// Save the session data - cache will expire in x defined minutes according to the config
	if err := cache.SetSession(appsession, session, uuid); err != nil && err.Error() != "cache not found" {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error saving session data in cache")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"WebAuthn login initiated",
		gin.H{"options": options, "sessionData": sessionData, "uuid": uuid},
	))
}

func FinishRegistrationAdmin(ctx *gin.Context, appsession *models.AppSession, role string, cookies bool) {
	uuid := ctx.Param("id")

	if uuid == "" {
		captureMessage(ctx, "Expected id field")
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected id field",
			nil))
		return
	}

	// fetch sessionData from the cache
	sessionData, err := cache.GetSession(appsession, uuid)

	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.WithError(err).Error("Error fetching session data from cache")
		return
	}

	user := models.NewWebAuthnUser([]byte(sessionData.Email), sessionData.Email, sessionData.Email, sessionData.Cred)

	credential, err := appsession.WebAuthn.FinishRegistration(user, *sessionData.SessionData, ctx.Request)

	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.WithError(err).Error("Error finishing login")
		return
	}

	err = database.AddUserCredential(ctx, appsession, sessionData.Email, credential)

	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.WithError(err).Error("Error finishing login")
		return
	}

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, sessionData.Email, role)

	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error generating JWT token")
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expirationTime, cookies)
}

// handler for registering a new user on occupi /auth/register
func Register(ctx *gin.Context, appsession *models.AppSession) {
	var requestUser models.RegisterUser
	if err := ctx.ShouldBindBodyWithJSON(&requestUser); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected at least email and password fields with optional emloyee_id or you may have placed a comma at the end of the json payload",
			nil))
		return
	}

	// sanitize user password and email
	requestUser.EmployeeID = utils.SanitizeInput(requestUser.EmployeeID)

	// validate employee id if it exists
	if requestUser.EmployeeID != "" && !utils.ValidateEmployeeID(requestUser.EmployeeID) {
		captureMessage(ctx, "Invalid employee ID")
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid employee ID",
			constants.InvalidRequestPayloadCode,
			"Employee ID does not meet requirements",
			nil))
		return
	} else if requestUser.EmployeeID == "" {
		requestUser.EmployeeID = utils.GenerateEmployeeID()
	}

	// validate password
	if valid, err := ValidatePasswordEntry(ctx, appsession, requestUser.Password); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating password")
		}
		captureMessage(ctx, "ValidatePasswordEntry failed")
		return
	}

	// validate email exists
	if valid, err := ValidateEmailDoesNotExist(ctx, appsession, requestUser.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailDoesNotExist failed")
		return
	}

	// hash password
	hashedPassword, err := utils.Argon2IDHash(requestUser.Password)
	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}
	requestUser.Password = hashedPassword

	// save user to database
	if _, err := database.AddUser(ctx, appsession, requestUser); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	if configs.GetTestPassPhrase() != requestUser.IsTest {
		if _, err := SendOTPEmail(ctx, appsession, requestUser.Email, constants.VerifyEmail); err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error sending OTP email")
			return
		}
	} else {
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Registered, please login",
			nil))
	}
}

// handler for generating a new otp for a user and resending it via email
func ResendOTP(ctx *gin.Context, appsession *models.AppSession, resendType string) {
	var request models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&request); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	// validate email exists
	if valid, err := ValidateEmailExists(ctx, appsession, request.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	var emailType string
	switch resendType {
	case constants.VerifyEmail:
		emailType = constants.VerifyEmail
	case constants.ResetPassword:
		emailType = constants.ResetPassword
	default:
		emailType = constants.VerifyEmail
	}
	// sned the otp to verify the email
	if _, err := SendOTPEmail(ctx, appsession, request.Email, emailType); err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error sending OTP email")
		return
	}

	// SendOTPEmail has logic that will send back a json response so no need to worry about the logic here
}

// handler for verifying a users otp /api/verify-otp
func VerifyOTP(ctx *gin.Context, appsession *models.AppSession, login bool, role string, cookies bool) {
	var userotp models.RequestUserOTP
	if err := ctx.ShouldBindBodyWithJSON(&userotp); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected email and otp fields or you may have placed a comma at the end of the json payload",
			nil))
		return
	}

	// validate email exists
	if valid, err := ValidateEmailExists(ctx, appsession, userotp.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	if valid, err := ValidateOTPExists(ctx, appsession, userotp.Email, userotp.OTP); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating otp")
		}
		return
	}

	// delete the otp from the database
	if _, err := database.DeleteOTP(ctx, appsession, userotp.Email, userotp.OTP); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		// the otp will autodelete after an hour so we can continue
	}

	// change users verification status to true
	if _, err := database.VerifyUser(ctx, appsession, userotp.Email, utils.GetClientIP(ctx)); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// if the user is not logging in, we can stop here
	if !login {
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Email verified successfully!",
			nil))
		return
	}

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, userotp.Email, role)

	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error generating JWT token")
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expirationTime, cookies)
}

// handler for Verify 2fa
func VerifyTwoFA(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			err.Error(),
			nil))
		return
	}

	// Generate OTP
	otp, err := utils.GenerateOTP()
	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error generating OTP")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// Save OTP in the database
	err = database.SaveTwoFACode(ctx, appsession.DB, request.Email, otp)
	if err != nil {
		captureError(ctx, err)
		logrus.WithFields(logrus.Fields{
			"error": err.Error(),
		}).Error("Error saving OTP in database")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// Send OTP via email
	subject := "Occupi Two-Factor Authentication Code"
	body := utils.FormatTwoFAEmailBody(otp, request.Email)
	if err := mail.SendMail(request.Email, subject, body); err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error sending OTP email")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Two-factor authentication code sent. Please check your email.",
		nil))
}

func VerifyOTPAndEnable2FA(ctx *gin.Context, appsession *models.AppSession) {
	var request struct {
		Email string `json:"email" binding:"required,email"`
		Code  string `json:"code" binding:"required,len=6"`
	}
	if err := ctx.ShouldBindJSON(&request); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			err.Error(),
			nil))
		return
	}

	// Verify the 2FA code
	valid, err := database.VerifyTwoFACode(ctx, appsession.DB, request.Email, request.Code)
	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error verifying 2FA code")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	if !valid {
		captureMessage(ctx, "Invalid 2FA code")
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid 2FA code",
			constants.InvalidAuthCode,
			"The provided 2FA code is invalid or has expired",
			nil))
		return
	}

	// Enable 2FA for the user
	err = database.SetTwoFAEnabled(ctx, appsession.DB.Database("Occupi"), request.Email, true)
	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error enabling 2FA")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Two-factor authentication enabled successfully",
		nil))
}

func ResetPassword(ctx *gin.Context, appsession *models.AppSession, role string, cookies bool) {
	var resetRequest models.ResetPassword

	if err := ctx.ShouldBindJSON(&resetRequest); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected email, otp, and new_password fields",
			nil))
		return
	}

	// Validate email
	if valid, err := ValidateEmailExists(ctx, appsession, resetRequest.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	// Validate OTP
	if valid, err := ValidateOTPExists(ctx, appsession, resetRequest.Email, resetRequest.OTP); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating OTP")
		}
		captureMessage(ctx, "ValidateOTPExists failed")
		return
	}

	// Validate new password
	password, err := ValidatePasswordEntryAndReturnHash(ctx, appsession, resetRequest.NewPassword)
	if err != nil || password == "" {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error validating password")
		return
	}

	// change users verification status to true
	if _, err := database.VerifyUser(ctx, appsession, resetRequest.Email, utils.GetClientIP(ctx)); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// Update password in database
	success, err := database.UpdateUserPassword(ctx, appsession, resetRequest.Email, password)
	if err != nil || !success {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Password update failed",
			constants.InternalServerErrorCode,
			"Unable to update the password in the database",
			nil))
		return
	}

	// Log the user in and Generate a JWT token
	token, exp, err := GenerateJWTTokenAndStartSession(ctx, appsession, resetRequest.Email, role)
	if err != nil {
		captureError(ctx, err)
		logrus.WithError(err).Error("Error generating JWT token")
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, exp, cookies)
}

// handler for logging out a request
func Logout(ctx *gin.Context) {
	_ = utils.ClearSession(ctx)

	// Clear the Authorization header
	ctx.Header("Authorization", "")

	// Alternatively, completely remove the Authorization header
	ctx.Writer.Header().Del("Authorization")

	// Iterate over each domain and clear the "token" and "occupi-sessions-store" cookies
	ctx.SetCookie("token", "", -1, "/", "", false, true)
	ctx.SetCookie("occupi-sessions-store", "", -1, "/", "", false, true)

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Logged out successfully!",
		nil))
}

// handler for checking if this email is verified
func IsEmailVerified(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&request); err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	// validate email exists
	if valid, err := ValidateEmailExists(ctx, appsession, request.Email); !valid {
		if err != nil {
			captureError(ctx, err)
			logrus.WithError(err).Error("Error validating email")
		}
		captureMessage(ctx, "ValidateEmailExists failed")
		return
	}

	// check if the user is verified
	verified, err := database.CheckIfUserIsVerified(ctx, appsession, request.Email)
	if err != nil {
		captureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	if !verified {
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"User is not verified",
			nil))
		return
	}
	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"User is verified",
		nil))
}
