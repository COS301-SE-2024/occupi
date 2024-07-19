package handlers

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// handler for logging a new user on occupi /auth/login
func Login(ctx *gin.Context, appsession *models.AppSession, role string, cookies bool) {
	var requestUser models.RequestUser
	if err := ctx.ShouldBindBodyWithJSON(&requestUser); err != nil {
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
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// validate password
	if valid, err := ValidatePasswordCorrectness(ctx, appsession, requestUser); !valid {
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// pre-login checks
	if success, err := PreLoginAccountChecks(ctx, appsession, requestUser.Email, role); !success {
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, requestUser.Email, role)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expirationTime, cookies)
}

// handler for registering a new user on occupi /auth/register
func Register(ctx *gin.Context, appsession *models.AppSession) {
	var requestUser models.RegisterUser
	if err := ctx.ShouldBindBodyWithJSON(&requestUser); err != nil {
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
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// validate email exists
	if valid, err := ValidateEmailDoesNotExist(ctx, appsession, requestUser.Email); !valid {
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// hash password
	hashedPassword, err := utils.Argon2IDHash(requestUser.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}
	requestUser.Password = hashedPassword

	// save user to database
	if _, err := database.AddUser(ctx, appsession, requestUser); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	_, err = SendOTPEmail(ctx, appsession, requestUser.Email, constants.VerifyEmail)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Registration successful! Please check your email for the OTP to verify your account.",
		nil))
}

// handler for generating a new otp for a user and resending it via email
func ResendOTP(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&request); err != nil {
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
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// sned the otp to verify the email
	_, err := SendOTPEmail(ctx, appsession, request.Email, constants.VerifyEmail)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Please check your email for the OTP to verify your account.",
		nil))
}

// handler for verifying a users otp /api/verify-otp
func VerifyOTP(ctx *gin.Context, appsession *models.AppSession, login bool, role string, cookies bool) {
	var userotp models.RequestUserOTP
	if err := ctx.ShouldBindBodyWithJSON(&userotp); err != nil {
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
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	if valid, err := ValidateOTPExists(ctx, appsession, userotp.Email, userotp.OTP); !valid {
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid OTP",
			constants.InvalidAuthCode,
			"Otp expired or invalid",
			nil))
		return
	}

	// delete the otp from the database
	if _, err := database.DeleteOTP(ctx, appsession, userotp.Email, userotp.OTP); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		// the otp will autodelete after an hour so we can continue
	}

	// change users verification status to true
	if _, err := database.VerifyUser(ctx, appsession, userotp.Email, ctx.ClientIP()); err != nil {
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
	}

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, userotp.Email, role)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expirationTime, cookies)
}

// handler for Verify 2fa
func VerifyTwoFA(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindJSON(&request); err != nil {
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
		logrus.WithError(err).Error("Error generating OTP")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// Save OTP in the database
	err = database.SaveTwoFACode(ctx, appsession.DB, request.Email, otp)
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"email": request.Email,
			"error": err.Error(),
		}).Error("Error saving OTP in database")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	// Send OTP via email
	subject := "Occupi Two-Factor Authentication Code"
	body := utils.FormatTwoFAEmailBody(otp, request.Email)
	if err := mail.SendMail(request.Email, subject, body); err != nil {
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
		logrus.WithError(err).Error("Error verifying 2FA code")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	if !valid {
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
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid request payload",
			constants.InvalidRequestPayloadCode,
			"Expected email, otp, and new_password fields",
			nil))
		return
	}

	// Validate email
	valid, err := ValidateEmailExists(ctx, appsession, resetRequest.Email)
	if !valid {
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// Validate OTP
	if valid, err := ValidateOTPExists(ctx, appsession, resetRequest.Email, resetRequest.OTP); !valid {
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid OTP",
			constants.InvalidAuthCode,
			"OTP expired or invalid",
			nil))
		return
	}

	// Validate new password
	password, err := ValidatePasswordEntryAndReturnHash(ctx, appsession, resetRequest.NewPassword)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Password validation failed",
			"ValidationErrorCode",
			err.Error(),
			nil))
		return
	}

	// Update password in database
	success, err := database.UpdateUserPassword(ctx, appsession.DB, resetRequest.Email, password)
	if err != nil || !success {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Password update failed",
			constants.InternalServerErrorCode,
			"Unable to update the password in the database",
			nil))
		return
	}

	// Log the user in and Generate a JWT token
	token, expi, err := GenerateJWTTokenAndStartSession(ctx, appsession, resetRequest.Email, role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(
			http.StatusInternalServerError,
			"Token generation failed",
			constants.InternalServerErrorCode,
			"Unable to generate a token for the user",
			nil))
		return
	}

	// Use AllocateAuthTokens to handle the response
	AllocateAuthTokens(ctx, token, expi, cookies)
}

func ForgotPassword(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&request); err != nil {
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
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// send the otp to reset the password
	_, err := SendOTPEmail(ctx, appsession, request.Email, constants.ResetPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Password reset OTP sent to your email",
		nil))
}

// handler for logging out a request
func Logout(ctx *gin.Context) {
	_ = utils.ClearSession(ctx)

	// Clear the Authorization header
	ctx.Header("Authorization", "")

	// Alternatively, completely remove the Authorization header
	ctx.Writer.Header().Del("Authorization")

	// List of domains to clear cookies from
	domains := configs.GetOccupiDomains()

	// Iterate over each domain and clear the "token" and "occupi-sessions-store" cookies
	for _, domain := range domains {
		ctx.SetCookie("token", "", -1, "/", domain, false, true)
		ctx.SetCookie("occupi-sessions-store", "", -1, "/", domain, false, true)
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Logged out successfully!",
		nil))
}

// handler for checking if this email is verified
func IsEmailVerified(ctx *gin.Context, appsession *models.AppSession) {
	var request models.RequestEmail
	if err := ctx.ShouldBindBodyWithJSON(&request); err != nil {
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
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
		}
		return
	}

	// check if the user is verified
	verified, err := database.CheckIfUserIsVerified(ctx, appsession, request.Email)
	if err != nil {
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
