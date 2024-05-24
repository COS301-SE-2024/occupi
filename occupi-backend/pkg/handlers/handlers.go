package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"go.mongodb.org/mongo-driver/mongo"
)

type Response struct {
	Message string `json:"message"`
	Data    []bson.M `json:"data"`
}

func TestFunction (db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := database.GetAllData(db);

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		response := Response{
			Message: "Data fetched successfully",
			Data:    data,
		}
		fmt.Println(response)
		json.NewEncoder(w).Encode(response)
	}
}