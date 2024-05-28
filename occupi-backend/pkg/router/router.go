package router

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func OccupiRouter(r *gin.Engine, db *mongo.Client) {
	ping := r.Group("/ping")
	{
		ping.GET("", func(c *gin.Context) { c.JSON(200, gin.H{"message": "pong -> I am alive and kicking"}) })
	}
	api := r.Group("/api")
	{
		api.GET("/resource", func(c *gin.Context) { handlers.FetchResource(c, db) })
	}

	//auth := r.Group("/auth")
	//{
	//auth.POST("/login", handlers.Login(db))
	//auth.POST("/register", handlers.Register(db))
	//}
}
