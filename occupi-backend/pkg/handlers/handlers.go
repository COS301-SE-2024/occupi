package handlers

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// PLEASE REFACTOR THIS CODE BY ABSOLUTELY ALL MEANS
var Users = make(map[string]models.User) //IS THIS A GLOBALE MUTABLE VARIABLE? ABSOLUTE NO NO
var OTP string                           //IS THIS A GLOBALE MUTABLE VARIABLE? ABSOLUTE NO NO
//PLEASE REFACTOR THIS CODE BY ABSOLUTELY ALL MEANS

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResource(c *gin.Context, db *mongo.Client) {
	data := database.GetAllData(db)

	c.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully",
		"data":    data,
	})
}

// handler for registering a new user on occupi /auth/register
func Register(c *gin.Context) {
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
