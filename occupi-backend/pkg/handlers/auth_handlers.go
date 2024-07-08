package handlers

import (
	"net/http"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// handler for logging a new user on occupi /auth/login
func Login(ctx *gin.Context, appsession *models.AppSession, role string) {
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
	requestUser.Email = utils.SanitizeInput(requestUser.Email)
	requestUser.Password = utils.SanitizeInput(requestUser.Password)
	requestUser.EmployeeID = utils.SanitizeInput(requestUser.EmployeeID)

	// validate email
	if !utils.ValidateEmail(requestUser.Email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	// validate password
	if !utils.ValidatePassword(requestUser.Password) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid password",
			constants.InvalidRequestPayloadCode,
			"Password does neet meet requirements",
			nil))
		return
	}

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

	// check if a user already exists in the database with such an email
	if exists := database.EmailExists(ctx, appsession, requestUser.Email); !exists {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Email not registered",
			constants.InvalidAuthCode,
			"Please register first before attempting to login",
			nil))
		return
	}

	// fetch hashed password
	hashedPassword, err := database.GetPassword(ctx, appsession, requestUser.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// check if they match
	match, err := utils.CompareArgon2IDHash(requestUser.Password, hashedPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	if !match {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Incorrect Password",
			constants.InvalidAuthCode,
			"Please enter the correct password",
			nil))
		return
	}

	// check if the user is verified
	verified, err := database.CheckIfUserIsVerified(ctx, appsession, requestUser.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	if !verified {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Not verified",
			constants.IncompleteAuthCode,
			"Please verify your email before logging in",
			nil))
		return
	}

	// check if the user is an admin
	if role == constants.Admin {
		isAdmin, err := database.CheckIfUserIsAdmin(ctx, appsession, requestUser.Email)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
			return
		}

		if !isAdmin {
			ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
				http.StatusBadRequest,
				"Not an admin",
				constants.InvalidAuthCode,
				"Only admins can access this route",
				nil))
			return
		}
	}

	// check if the next verification date is due
	due, err := database.CheckIfNextVerificationDateIsDue(ctx, appsession, requestUser.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	if due {
		ReverifyUsersEmail(ctx, appsession, requestUser.Email)
		return
	}

	// generate a jwt token for the user
	var token string
	var expirationTime time.Time
	if role == constants.Admin {
		token, expirationTime, err = authenticator.GenerateToken(requestUser.Email, constants.Admin)
	} else {
		token, expirationTime, err = authenticator.GenerateToken(requestUser.Email, constants.Basic)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// set the jwt token in the cookie
	session := sessions.Default(ctx)
	session.Set("email", requestUser.Email)
	if role == constants.Admin {
		session.Set("role", constants.Admin)
	} else {
		session.Set("role", constants.Basic)
	}
	if err := session.Save(); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}
	ctx.SetCookie("token", token, int(time.Until(expirationTime).Seconds()), "/", "", false, true)

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Successful login!",
		nil))
}

// handler for registering a new user on occupi /auth/register
func Register(ctx *gin.Context, appsession *models.AppSession) {
	var requestUser models.RequestUser
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
	requestUser.Email = utils.SanitizeInput(requestUser.Email)
	requestUser.Password = utils.SanitizeInput(requestUser.Password)
	requestUser.EmployeeID = utils.SanitizeInput(requestUser.EmployeeID)

	// validate email
	if !utils.ValidateEmail(requestUser.Email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	// validate password
	if !utils.ValidatePassword(requestUser.Password) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid password",
			constants.InvalidRequestPayloadCode,
			"Password does neet meet requirements",
			nil))
		return
	}

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

	// check if a user already exists in the database with such an email
	if exists := database.EmailExists(ctx, appsession, requestUser.Email); exists {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Email registered",
			constants.InvalidRequestPayloadCode,
			"Email already registered",
			nil))
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

	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession, requestUser.Email, otp); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	subject := "Email Verification - Your One-Time Password (OTP)"
	body := mail.FormatEmailVerificationBody(otp, requestUser.Email)

	if err := mail.SendMail(requestUser.Email, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Registration successful! Please check your email for the OTP to verify your account.",
		nil))
}

// handler for verifying a users otp /api/verify-otp
func VerifyOTP(ctx *gin.Context, appsession *models.AppSession) {
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

	// sanitize otp and email
	userotp.Email = utils.SanitizeInput(userotp.Email)
	userotp.OTP = utils.SanitizeInput(userotp.OTP)

	// validate emails
	if !utils.ValidateEmail(userotp.Email) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	// validate otp
	if !utils.ValidateOTP(userotp.OTP) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid OTP",
			constants.InvalidRequestPayloadCode,
			"OTP does neet meet requirements",
			nil))
		return
	}

	// check if the otp is in the database
	valid, err := database.OTPExists(ctx, appsession, userotp.Email, userotp.OTP)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	if !valid {
		// otp expired or invalid
		_, err := database.DeleteOTP(ctx, appsession, userotp.Email, userotp.OTP)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
			return
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
	if _, err := database.VerifyUser(ctx, appsession, userotp.Email); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Email verified successfully!",
		nil))
}

// handler for reverifying a users email address
func ReverifyUsersEmail(ctx *gin.Context, appsession *models.AppSession, email string) {
	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession, email, otp); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	subject := "Email Reverification - Your One-Time Password (OTP)"
	body := mail.FormatReVerificationEmailBody(otp, email)

	if err := mail.SendMail(email, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Please check your email for the OTP to re-verify your account.",
		nil))
}

// common handler logic for reset
func handlePasswordReset(ctx *gin.Context, appsession *models.AppSession, email string) {
	// Sanitize and validate email
	sanitizedEmail := utils.SanitizeInput(email)
	if !utils.ValidateEmail(sanitizedEmail) {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	// Check if the email exists in the database
	if exists := database.EmailExists(ctx, appsession, sanitizedEmail); !exists {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Email not registered",
			constants.InvalidAuthCode,
			"Please register first before attempting to reset password",
			nil))
		return
	}

	// Generate a OTP for the user to reset their password
	otp, err := utils.GenerateOTP()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error("Failed to generate OTP:", err)
		return
	}

	// Save the OTP in the database
	success, err := database.AddOTP(ctx, appsession, sanitizedEmail, otp)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error("Failed to save OTP:", err)
		return
	}
	if !success {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error("Failed to save OTP: operation unsuccessful")
		return
	}

	// Send the email to the user with the OTP
	subject := "Password Reset - Your One-Time Password"
	body := mail.FormatResetPasswordEmailBody(otp, email)

	if err := mail.SendMail(sanitizedEmail, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error("Failed to send email:", err)
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(
		http.StatusOK,
		"Password reset OTP sent to your email",
		nil))
}

func ResetPassword(ctx *gin.Context, appsession *models.AppSession) {
	var request struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	handlePasswordReset(ctx, appsession, request.Email)
}

func ForgotPassword(ctx *gin.Context, appsession *models.AppSession) {
	var request struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, utils.ErrorResponse(
			http.StatusBadRequest,
			"Invalid email address",
			constants.InvalidRequestPayloadCode,
			"Expected a valid format for email address",
			nil))
		return
	}

	handlePasswordReset(ctx, appsession, request.Email)
}

// handler for logging out a user
func Logout(ctx *gin.Context) {
	session := sessions.Default(ctx)
	session.Clear()
	if err := session.Save(); err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		return
	}

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
