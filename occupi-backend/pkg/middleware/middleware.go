package middleware

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// IsAuthenticated is a middleware that checks if
// the user has already been authenticated previously.
func ProtectedRoute(c *gin.Context) {
	if sessions.Default(c).Get("profile") == nil {
		// If the user is not authenticated, return a 401 Unauthorized response
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  http.StatusUnauthorized,
			"message": "Bad Request",
			"error":   "User not authenticated",
		})
	} else {
		c.Next()
	}
}

func UnProtectedRoute(c *gin.Context) {
	if sessions.Default(c).Get("profile") != nil {
		// If the user is authenticated, return a 401 Unauthorized response
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  http.StatusUnauthorized,
			"message": "Bad Request",
			"error":   "User already authenticated",
		})
	} else {
		c.Next()
	}
}
