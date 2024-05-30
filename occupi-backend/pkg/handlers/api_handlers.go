package handlers

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResource(c *gin.Context, db *mongo.Client) {
	data := database.GetAllData(db)

	c.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully",
		"data":    data,
	})
}

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResourceAuth(c *gin.Context, db *mongo.Client) {
	data := database.GetAllData(db)

	c.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully and authenticated",
		"data":    data,
	})
}
