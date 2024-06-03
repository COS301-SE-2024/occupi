package middleware

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// ProtectedRoute is a middleware that checks if
// the user has already been authenticated previously.
func ProtectedRoute(c *gin.Context) {
	if sessions.Default(c).Get("profile") == nil {
		// If the user is not authenticated, return a 401 Unauthorized response
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  http.StatusUnauthorized,
			"message": "Bad Request",
			"error":   "User not authenticated",
		})
		//Add the following so that the next() doesn't get called
		c.Abort()
		return
	} else {
		c.Next()
	}
}

// ProtectedRoute is a middleware that checks if
// the user has not been authenticated previously.
func UnProtectedRoute(c *gin.Context) {
	if sessions.Default(c).Get("profile") != nil {
		// If the user is authenticated, return a 401 Unauthorized response
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  http.StatusUnauthorized,
			"message": "Bad Request",
			"error":   "User already authenticated",
		})
		//Add the following so that the next() doesn't get called
		c.Abort()
		return
	} else {
		c.Next()
	}
}
