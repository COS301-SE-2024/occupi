package router

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gorilla/mux"
)

func NewRouter(db []models.Resource) *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/api/resource", handlers.GetResource(db)).Methods("GET")

	return r
}
