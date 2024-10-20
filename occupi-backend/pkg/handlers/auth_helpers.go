package handlers

import (
	"net/http"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
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
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession, email, otp); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
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

	if err := mail.SendMail(appsession, email, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Please check your email for an otp.",
		nil))
	return true, nil
}

func SendOTPEMailForIPInfo(ctx *gin.Context, appsession *models.AppSession, email string, emailType string, unrecognizedLogger *ipinfo.Core) (bool, error) {
	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession, email, otp); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	subject := "Confirm IP Address - Your One-Time Password (OTP)"
	body := utils.FormatIPAddressConfirmationEmailBodyWithIPInfo(otp, email, unrecognizedLogger)

	if err := mail.SendMail(appsession, email, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
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
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return "", time.Time{}, err
	}

	err = utils.SetSession(ctx, claims)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
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
		return "", err
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
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	// check if they match
	match, err := utils.CompareArgon2IDHash(requestUser.Password, hashedPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
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
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	// check if the user is an admin
	if role == constants.Admin {
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, email)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
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
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	// check if the users ip address is logging in from a known location
	isIPValid, unrecognizedLogger, err := database.CheckIfUserIsLoggingInFromKnownLocation(ctx, appsession, email, utils.GetClientIP(ctx))

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	if !isIPValid {
		// check if the login location is within 1000km of the other locations, if not block the login and unverify the user
		isInRange := database.IsIPWithinRange(ctx, appsession, email, unrecognizedLogger)

		if !isInRange {
			ctx.JSON(http.StatusForbidden, utils.ErrorResponse(
				http.StatusForbidden,
				"Forbidden from access",
				constants.ForbiddenCode,
				"This login attempt is forbidden as the login location is too far away from known locations",
				nil))
			return false, nil
		}

		// check if the user is allowed to login from new anonymous locations
		blockAnonymousIPAddress, err := database.CheckIfUserIsAllowedNewIP(ctx, appsession, email)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return false, err
		}

		if blockAnonymousIPAddress {
			ctx.JSON(http.StatusForbidden, utils.ErrorResponse(
				http.StatusForbidden,
				"Forbidden from access",
				constants.ForbiddenCode,
				"This login attempt is forbidden as this account is not allowed to login from new anonymous locations",
				nil))
			return false, nil
		}

		// check if this ip address is blacklisted for this user
		isBlacklisted, err := database.IsIPBlackListed(ctx, appsession, email, utils.GetClientIP(ctx))

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return false, err
		}

		if isBlacklisted {
			ctx.JSON(http.StatusForbidden, utils.ErrorResponse(
				http.StatusForbidden,
				"Forbidden from access",
				constants.ForbiddenCode,
				"This login attempt is forbidden as this ip address is blacklisted",
				nil))
			return false, nil
		}
	}

	// check if the user should reset their password
	shouldResetPassword, err := database.CheckIfUserShouldResetPassword(ctx, appsession, email)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	// check if the user has mfa enabled
	mfaEnabled, err := database.CheckIfUserHasMFAEnabled(ctx, appsession, email)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return false, err
	}

	switch {
	case isVerificationDue, !verified:
		// update verification status in database to false
		_, err = database.UpdateVerificationStatusTo(ctx, appsession, email, false)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			return false, err
		}
		if _, err := SendOTPEmail(ctx, appsession, email, constants.ReverifyEmail); err != nil {
			return false, err
		}
		return false, nil

	case mfaEnabled:
		if _, err := SendOTPEmail(ctx, appsession, email, constants.ReverifyEmail); err != nil {
			return false, err
		}
		return false, nil

	case !isIPValid:
		if _, err := SendOTPEMailForIPInfo(ctx, appsession, email, constants.ConfirmIPAddress, unrecognizedLogger); err != nil {
			return false, err
		}
		return false, nil

	case shouldResetPassword:
		if _, err := SendOTPEmail(ctx, appsession, email, constants.ResetPassword); err != nil {
			return false, err
		}
		return false, nil

	default:
		return true, nil
	}
}

