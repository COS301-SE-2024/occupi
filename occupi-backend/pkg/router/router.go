package router

import (
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/allegro/bigcache/v3"
	"github.com/gin-contrib/cors"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

// creates available endpoints and attaches handlers for each endpoint
func OccupiRouter(router *gin.Engine, db *mongo.Client, cache *bigcache.BigCache) {
	// creating a new valid session for management of shared variables
	appsession := models.New(db, cache)

	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	router.Use(sessions.Sessions("occupi-sessions-store", store))

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        12 * time.Hour,
	}))

	ping := router.Group("/ping")
	{
		ping.GET("", func(ctx *gin.Context) { handlers.PingHandler(ctx) })
	}
	pingOpen := router.Group("/ping-open")
	{
		pingOpen.GET("", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.PingHandlerOpen(ctx) })
	}
	pingAuth := router.Group("/ping-auth")
	{
		pingAuth.GET("", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.PingHandlerAuth(ctx) })
	}
	pingAdmin := router.Group("/ping-admin")
	{
		pingAdmin.GET("", middleware.ProtectedRoute, middleware.AdminRoute, func(ctx *gin.Context) { handlers.PingHandlerAdmin(ctx) })
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
		api.GET("/user-details", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.GetUserDetails(ctx, appsession) })
		api.PUT("/update-user", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.UpdateUserDetails(ctx, appsession) })
		api.GET("/filter-users", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.FilterUsers(ctx, appsession) })
		api.GET("/get-users", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.GetUsers(ctx, appsession) })
	}
	auth := router.Group("/auth")
	{
		auth.POST("/login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Basic, true) })
		auth.POST("/login-admin", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Admin, true) })
		auth.POST("/login-mobile", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Basic, false) })
		auth.POST("/login-admin-mobile", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Admin, false) })
		auth.POST("/register", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Register(ctx, appsession) })
		auth.POST("/resend-otp", func(ctx *gin.Context) { middleware.AttachOTPRateLimitMiddleware(ctx, appsession) }, func(ctx *gin.Context) { handlers.ResendOTP(ctx, appsession) })
		auth.POST("/verify-otp", func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, false, constants.Basic, true) })
		auth.POST("/verify-otp-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Basic, true) })
		auth.POST("/verify-otp-admin-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Admin, true) })
		auth.POST("/verify-otp-mobile-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Basic, false) })
		auth.POST("/verify-otp-mobile-admin-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Admin, false) })
		auth.POST("/logout", middleware.ProtectedRoute, func(ctx *gin.Context) { handlers.Logout(ctx) })
		// it's typically used by users who can't log in because they've forgotten their password.

		auth.POST("/reset-password", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ResetPassword(ctx, appsession) })
		auth.POST("/forgot-password", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ForgotPassword(ctx, appsession) })
		auth.POST("/verify-2fa", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyTwoFA(ctx, appsession) })
		auth.POST("/verify-otp-enable-2fa", middleware.UnProtectedRoute, func(ctx *gin.Context) {
			handlers.VerifyOTPAndEnable2FA(ctx, appsession)
		})
		auth.POST("/is-verified", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.IsEmailVerified(ctx, appsession) })
	}
}
