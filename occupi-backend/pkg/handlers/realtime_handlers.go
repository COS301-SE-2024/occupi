package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/centrifugal/gocent/v3"
	"github.com/gin-gonic/gin"
)

var (
	counter int
	mu      sync.Mutex
	client  *gocent.Client
)

// Initialize the Centrifugo client
func init() {
	client = gocent.New(gocent.Config{
		Addr: "http://localhost:8000/api",            // Replace with your Centrifugo API address
		Key:  "c336846e-9e4f-4614-8fb7-a85a47e214b3", // Replace with your Centrifugo API key
	})
}

// Enter handles the check-in request
func Enter(ctx *gin.Context, appsession *models.AppSession) {
	mu.Lock()
	defer mu.Unlock()
	counter++
	if err := publishCounter(ctx); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"counter": counter})
}

// Exit handles the exit request
func Exit(ctx *gin.Context, appsession *models.AppSession) {
	mu.Lock()
	defer mu.Unlock()
	if counter > 0 {
		counter--
	}
	if err := publishCounter(ctx); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"counter": counter})
}

// publishCounter publishes the current counter value to Centrifugo
func publishCounter(ctx *gin.Context) error {
	data := map[string]int{"counter": counter}
	jsonData, _ := json.Marshal(data)
	_, err := client.Publish(ctx, "public:counter", jsonData)
	if err != nil {
		return fmt.Errorf("error publishing message: %v", err)
	}
	return nil
}
