package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/ipinfo/go/v2/ipinfo"

	"github.com/gin-gonic/gin"
)

// handler for sneding an otp to a users email address
func SendOTPEmail(ctx *gin.Context, appsession *models.AppSession, email string, emailType string) (bool, error) {
	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		return false, err
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession, email, otp); err != nil {
		return false, err
	}

	var subject string
	var body string

	switch emailType {
	case constants.VerifyEmail:
		subject = "Email Verification - Your One-Time Password (OTP)"
		body = utils.FormatEmailVerificationBody(otp, email)
	case constants.ResetPassword:
		subject = "Password Reset - Your One-Time Password (OTP)"
		body = utils.FormatResetPasswordEmailBody(otp, email)
	case constants.ReverifyEmail:
		subject = "Email Reverification - Your One-Time Password (OTP)"
		body = utils.FormatReVerificationEmailBody(otp, email)
	case constants.ConfirmIPAddress:
		subject = "Confirm IP Address - Your One-Time Password (OTP)"
		body = utils.FormatIPAddressConfirmationEmailBody(otp, email)
	default:
		subject = "Email Verification - Your One-Time Password (OTP)"
		body = utils.FormatEmailVerificationBody(otp, email)
	}

	if err := mail.SendMail(email, subject, body); err != nil {
		return false, err
	}

	return true, nil
}

func SendOTPEMailForIPInfo(ctx *gin.Context, appsession *models.AppSession, email string, emailType string, unrecognizedLogger *ipinfo.Core) (bool, error) {
	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		return false, err
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession, email, otp); err != nil {
		return false, err
	}

	subject := "Confirm IP Address - Your One-Time Password (OTP)"
	body := utils.FormatIPAddressConfirmationEmailBodyWithIPInfo(otp, email, unrecognizedLogger)

	if err := mail.SendMail(email, subject, body); err != nil {
		return false, err
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"New login location detected. Please check your email for an otp.",
		nil))
	return true, nil
}

func GenerateJWTTokenAndStartSession(ctx *gin.Context, appsession *models.AppSession, email string, role string) (string, time.Time, error) {
	// generate a jwt token for the user
	var token string
	var expirationTime time.Time
	var err error
	var claims *authenticator.Claims
	if role == constants.Admin {
		token, expirationTime, claims, err = authenticator.GenerateToken(email, constants.Admin)
	} else {
		token, expirationTime, claims, err = authenticator.GenerateToken(email, constants.Basic)
	}

	if err != nil {
		return "", time.Time{}, err
	}

	err = utils.SetSession(ctx, claims)

	if err != nil {
		return "", time.Time{}, err
	}

	return token, expirationTime, nil
}

func ValidatePasswordEntry(ctx *gin.Context, appsession *models.AppSession, password string) (bool, error) {
	// sanitize input
	password = utils.SanitizeInput(password)

	// validate password
	if !utils.ValidatePassword(password) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid password",
			constants.InvalidRequestPayloadCode,
			"Password does neet meet requirements",
			nil))
		return false, nil
	}

	return true, nil
}

func ValidatePasswordEntryAndReturnHash(ctx *gin.Context, appsession *models.AppSession, password string) (string, error) {
	// sanitize input
	password = utils.SanitizeInput(password)

	// validate password
	if !utils.ValidatePassword(password) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid password",
			constants.InvalidRequestPayloadCode,
			"Password does neet meet requirements",
			nil))
		return "", nil
	}

	password, err := utils.Argon2IDHash(password)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return "", nil
	}

	return password, nil
}

func ValidatePasswordCorrectness(ctx *gin.Context, appsession *models.AppSession, requestUser models.RequestUser) (bool, error) {
	// sanitize input
	requestUser.Password = utils.SanitizeInput(requestUser.Password)

	// validate password
	if !utils.ValidatePassword(requestUser.Password) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid password",
			constants.InvalidRequestPayloadCode,
			"Password does neet meet requirements",
			nil))
		return false, nil
	}

	// fetch hashed password
	hashedPassword, err := database.GetPassword(ctx, appsession, requestUser.Email)
	if err != nil {
		return false, err
	}

	// check if they match
	match, err := utils.CompareArgon2IDHash(requestUser.Password, hashedPassword)
	if err != nil {
		return false, err
	}

	if !match {
		ctx.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			http.StatusUnauthorized,
			"Invalid password",
			constants.InvalidAuthCode,
			"Password is incorrect",
			nil))
		return false, nil
	}

	return true, nil
}

func ValidateEmailExists(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// sanitize input
	email = utils.SanitizeInput(email)

	// validate email
	if !utils.ValidateEmail(email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email",
			constants.InvalidRequestPayloadCode,
			"Email does not meet requirements",
			nil))
		return false, nil
	}

	// check if email exists
	exists := database.EmailExists(ctx, appsession, email)

	if !exists {
		ctx.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			http.StatusUnauthorized,
			"Invalid email",
			constants.InvalidAuthCode,
			"Email does not exist",
			nil))
		return false, nil
	}

	return true, nil
}

func ValidateOTPExists(ctx *gin.Context, appsession *models.AppSession, email string, otp string) (bool, error) {
	otp = utils.SanitizeInput(otp)

	// validate otp
	if !utils.ValidateOTP(otp) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid OTP",
			constants.InvalidRequestPayloadCode,
			"OTP does neet meet requirements",
			nil))
		return false, nil
	}

	// check if the otp is in the database
	valid, err := database.OTPExists(ctx, appsession, email, otp)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	return valid, nil
}

