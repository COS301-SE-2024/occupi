package middleware

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

// IsAuthenticated is a middleware that checks if
// the user has already been authenticated previously.
func IsAuthenticated(c *gin.Context) {
	if sessions.Default(c).Get("profile") == nil {
		c.Redirect(http.StatusSeeOther, "/")
	} else {
		c.Next()
	}
}
