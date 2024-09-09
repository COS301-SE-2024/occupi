package handlers

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/centrifugal/gocent"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/golang-jwt/jwt/v4"
)

func generateToken(expirationMinutes int) (string, error) {
	// Define the secret key used to sign the token
	// var secretKey = []byte("UtMy3+ZaGa5cJ2cnZSrHsBWlifuBdg6f5qRfSOUdaQY=")
	var secretKey = configs.GetCentrifugoSecret()

	// Define the token claims
	claims := jwt.MapClaims{
		"sub": "1",                                                                   // Subject: the user this token belongs to
		"exp": time.Now().Add(time.Minute * time.Duration(expirationMinutes)).Unix(), // Expiration time
		"iat": time.Now().Unix(),                                                     // Issued at time
		"nbf": time.Now().Unix(),                                                     // Not before time                                                  // Issuer: identifies the principal that issued the JWT
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
func GetRTCToken(ctx *gin.Context) {
	// Generate a token with an expiration time of 60 minutes
	token, err := generateToken(60)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return the generated token in the response
	ctx.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Token generated",
		"token":   token,
	})
}

// Counter struct to manage the counter value
type Counter struct {
	mu     sync.Mutex
	value  int
	client *gocent.Client
}

// NewCounter initializes a new Counter with a REST client
func NewCounter() *Counter {
	return &Counter{
		value:  0,
		client: resty.New(),
	}
}

// increment increases the counter by 1 and publishes the change
func (c *Counter) increment() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value++
	return c.publishToCentrifugo("occupi-counter", c.value)
}

// decrement decreases the counter by 1 and publishes the change
func (c *Counter) decrement() error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value--
	return c.publishToCentrifugo("occupi-counter", c.value)
}

// publishToCentrifugo publishes the updated counter value to a Centrifugo channel
func (c *Counter) publishToCentrifugo(channel string, value int) error {
	centrifugoURL := "http://localhost:8001/api"     // Replace with your Centrifugo server URL
	apiKey := "85e9930f-e85c-4a64-bd53-40458e6d0ced" // Replace with your Centrifugo API key

	// Prepare the request body
	body := map[string]interface{}{
		"method": "publish",
		"params": map[string]interface{}{
			"channel": channel,
			"data": map[string]interface{}{
				"counter": value,
			},
		},
	}

	// Send the request to Centrifugo
	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("Authorization", "apikey "+apiKey).
		SetBody(body).
		Post(centrifugoURL)

	if err != nil {
		return fmt.Errorf("failed to publish to Centrifugo: %w", err)
	}

	if resp.StatusCode() != http.StatusOK {
		return fmt.Errorf("unexpected status code from Centrifugo: %d", resp.StatusCode())
	}

	return nil
}

// IncrementHandler is a Gin handler to increment the counter
func Enter(ctx *gin.Context, counter *Counter) {
	if err := counter.increment(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to increment counter", "details": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Counter incremented", "counter": counter.value})
}

// DecrementHandler is a Gin handler to decrement the counter
func Exit(ctx *gin.Context, counter *Counter) {
	if err := counter.decrement(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrement counter", "details": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Counter decremented", "counter": counter.value})
}
