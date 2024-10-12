package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func generateToken(expirationMinutes int) (string, error) {
	// Define the secret key used to sign the token
	var secretKey = []byte(configs.GetCentrifugoSecret())

	// Define the token claims
	claims := jwt.MapClaims{
		"sub": "1",                                                                                  // Subject: the user this token belongs to
		"exp": time.Now().In(time.Local).Add(time.Minute * time.Duration(expirationMinutes)).Unix(), // Expiration time
		"iat": time.Now().In(time.Local).Unix(),                                                     // Issued at time
		"nbf": time.Now().In(time.Local).Unix(),                                                     // Not before time                                                  // Issuer: identifies the principal that issued the JWT
	}

	// Create the token using the HS256 signing method and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// getRTCToken is a Gin handler that generates a JWT token and returns it in the response
func GetRTCToken(ctx *gin.Context, app *models.AppSession) {
	// Generate a token with an expiration time of 60 minutes
	token, err := generateToken(1440)
	if err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Token generation failed", constants.InternalServerErrorCode, "Failed to generate token", nil))
		return
	}
	ctx.SetCookie(
		"rtc_token", // Cookie name
		token,       // Cookie value (the JWT token)
		86400,       // Max age in seconds (60 minutes)
		"/",         // Path
		"",          // Domain (leave empty for default)
		true,        // Secure (true if serving over HTTPS)
		false,       // HttpOnly (false to allow JavaScript access)
	)

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Token generated successfully", token))
}

// IncrementHandler is a Gin handler to increment the counter
func Enter(ctx *gin.Context, app *models.AppSession) {
	if err := app.Counter.Increment(ctx); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Increment failed", constants.InternalServerErrorCode, "Failed to increment", nil))
		return
	}
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Counter incremented", app.Counter.GetCounterValue()))
}

// DecrementHandler is a Gin handler to decrement the counter
func Exit(ctx *gin.Context, app *models.AppSession) {
	if err := app.Counter.Decrement(ctx); err != nil {
		configs.CaptureError(ctx, err)
		ctx.JSON(http.StatusInternalServerError, utils.ErrorResponse(http.StatusInternalServerError, "Decrement failed", constants.InternalServerErrorCode, "Failed to decrement", nil))
		return
	}
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Counter decremented", app.Counter.GetCounterValue()))
}

func GetCurrentCount(ctx *gin.Context, app *models.AppSession) {
	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Current count", app.Counter.GetCounterValue()))
}
