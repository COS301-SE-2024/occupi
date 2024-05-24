package router

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	// "github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewRouter(db *mongo.Client) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/api/resource", handlers.TestFunction(db)).Methods("GET")

	return r
}
