package handlers

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Response struct {
	Status  int      `json:"status"`
	Message string   `json:"message"`
	Data    []bson.M `json:"data"`
}

func FetchResource(c *gin.Context, db *mongo.Client) {
	data := database.GetAllData(db)
	response := Response{
		Status:  http.StatusOK,
		Message: "Data fetched successfully",
		Data:    data,
	}

	c.JSON(http.StatusOK, response)
}
