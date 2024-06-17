package router

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
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
	// creating a new valid session for management of shared variables
	appsession := models.New(db)

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	router.Use(sessions.Sessions("occupi-sessions-store", store))

	ping := router.Group("/ping")
	{
		ping.GET("", func(ctx *gin.Context) { handlers.PingHandler(ctx) })
	}
	api := router.Group("/api")
	{
		// resource-auth serves as an example for adding authentication to a route, remove when not needed
		api.GET("/resource-auth", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.FetchResourceAuth(ctx, appsession) })
		// resource-auth-admin serves as an example for adding authentication as well as protecting admin routes, remove when not needed
		api.GET("/resource-auth-admin", middleware.ProtectedRoute, middleware.AdminRoute, func(ctx *gin.Context) { handlers.FetchResourceAuth(ctx, appsession) })
		api.POST("/book-room", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.BookRoom(ctx, appsession) })
		api.POST("/check-in", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.CheckIn(ctx, appsession) })
		api.POST("/cancel-booking", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.CancelBooking(ctx, appsession) })
		api.GET(("/view-bookings"), middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.ViewBookings(ctx, appsession) })
		api.GET("/view-rooms", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.ViewRooms(ctx, appsession) })
	}
	auth := router.Group("/auth")
	{
		auth.POST("/login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, "basic") })
		auth.POST("/login-admin", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, "admin") })
		auth.POST("/register", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Register(ctx, appsession) })
		auth.POST("/verify-otp", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession) })
		auth.POST("/logout", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.Logout(ctx) })
		// auth.POST("/reset-password", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ForgotPassword(ctx) })
	}
}
