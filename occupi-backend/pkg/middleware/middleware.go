package middleware

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

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
	_, err := appsession.OtpReqCache.Get(utils.GetClientIP(ctx))

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
	err = appsession.OtpReqCache.Set(utils.GetClientIP(ctx), []byte("sent"))
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

// TimezoneMiddleware is a middleware that sets the timezone for the request.
func TimezoneMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		timezone := ctx.GetHeader("X-Timezone")
		if timezone == "" {
			timezone = "UTC" // Default to UTC if no timezone is provided
		}

		loc, err := time.LoadLocation(timezone)
		if err != nil {
			ctx.JSON(http.StatusBadRequest,
				utils.ErrorResponse(
					http.StatusBadRequest,
					"Bad Request",
					constants.BadRequestCode,
					"Invalid timezone",
					nil))
			ctx.Abort()
			return
		}

		// Store the location in the context
		ctx.Set("timezone", loc)
		ctx.Next()
	}
}

func RealIPMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Check headers set by Cloudflare and Nginx
		ip := ctx.GetHeader("CF-Connecting-IP")
		if ip == "" {
			ip = ctx.GetHeader("X-Real-IP")
		}
		if ip == "" {
			ip = ctx.GetHeader("X-Forwarded-For")
			if ip != "" {
				// X-Forwarded-For may contain a list of IPs
				ips := strings.Split(ip, ",")
				ip = strings.TrimSpace(ips[0])
			}
		}
		if ip == "" {
			ip, _, _ = net.SplitHostPort(ctx.Request.RemoteAddr)
		}
		ctx.Set("ClientIP", ip)
		ctx.Next()
	}
}

// LimitRequestBodySize middleware to limit the size of the request body
func LimitRequestBodySize(maxSize int64) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Request.Body = http.MaxBytesReader(ctx.Writer, ctx.Request.Body, maxSize)
		if err := ctx.Request.ParseMultipartForm(maxSize); err != nil {
			ctx.JSON(http.StatusRequestEntityTooLarge, utils.ErrorResponse(
				http.StatusRequestEntityTooLarge,
				"Request Entity Too Large",
				constants.RequestEntityTooLargeCode,
				fmt.Sprintf("Request body too large by %d bytes, max %d bytes", ctx.Request.ContentLength-maxSize, maxSize),
				nil,
			),
			)
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}
