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
