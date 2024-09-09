package handlers

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/go-resty/resty/v2"
)

// NewRocketChatClient initializes a new RocketChat client
func NewRocketChatClient(serverURL, username, password string) *models.RocketChatClient {
	client := resty.New()
	return &models.RocketChatClient{
		client:    client,
		serverURL: serverURL,
		username:  username,
		password:  password,
		counter:   0,
	}
}
