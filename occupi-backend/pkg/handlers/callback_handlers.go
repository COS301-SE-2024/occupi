package handlers

import (
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Handler for our callback.
func CallbackHandler(c *gin.Context, appsession *models.AppSession) {
	session := sessions.Default(c)
	if c.Query("state") != session.Get("state") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		logrus.Error("Invalid state parameter.")
		return
	}

	// Exchange an authorization code for a token.
	token, err := appsession.Authenticator.Exchange(c.Request.Context(), c.Query("code"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	idToken, err := appsession.Authenticator.VerifyIDToken(c.Request.Context(), token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify ID Token."})
		logrus.Error(err)
		return
	}

	var profile map[string]interface{}
	if err := idToken.Claims(&profile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal ID Token."})
		logrus.Error(err)
		return
	}

	session.Set("access_token", token.AccessToken)
	session.Set("profile", profile)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		logrus.Error(err)
		return
	}

	// Redirect to logged in page.
	c.Redirect(http.StatusTemporaryRedirect, "/api/resource-auth")
}
