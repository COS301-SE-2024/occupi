package router

import (
	"encoding/gob"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// creates available endpoints and attaches handlers for each endpoint
func OccupiRouter(r *gin.Engine, db *mongo.Client) {

	authenticator, err := authenticator.New()
	if err != nil {
		panic(err)
	}
	h := handlers.NewHandler(authenticator, db)
	// To store custom types in our cookies,
	// we must first register them using gob.Register
	gob.Register(map[string]interface{}{})

	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("auth-session", store))

	r.Static("/landing", "./web/landing")
	r.Static("/app/dashboard", "./web/dashboard")
	r.Static("/documentation", "./web/documentation")

	ping := r.Group("/ping")
	{
		ping.GET("", func(c *gin.Context) { c.JSON(200, gin.H{"message": "pong -> I am alive and kicking"}) })
	}
	api := r.Group("/api")
	{
		api.GET("/resource", func(c *gin.Context) { handlers.FetchResource(c, db) })                                      //non-authenticated
		api.GET("/resource-auth", middleware.IsAuthenticated, func(c *gin.Context) { handlers.FetchResourceAuth(c, db) }) //authenticated
	}
	auth := r.Group("/auth")
	{
		auth.GET("/login", func(c *gin.Context) { handlers.Login(c, authenticator, db) })
		auth.POST("/register", func(c *gin.Context) { h.Register(c, authenticator, db) })
		auth.POST("/verify-otp", func(c *gin.Context) { h.VerifyOTP(c) })
		auth.POST("/book-room", func(c *gin.Context) { database.BookRoom(c, db) })
		//auth.POST("/logout", func(c *gin.Context) { handlers.Logout(c, authenticator) })
		auth.GET("/callback", func(c *gin.Context) { handlers.CallbackHandler(c, authenticator) })
	}
}
