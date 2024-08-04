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
		Key:  "151e30af-ed0b-4234-b57a-1e9b94a2ffbe", // Replace with your Centrifugo API key
	})
}

// CheckIn handles the check-in request
func Enter(ctx *gin.Context, appsession *models.AppSession) {
	mu.Lock()
	defer mu.Unlock()
	counter++
	publishCounter(ctx)
	ctx.JSON(http.StatusOK, gin.H{"counter": counter})
}

// Exit handles the exit request
func Exit(ctx *gin.Context, appsession *models.AppSession) {
	mu.Lock()
	defer mu.Unlock()
	if counter > 0 {
		counter--
	}
	publishCounter(ctx)
	ctx.JSON(http.StatusOK, gin.H{"counter": counter})
}

// publishCounter publishes the current counter value to Centrifugo
func publishCounter(ctx *gin.Context) {
	data := map[string]int{"counter": counter}
	jsonData, _ := json.Marshal(data)
	_, err := client.Publish(ctx, "public:counter", jsonData)
	if err != nil {
		fmt.Printf("error publishing message: %v\n", err)
	}
}
