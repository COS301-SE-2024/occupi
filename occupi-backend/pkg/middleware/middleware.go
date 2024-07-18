package middleware

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

// ProtectedRoute is a middleware that checks if
// the user has already been authenticated previously.
func ProtectedRoute(ctx *gin.Context) {
	claims, err := utils.GetClaimsFromCTX(ctx)

	if err != nil {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"User not authorized or Invalid auth token",
				nil))
		ctx.Abort()
		return
	}

	// check if email and role session variables are set
	if !utils.IsSessionSet(ctx) {
		err := utils.SetSession(ctx, claims)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
			ctx.Abort()
			return
		}
	}

	// check that session variables and token claims match
	if !utils.CompareSessionAndClaims(ctx, claims) {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"Invalid auth session",
				nil))
		ctx.Abort()
		return
	}

	ctx.Next()
}

// ProtectedRoute is a middleware that checks if
// the user has not been authenticated previously.
func UnProtectedRoute(ctx *gin.Context) {
	_, err := utils.GetClaimsFromCTX(ctx)
	if err == nil {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"User already authorized",
				nil))
		ctx.Abort()
		return
	}

	// check if email and role session variables are set
	if utils.IsSessionSet(ctx) {
		err := utils.ClearSession(ctx)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
			ctx.Abort()
			return
		}
	}

	ctx.Next()
}

// AdminRoute is a middleware that checks if
// the user has the admin role.
func AdminRoute(ctx *gin.Context) {
	claims, err := utils.GetClaimsFromCTX(ctx)
	if err != nil || claims.Role != constants.Admin {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"User not authorized to access admin route",
				nil))
		ctx.Abort()
		return
	}

	ctx.Next()
}

// Rate limit otp verification requests to 1 requests per minute
func AttachOTPRateLimitMiddleware(ctx *gin.Context, appsession *models.AppSession) {
	// Check if the user has already sent an OTP request
	_, err := appsession.OtpReqCache.Get(ctx.ClientIP())

	if err == nil {
		ctx.JSON(http.StatusTooManyRequests,
			utils.ErrorResponse(
				http.StatusTooManyRequests,
				"Too Many Requests",
				constants.RateLimitCode,
				"Too many requests",
				nil))
		ctx.Abort()
		return
	}

	// Add the user's IP address to the cache
	err = appsession.OtpReqCache.Set(ctx.ClientIP(), []byte("sent"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		logrus.Error(err)
		ctx.Abort()
		return
	}
}

// AttachRateLimitMiddleware attaches the rate limit middleware to the router.
func AttachRateLimitMiddleware(ginRouter *gin.Engine) {
	// Define a rate limit: 5 requests per second
	rate, _ := limiter.NewRateFromFormatted("5-S")

	store := memory.NewStore()
	instance := limiter.New(store, rate)

	// Create the rate limiting middleware
	middleware := mgin.NewMiddleware(instance)

	// Apply the middleware to the router
	ginRouter.Use(middleware)
}
