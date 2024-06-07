package middleware

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

// ProtectedRoute is a middleware that checks if
// the user has already been authenticated previously.
func ProtectedRoute(ctx *gin.Context) {
	if sessions.Default(ctx).Get("profile") == nil {
		// If the user is not authenticated, return a 401 Unauthorized response
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"status":  http.StatusUnauthorized,
			"message": "Bad Request",
			"error":   "User not authenticated",
		})
		//Add the following so that the next() doesn't get called
		c.Abort()
		return
	} else {
		ctx.Next()
	}
}

// ProtectedRoute is a middleware that checks if
// the user has not been authenticated previously.
func UnProtectedRoute(ctx *gin.Context) {
	if sessions.Default(ctx).Get("profile") != nil {
		// If the user is authenticated, return a 401 Unauthorized response
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"status":  http.StatusUnauthorized,
			"message": "Bad Request",
			"error":   "User already authenticated",
		})
		//Add the following so that the next() doesn't get called
		c.Abort()
		return
	} else {
		ctx.Next()
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