func ValidateEmailDoesNotExist(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// sanitize input
	email = utils.SanitizeInput(email)

	// validate email
	if !utils.ValidateEmail(email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email",
			constants.InvalidRequestPayloadCode,
			"Email does not meet requirements",
			nil))
		return false, nil
	}

	// check if email exists
	exists := database.EmailExists(ctx, appsession, email)

	if exists {
		ctx.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			http.StatusUnauthorized,
			"Invalid email",
			constants.InvalidAuthCode,
			"Email already exists",
			nil))
		return false, nil
	}

	return true, nil
}

func PreLoginAccountChecks(ctx *gin.Context, appsession *models.AppSession, email string, role string) (bool, error) {
	// check if the user is verified
	verified, err := database.CheckIfUserIsVerified(ctx, appsession, email)
	if err != nil {
		return false, err
	}

	if !verified {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Not verified",
			constants.IncompleteAuthCode,
			"Please verify your email before logging in",
			nil))
		return false, nil
	}

	// check if the user is an admin
	if role == constants.Admin {
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)
		if err != nil {
			return false, err
		}

		if !isAdmin {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Not an admin",
				constants.InvalidAuthCode,
				"Only admins can access this route",
				nil))
			return false, nil
		}
	}

	// check if the next verification date is due
	isVerificationDue, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, email)
	if err != nil {
		return false, err
	}

	// check if the users ip address is logging in from a known location
	isIPValid, unrecognizedLogger, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, utils.GetClientIP(ctx))

	if err != nil {
		return false, err
	}

	if isVerificationDue {
		_, err := SendOTPEmail(ctx, appsession, email, constants.ReverifyEmail)
		if err != nil {
			return false, err
		}
		return false, nil
	} else if !isIPValid {
		_, err := SendOTPEMailForIPInfo(ctx, appsession, email, constants.ConfirmIPAddress, unrecognizedLogger)
		if err != nil {
			return false, err
		}
		return false, nil
	}
	return true, nil
}

func SanitizeSecuritySettingsPassword(ctx *gin.Context, appsession *models.AppSession, securitySettings models.SecuritySettingsRequest) (models.SecuritySettingsRequest, error) {
	// sanitize input
	securitySettings.Email = utils.SanitizeInput(securitySettings.Email)
	securitySettings.CurrentPassword = utils.SanitizeInput(securitySettings.CurrentPassword)
	securitySettings.NewPassword = utils.SanitizeInput(securitySettings.NewPassword)
	securitySettings.NewPasswordConfirm = utils.SanitizeInput(securitySettings.NewPasswordConfirm)

	// validate current password
	if !utils.ValidatePassword(securitySettings.CurrentPassword) ||
		!utils.ValidatePassword(securitySettings.NewPassword) ||
		!utils.ValidatePassword(securitySettings.NewPasswordConfirm) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid password",
			constants.InvalidRequestPayloadCode,
			"Password does neet meet requirements",
			nil))
		return models.SecuritySettingsRequest{}, errors.New("invalid password")
	}

	// check if the passwords match
	if securitySettings.NewPassword != securitySettings.NewPasswordConfirm {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Passwords do not match",
			constants.InvalidRequestPayloadCode,
			"Passwords do not match",
			nil))
		return models.SecuritySettingsRequest{}, errors.New("passwords do not match")
	}

	// check if the current password is correct
	password, err := database.GetPassword(ctx, appsession, securitySettings.Email)

	if err != nil {
		return models.SecuritySettingsRequest{}, err
	}

	match, err := utils.CompareArgon2IDHash(securitySettings.CurrentPassword, password)

	if err != nil {
		return models.SecuritySettingsRequest{}, err
	}

	if !match {
		ctx.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			http.StatusUnauthorized,
			"Invalid password",
			constants.InvalidAuthCode,
			"Password is incorrect",
			nil))
		return models.SecuritySettingsRequest{}, errors.New("password is incorrect")
	}

	// hash the new password
	hashedPassword, err := utils.Argon2IDHash(securitySettings.NewPassword)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return models.SecuritySettingsRequest{}, err
	}

	securitySettings.NewPassword = hashedPassword

	return securitySettings, nil
}

// AllocateAuthTokens decides whether to send the JWT token in the Authorization header or as a cookie based on a condition.
func AllocateAuthTokens(ctx *gin.Context, token string, expirationTime time.Time, cookies bool) {
	if !cookies {
		// Send the JWT token in the Authorization header
		ctx.Header("Authorization", "Bearer "+token)
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Successful login!",
			gin.H{"token": token},
		))
	} else {
		// Set the JWT token in a cookie
		ctx.SetCookie("token", token, int(time.Until(expirationTime).Seconds()), "/", "", false, true)
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Successful login!",
			nil,
		))
	}
}

func AttemptToGetEmail(ctx *gin.Context, appsession *models.AppSession) (string, error) {
	// get the users email from the session
	if utils.IsSessionSet(ctx) {
		email, _ := utils.GetSession(ctx)
		return email, nil
	} else {
		claims, err := utils.GetClaimsFromCTX(ctx)
		if err != nil {
			return "", err
		}
		return claims.Email, nil
	}
}
