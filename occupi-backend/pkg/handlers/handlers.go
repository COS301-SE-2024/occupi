package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

type Response struct {
	Message string            `json:"message"`
	Data    []models.Resource `json:"data"`
}

func GetResource(db []models.Resource) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		response := Response{
			Message: "Hello, World!",
			Data:    db,
		}
		json.NewEncoder(w).Encode(response)
	}
}
