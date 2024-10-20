package router

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"

	"github.com/gin-gonic/gin"
)

// creates available endpoints and attaches handlers for each endpoint

func OccupiRouter(router *gin.Engine, appsession *models.AppSession) {
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
		pingAuth.GET("", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.PingHandlerAuth(ctx) })
	}
	pingAdmin := router.Group("/ping-admin")
	{
		pingAdmin.GET("", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.PingHandlerAdmin(ctx) })
	}
	api := router.Group("/api")
	{
		// resource-auth serves as an example for adding authentication to a route, remove when not needed
		api.GET("/resource-auth", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.FetchResourceAuth(ctx, appsession) })
		// resource-auth-admin serves as an example for adding authentication as well as protecting admin routes, remove when not needed
		api.GET("/resource-auth-admin", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.FetchResourceAuth(ctx, appsession) })
		api.POST("/book-room", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.BookRoom(ctx, appsession) })
		api.POST("/check-in", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.CheckIn(ctx, appsession) })
		api.POST("/cancel-booking", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.CancelBooking(ctx, appsession) })
		api.GET("/view-bookings", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.FilterCollection(ctx, appsession, "RoomBooking") })
		api.GET("/view-rooms", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.FilterCollection(ctx, appsession, "Rooms") })
		api.GET("/user-details", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetUserDetails(ctx, appsession) })
		api.POST("/update-user", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.UpdateUserDetails(ctx, appsession) })
		api.GET("/get-users", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.FilterCollection(ctx, appsession, "Users") })
		api.GET("/get-push-tokens", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetPushTokens(ctx, appsession) })
		api.GET("/get-notifications", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.FilterCollection(ctx, appsession, "Notifications") })
		api.DELETE("/delete-notification", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.DeleteNotification(ctx, appsession) })
		api.POST("/update-security-settings", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.UpdateSecuritySettings(ctx, appsession) })
		api.GET("/update-notification-settings", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.UpdateNotificationSettings(ctx, appsession) })
		api.GET("/get-security-settings", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetSecuritySettings(ctx, appsession) })
		api.GET("/get-notification-settings", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetNotificationSettings(ctx, appsession) })
		// limit request body size to 16MB when uploading profile image due to mongoDB document size limit
		api.POST("/upload-profile-image", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.LimitRequestBodySize(16<<20), func(ctx *gin.Context) { handlers.UploadProfileImage(ctx, appsession) })
		api.GET("/download-profile-image", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.DownloadProfileImage(ctx, appsession) })
		api.DELETE("/delete-profile-image", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.DeleteProfileImage(ctx, appsession) })
		api.GET("/image/:id", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.DownloadRoomImage(ctx, appsession) })
		api.POST("/upload-room-image", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, middleware.LimitRequestBodySize(16<<20), func(ctx *gin.Context) { handlers.UploadRoomImage(ctx, appsession) })
		api.DELETE("/delete-room-image", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.DeleteRoomImage(ctx, appsession) })
		api.PUT("/add-room", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.AddRoom(ctx, appsession) })
		api.GET("/available-slots", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAvailableSlots(ctx, appsession) })
		api.PUT("/toggle-onsite", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.BlockAfterHours(), func(ctx *gin.Context) { handlers.ToggleOnsite(ctx, appsession) })
		api.POST("/create-user", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.CreateUser(ctx, appsession) })
		api.GET("/get-ip-info", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.GetIPInfo(ctx, appsession) })
		api.POST("/add-ip", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.AddIP(ctx, appsession) })
		api.DELETE("/remove-ip", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.RemoveIP(ctx, appsession) })
		api.PUT("/toggle-allow-anonymous-ip", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.ToggleAllowAnonymousIP(ctx, appsession) })
		api.PUT("/toggle-admin-status", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.ToggleAdminStatus(ctx, appsession) })
		api.PUT("/notify-report-download", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.SendDownloadReportNotification(ctx, appsession) })
		api.GET("/get-notifications-count", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetNotificationCount(ctx, appsession) })
		api.GET("/get-users-locations", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.GetUsersLocations(ctx, appsession, "whitelist") })
		api.GET("/get-blacklist", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, middleware.AdminRoute, func(ctx *gin.Context) { handlers.GetUsersLocations(ctx, appsession, "blacklist") })
	}
	analytics := router.Group("/analytics")
	{
		analytics.GET("/user-hours", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "hoursbyday", false) })
		analytics.GET("/user-average-hours", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "hoursbyweekday", false) })
		analytics.GET("/user-work-ratio", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "ratio", false) })
		analytics.GET("/user-peak-office-hours", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "peakhours", false) })
		analytics.GET("/user-arrival-departure-average", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "arrivaldeparture", false) })
		analytics.GET("/user-in-office", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "inofficehours", false) })

		analytics.GET("/most-active-employee", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "most", true) })
		analytics.GET("/least-active-employee", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "least", true) })
		analytics.GET("/hours", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "hoursbyday", true) })
		analytics.GET("/average-hours", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "hoursbyweekday", true) })
		analytics.GET("/work-ratio", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "ratio", true) })
		analytics.GET("/peak-office-hours", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "peakhours", true) })
		analytics.GET("/arrival-departure-average", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "arrivaldeparture", true) })
		analytics.GET("/in-office", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnHours(ctx, appsession, "inofficehours", true) })

		analytics.GET("/top-bookings", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnBookings(ctx, appsession, "top3") })
		analytics.GET("/bookings-historical", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnBookings(ctx, appsession, "historical") })
		analytics.GET("/bookings-current", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetAnalyticsOnBookings(ctx, appsession, "upcoming") })
	}
	auth := router.Group("/auth")
	{
		auth.POST("/login-admin-begin", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.BeginLoginAdmin(ctx, appsession) })
		auth.POST("/login-admin-finish/:id", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.FinishLoginAdmin(ctx, appsession, constants.Admin, true) })
		auth.POST("/register-admin-begin", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.BeginRegistrationAdmin(ctx, appsession) })
		auth.POST("/register-admin-finish/:id", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.FinishRegistrationAdmin(ctx, appsession, constants.Admin, true) })

		auth.POST("/login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Basic, true) })
		auth.POST("/login-admin", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Admin, true) })
		auth.POST("/login-mobile", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Basic, false) })
		auth.POST("/login-admin-mobile", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Login(ctx, appsession, constants.Admin, false) })
		auth.POST("/register", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.Register(ctx, appsession) })
		auth.POST("/resend-otp", func(ctx *gin.Context) { middleware.AttachOTPRateLimitMiddleware(ctx, appsession) }, func(ctx *gin.Context) { handlers.ResendOTP(ctx, appsession, constants.ReverifyEmail) })
		auth.POST("/verify-otp", func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, false, constants.Basic, true) })
		auth.POST("/verify-otp-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Basic, true) })
		auth.POST("/verify-otp-admin-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Admin, true) })
		auth.POST("/verify-otp-mobile-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Basic, false) })
		auth.POST("/verify-otp-mobile-admin-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyOTP(ctx, appsession, true, constants.Admin, false) })
		auth.POST("/logout", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.Logout(ctx, appsession) })
		// it's typically used by users who can't log in because they've forgotten their password.

		auth.POST("/reset-password-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ResetPassword(ctx, appsession, constants.Basic, true) })
		auth.POST("/reset-password-admin-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ResetPassword(ctx, appsession, constants.Admin, true) })
		auth.POST("/reset-password-mobile-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ResetPassword(ctx, appsession, constants.Basic, false) })
		auth.POST("/reset-password-mobile-admin-login", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ResetPassword(ctx, appsession, constants.Admin, false) })
		auth.POST("/forgot-password", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.ResendOTP(ctx, appsession, constants.ResetPassword) })
		auth.POST("/verify-2fa", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.VerifyTwoFA(ctx, appsession) })
		auth.POST("/verify-otp-enable-2fa", middleware.UnProtectedRoute, func(ctx *gin.Context) {
			handlers.VerifyOTPAndEnable2FA(ctx, appsession)
		})
		auth.POST("/is-verified", middleware.UnProtectedRoute, func(ctx *gin.Context) { handlers.IsEmailVerified(ctx, appsession) })
	}
	rtc := router.Group("/rtc")
	{
		rtc.GET("/enter", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.Enter(ctx, appsession) })
		rtc.GET("/exit", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.Exit(ctx, appsession) })
		rtc.GET("/get-token", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetRTCToken(ctx, appsession) })
		rtc.GET("/current-count", middleware.ProtectedRoute, func(ctx *gin.Context) { middleware.VerifyMobileUser(ctx, appsession) }, func(ctx *gin.Context) { handlers.GetCurrentCount(ctx, appsession) })
	}
}
