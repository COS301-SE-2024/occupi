package middleware

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"

	"github.com/gin-contrib/sessions"
)

// ProtectedRoute is a middleware that checks if
// the user has already been authenticated previously.
func ProtectedRoute(ctx *gin.Context) {
	tokenStr, err := ctx.Cookie("token")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"User not authorized",
				nil))
		ctx.Abort()
		return
	}

	claims, err := authenticator.ValidateToken(tokenStr)

	if err != nil {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"Invalid token",
				nil))
		ctx.Abort()
		return
	}

	// check if email and role session variables are set
	session := sessions.Default(ctx)
	if session.Get("email") == nil || session.Get("role") == nil {
		session.Set("email", claims.Email)
		session.Set("role", claims.Role)
		if err := session.Save(); err != nil {
			ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
			logrus.Error(err)
			ctx.Abort()
			return
		}
	}

	// check that session variables and token claims match
	if session.Get("email") != claims.Email || session.Get("role") != claims.Role {
		ctx.JSON(http.StatusUnauthorized,
			utils.ErrorResponse(
				http.StatusUnauthorized,
				"Bad Request",
				constants.InvalidAuthCode,
				"Inalid auth session",
				nil))
		ctx.Abort()
		return
	}

	ctx.Next()
}

// ProtectedRoute is a middleware that checks if
// the user has not been authenticated previously.
func UnProtectedRoute(ctx *gin.Context) {
	tokenStr, err := ctx.Cookie("token")
	if err == nil {
		_, err := authenticator.ValidateToken(tokenStr)

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
	}

	// check if email and role session variables are set
	session := sessions.Default(ctx)
	if session.Get("email") != nil || session.Get("role") != nil {
		session.Delete("email")
		session.Delete("role")
		if err := session.Save(); err != nil {
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
	session := sessions.Default(ctx)
	role := session.Get("role")
	if role != constants.Admin {
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

// MockAuthMiddleware simulates an authenticated user for testing purposes
func MockAuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		_, err := ctx.Cookie("token")
		if err == nil {
			// Simulate adding a user to the context
			ctx.Set("user", map[string]interface{}{
				"id":    "test-user-id",
				"email": "test@example.com",
				"role":  "user",
			})
		}
		ctx.Next()
	}
}
