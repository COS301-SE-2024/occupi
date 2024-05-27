package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Response struct {
	Status  int      `json:"status"`
	Message string   `json:"message"`
	Data    []bson.M `json:"data,omitempty"`
}

var Users = make(map[string]models.User)

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

func Register(generateOTP func() (string, error), sendMail func(to, subject, body string) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user models.User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		otp, err := generateOTP()
		if err != nil {
			http.Error(w, "Failed to generate OTP", http.StatusInternalServerError)
			return
		}

		user.Token = otp
		Users[user.Email] = user

		subject := "Your OTP for Email Verification"
		body := "Your OTP is: " + otp

		if err := sendMail(user.Email, subject, body); err != nil {
			http.Error(w, "Failed to send email", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful! Please check your email for the OTP to verify your account."})
	}
}

func VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Email string `json:"email"`
		OTP   string `json:"otp"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	user, exists := Users[request.Email]
	if !exists {
		http.Error(w, "Email not registered", http.StatusBadRequest)
		return
	}

	if user.Token == request.OTP {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Email verified successfully!"})
		return
	}

	http.Error(w, "Invalid OTP", http.StatusBadRequest)
}
