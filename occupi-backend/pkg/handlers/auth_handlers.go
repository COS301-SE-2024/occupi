package handlers

import (
	"net/http"
	"net/url"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
)

// PLEASE REFACTOR THIS CODE BY ABSOLUTELY ALL MEANS
var Users = make(map[string]models.User) //IS THIS A GLOBALE MUTABLE VARIABLE? ABSOLUTE NO NO
var OTP string                           //IS THIS A GLOBALE MUTABLE VARIABLE? ABSOLUTE NO NO
//PLEASE REFACTOR THIS CODE BY ABSOLUTELY ALL MEANS

// handler for loggin a new user on occupi /auth/login
func Login(c *gin.Context, authenticator *authenticator.Authenticator, db *mongo.Client) {
	state, err := utils.GenerateRandomState()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// Save the state inside the session.
	session := sessions.Default(c)
	session.Set("state", state)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	//redirect to the Auth0 login page
	c.Redirect(http.StatusTemporaryRedirect, authenticator.AuthCodeURL(state))
}

// handler for registering a new user on occupi /auth/register
func Register(c *gin.Context, authenticator *authenticator.Authenticator, db *mongo.Client) {
	var user models.User
	if err := c.ShouldBindBodyWithJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	OTP, err := utils.GenerateOTP()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	user.Token = OTP
	Users[user.Email] = user

	subject := "Your OTP for Email Verification"
	body := "Your OTP is: " + OTP

	if err := mail.SendMail(user.Email, subject, body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful! Please check your email for the OTP to verify your account."})
}

// handler for verifying a users otp /api/verify-otp
func VerifyOTP(c *gin.Context) {
	var userotp models.UserOTP
	if err := c.ShouldBindBodyWithJSON(&userotp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	user, exists := Users[userotp.Email]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email not registered"})
		return
	}

	if user.Token == userotp.OTP {
		c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully!"})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OTP"})
}

// handler for logging out a user on occupi /auth/logout
func Logout(c *gin.Context, authenticator *authenticator.Authenticator) {
	logoutUrl, err := url.Parse("https://" + configs.GetAuth0Domain() + "/v2/logout")
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
	logoutUrl.RawQuery = parameters.Encode()

	c.Redirect(http.StatusTemporaryRedirect, logoutUrl.String())
}
