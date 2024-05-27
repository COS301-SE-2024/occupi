package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Response struct {
	Status  int      `json:"status"`
	Message string   `json:"message"`
	Data    []bson.M `json:"data,omitempty"`
}

var users = make(map[string]models.User)

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

func Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	token, err := utils.GenerateToken()
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	user.Token = token
	users[user.Email] = user

	verificationLink := "http://localhost:8080/verify?token=" + token
	subject := "Please verify your email"
	body := "Click the following link to verify your email: " + verificationLink

	if err := mail.SendMail(user.Email, subject, body); err != nil {
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful! Please check your email to verify your account."})
}

func Verify(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	for _, user := range users {
		if user.Token == token {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Email verified successfully!"})
			return
		}
	}

	http.Error(w, "Invalid token", http.StatusBadRequest)
}
