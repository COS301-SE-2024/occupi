package handlers

import (
	"net/http"
	"net/url"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// handler for logging a new user on occupi /auth/login
func Login(ctx *gin.Context, appsession *models.AppSession) {
	var requestUser models.RequestUser
	if err := ctx.ShouldBindBodyWithJSON(&requestUser); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// sanitize user password and email
	requestUser.Email = utils.SanitizeInput(requestUser.Email)
	requestUser.Password = utils.SanitizeInput(requestUser.Password)

	// validate email
	if !utils.ValidateEmail(requestUser.Email) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	// validate password
	if !utils.ValidatePassword(requestUser.Password) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid password"})
		return
	}

	// check if a user already exists in the database with such an email
	if exists := database.EmailExists(ctx, appsession.DB, requestUser.Email); !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Email not registered"})
		return
	}

	// fetch hashed password
	hashedPassword, err := database.GetPassword(ctx, appsession.DB, requestUser.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// check if they match
	match, err := utils.CompareArgon2IDHash(requestUser.Password, hashedPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	if !match {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
		return
	}

	//check if the next verification date is due
	if due := database.CheckIfNextVerificationDateIsDue(ctx, appsession.DB, requestUser.Email); due {
		ReverifyUsersEmail(ctx, appsession, requestUser.Email)
		return
	}

	state, err := utils.GenerateRandomState()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// Save the state inside the session.
	session := sessions.Default(ctx)
	session.Set("state", state)
	if err := session.Save(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Successful login!"})
}

// redirect to the Auth0 login page -> social auth stuff here
// ctx.Redirect(http.StatusTemporaryRedirect, appsession.Authenticator.AuthCodeURL(state))

// handler for registering a new user on occupi /auth/register
func Register(ctx *gin.Context, appsession *models.AppSession) {
	var requestUser models.RequestUser
	if err := ctx.ShouldBindBodyWithJSON(&requestUser); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// sanitize user password and email
	requestUser.Email = utils.SanitizeInput(requestUser.Email)
	requestUser.Password = utils.SanitizeInput(requestUser.Password)

	// validate email
	if !utils.ValidateEmail(requestUser.Email) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	// validate password
	if !utils.ValidatePassword(requestUser.Password) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid password"})
		return
	}

	// check if a user already exists in the database with such an email
	if exists := database.EmailExists(ctx, appsession.DB, requestUser.Email); exists {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	// hash password
	hashedPassword, err := utils.Argon2IDHash(requestUser.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}
	requestUser.Password = hashedPassword

	// save user to database
	if _, err := database.AddUser(ctx, appsession.DB, requestUser); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession.DB, requestUser.Email, otp); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// generete auth0 session and token
	state, err := utils.GenerateRandomState()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// Save the state inside the session.
	session := sessions.Default(ctx)
	session.Set("state", state)
	if err := session.Save(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	subject := "Email Verification - Your One-Time Password (OTP)"
	body := mail.FormatEmailVerificationBody(otp)

	if err := mail.SendMail(requestUser.Email, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Registration successful! Please check your email for the OTP to verify your account."})
}

// handler for verifying a users otp /api/verify-otp
func VerifyOTP(ctx *gin.Context, appsession *models.AppSession) {
	var userotp models.RequestUserOTP
	if err := ctx.ShouldBindBodyWithJSON(&userotp); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// sanitize otp and email
	userotp.Email = utils.SanitizeInput(userotp.Email)
	userotp.OTP = utils.SanitizeInput(userotp.OTP)

	// validate emails
	if !utils.ValidateEmail(userotp.Email) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email address"})
		return
	}

	// validate otp
	if !utils.ValidateOTP(userotp.OTP) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OTP"})
		return
	}

	// check if the otp is in the database
	if exists := database.OTPExists(ctx, appsession.DB, userotp.Email, userotp.OTP); !exists {
		ctx.JSON(http.StatusOK, gin.H{"message": "Email not registered, otp expired or invalid"})
		return
	}

	// delete the otp from the database
	if _, err := database.DeleteOTP(ctx, appsession.DB, userotp.Email, userotp.OTP); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		// the otp will autodelete after an hour so we can continue
	}

	// change users verification status to true
	if _, err := database.VerifyUser(ctx, appsession.DB, userotp.Email); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Email verified successfully!"})
}

func ReverifyUsersEmail(ctx *gin.Context, appsession *models.AppSession, email string) {
	// generate a random otp for the user and send email
	otp, err := utils.GenerateOTP()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
	}

	// save otp to database
	if _, err := database.AddOTP(ctx, appsession.DB, email, otp); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
	}

	subject := "Email Verification - Your One-Time Password (OTP)"
	body := mail.FormatEmailVerificationBody(otp)

	if err := mail.SendMail(email, subject, body); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		logrus.Error(err)
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Please check your email for the OTP to re-verify your account."})
}

func ResetPassword(ctx *gin.Context, appsession *models.AppSession) {
	// this will contain reset password logic
}

// handler for logging out a user on occupi /auth/logout
func Logout(c *gin.Context) {
	logoutURL, err := url.Parse("https://" + configs.GetAuth0Domain() + "/v2/logout")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}

	returnTo, err := url.Parse(scheme + "://" + c.Request.Host)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	parameters := url.Values{}
	parameters.Add("returnTo", returnTo.String())
	parameters.Add("client_id", configs.GetAuth0ClientID())
	logoutURL.RawQuery = parameters.Encode()

	c.Redirect(http.StatusTemporaryRedirect, logoutURL.String())
}
