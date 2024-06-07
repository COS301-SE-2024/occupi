package router

import (
	"encoding/gob"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// creates available endpoints and attaches handlers for each endpoint
func OccupiRouter(router *gin.Engine, db *mongo.Client) {
	authenticator, err := authenticator.New()
	if err != nil {
		panic(err)
	}

	// creating a new valid session for management of shared variables
	appsession := models.New(authenticator, db)

	// To store custom types in our cookies,
	// we must first register them using gob.Register
	gob.Register(map[string]interface{}{})

	store := cookie.NewStore([]byte("secret"))
	router.Use(sessions.Sessions("auth-session", store))

	router.Static("/landing", "./web/landing")
	router.Static("/app/dashboard", "./web/dashboard")
	router.Static("/documentation", "./web/documentation")

	ping := router.Group("/ping")
	{
		ping.GET("", func(ctx *gin.Context) { ctx.JSON(200, gin.H{"message": "pong -> I am alive and kicking"}) })
	}
	api := router.Group("/api")
	{
		api.GET("/resource-auth", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.FetchResourceAuth(ctx, appsession) }) // authenticated
		api.GET("/book-room", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.BookRoom(ctx, appsession) })
		api.GET("/check-in", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.CheckIn(ctx, appsession) })
		api.GET("cancel-booking", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.CancelBooking(ctx, appsession) })
	}
	auth := router.Group("/auth")
	{
		auth.POST("/login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession) })
		auth.POST("/register", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Register(ctx, appsession) })
		auth.POST("/verify-otp", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession) })
		// auth.POST("/logout", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Logout(ctx) })
		auth.GET("/callback", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.CallbackHandler(ctx, appsession) })
	}
}
