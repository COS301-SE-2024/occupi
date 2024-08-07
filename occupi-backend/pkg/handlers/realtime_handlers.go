package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sync"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/centrifugal/gocent/v3"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

var (
	counter int
	mu      sync.Mutex
)

// Enter handles the check-in request
func Enter(ctx *gin.Context, appsession *models.AppSession) {
	mu.Lock()
	defer mu.Unlock()
	counter++
	uuid, err := publishCounter(ctx, appsession)
	if err != nil {
		logrus.WithError(err).Error("error publishing message")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Counter incremented", gin.H{"counter": counter, "uuid": uuid}))
}

// Exit handles the exit request
func Exit(ctx *gin.Context, appsession *models.AppSession) {
	mu.Lock()
	defer mu.Unlock()
	if counter > 0 {
		counter--
	}
	uuid, err := publishCounter(ctx, appsession)
	if err != nil {
		logrus.WithError(err).Error("error publishing message")
		ctx.JSON(http.StatusInternalServerError, utils.InternalServerError())
		return
	}

	ctx.JSON(http.StatusOK, utils.SuccessResponse(http.StatusOK, "Counter Decremented", gin.H{"counter": counter, "uuid": uuid}))
}

// publishCounter publishes the current counter value to Centrifugo
func publishCounter(ctx *gin.Context, appsession *models.AppSession) (string, error) {
	uuid := utils.GenerateUUID()
	data := models.CentrigoCounterNode{
		UUID:    uuid,
		Count:   counter,
		Message: fmt.Sprintf("Counter is now at %d", counter),
	}

	jsonData, _ := json.Marshal(data)
	_, err := appsession.Centrifugo.Publish(ctx, "public:counter", jsonData)
	if err != nil {
		return "", fmt.Errorf("error publishing message: %v", err)
	}
	return uuid, nil
}

// readCounter reads the current counter value from Centrifugo currently unused but will be used in the future
func ReadCounter(ctx *gin.Context, appsession *models.AppSession, targetUUID string) (*models.CentrigoCounterNode, error) {
	historyResult, err := appsession.Centrifugo.History(ctx, "public:counter")
	if err != nil {
		return nil, fmt.Errorf("error reading message: %v", err)
	}

	// Check if there are any publications
	if len(historyResult.Publications) == 0 {
		return nil, errors.New("no publications found")
	}

	// Find the publication with the matching UUID
	var selectedPublication gocent.Publication
	found := false
	for _, pub := range historyResult.Publications {
		var counterData models.CentrigoCounterNode
		if err := json.Unmarshal(pub.Data, &counterData); err != nil {
			return nil, fmt.Errorf("error unmarshalling data: %v", err)
		}
		if counterData.UUID == targetUUID {
			selectedPublication = pub
			found = true
			break
		}
	}

	if !found {
		return nil, fmt.Errorf("no publication found with UUID: %s", targetUUID)
	}

	// Access the data of the selected publication
	messageData := selectedPublication.Data

	var counterData models.CentrigoCounterNode
	if err := json.Unmarshal(messageData, &counterData); err != nil {
		return nil, fmt.Errorf("error unmarshalling data: %v", err)
	}

	return &counterData, nil
}
