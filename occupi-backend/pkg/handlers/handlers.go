package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Response struct {
	Status  int      `json:"status"`
	Message string   `json:"message"`
	Data    []bson.M `json:"data"`
}

func FetchResource(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := database.GetAllData(db)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		response := Response{
			Status:  http.StatusOK,
			Message: "Data fetched successfully",
			Data:    data,
		}
		json.NewEncoder(w).Encode(response)
	}
}

var users = make(map[string]model.User)

func Register(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := utils.GenerateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	user.Token = token
	users[user.Email] = user

	verificationLink := "http://localhost:8080/verify?token=" + token
	subject := "Please verify your email"
	body := "Click the following link to verify your email: " + verificationLink

	if err := mail.SendMail(user.Email, subject, body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful! Please check your email to verify your account."})
}

func Verify(c *gin.Context) {
	token := c.Query("token")
	for _, user := range users {
		if user.Token == token {
			c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully!"})
			return
		}
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
}
