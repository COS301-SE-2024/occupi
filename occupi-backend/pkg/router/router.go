package router

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

func OccupiRouter(db *mongo.Client) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/api/resource", handlers.FetchResource(db)).Methods("GET")
	r.HandleFunc("/register", handlers.Register(utils.GenerateOTP, mail.SendMail)).Methods("POST")
	r.HandleFunc("/verify-otp", handlers.VerifyOTP).Methods("POST")
	return r
}