func SanitizeSecuritySettingsPassword(ctx *gin.Context, appsession *models.AppSession, securitySettings models.SecuritySettingsRequest) (models.SecuritySettingsRequest, error, bool) {
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
		return models.SecuritySettingsRequest{}, nil, false
	}

	// check if the passwords match
	if securitySettings.NewPassword != securitySettings.NewPasswordConfirm {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Passwords do not match",
			constants.InvalidRequestPayloadCode,
			"Passwords do not match",
			nil))
		return models.SecuritySettingsRequest{}, nil, false
	}

	// check if the current password is correct
	password, err := database.GetPassword(ctx, appsession, securitySettings.Email)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return models.SecuritySettingsRequest{}, err, false
	}

	match, err := utils.CompareArgon2IDHash(securitySettings.CurrentPassword, password)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return models.SecuritySettingsRequest{}, err, false
	}

	if !match {
		ctx.JSON(http.StatusUnauthorized, utils.ErrorResponse(
			http.StatusUnauthorized,
			"Invalid password",
			constants.InvalidAuthCode,
			"Password is incorrect",
			nil))
		return models.SecuritySettingsRequest{}, nil, false
	}

	// hash the new password
	hashedPassword, err := utils.Argon2IDHash(securitySettings.NewPassword)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return models.SecuritySettingsRequest{}, err, false
	}

	securitySettings.NewPassword = hashedPassword

	return securitySettings, nil, true
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

func AttemptToSignNewEmail(ctx *gin.Context, appsession *models.AppSession, email string) error {
	claims, err := utils.GetClaimsFromCTX(ctx)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return err
	}

	_ = utils.ClearSession(ctx)

	// Clear the Authorization header
	ctx.Header("Authorization", "")

	// Alternatively, completely remove the Authorization header
	ctx.Writer.Header().Del("Authorization")

	ctx.SetCookie("token", "", -1, "/", "", false, true)
	ctx.SetCookie("occupi-sessions-store", "", -1, "/", "", false, true)

	// generate a jwt token for the user
	token, expirationTime, err := GenerateJWTTokenAndStartSession(ctx, appsession, email, claims.Role)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return err
	}

	originToken := ctx.GetString("tokenOrigin")
	var cookies bool

	if originToken == "cookie" {
		cookies = true
	} else {
		cookies = false
	}

	if !cookies {
		// Send the JWT token in the Authorization header
		ctx.Header("Authorization", "Bearer "+token)
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Successfully updated user details!",
			gin.H{"token": token},
		))
	} else {
		// Set the JWT token in a cookie
		ctx.SetCookie("token", token, int(time.Until(expirationTime).Seconds()), "/", "", false, true)
		ctx.JSON(http.StatusOK, utils.SuccessResponse(
			http.StatusOK,
			"Successfully updated user details!",
			nil,
		))
	}
	return nil
}

func CanLogin(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	if canLogin, err := cache.CanMakeLogin(appsession, email); !canLogin && (err == nil || err.Error() != "cache not found") {
		ctx.JSON(http.StatusTooManyRequests, utils.ErrorResponse(
			http.StatusTooManyRequests,
			"Too many login attempts",
			constants.TooManyRequestsCode,
			"Too many login attempts, please try again later",
			nil))
		return false, err
	}
	return true, nil
}

func AddMobileUser(ctx *gin.Context, appsession *models.AppSession, email string, jwt string) {
	// check if ctx req header is a mobile device(either iOS or Android)
	if !utils.IsMobileDevice(ctx) {
		return
	}

	mobileUser := models.MobileUser{
		Email: email,
		JWT:   jwt,
	}

	// add the user to the mobile user cache(or overwrite the user if they already exist)
	cache.SetMobileUser(appsession, mobileUser)
}
