package models

import (
	"sync"

	"github.com/go-resty/resty/v2"
)

// Counter struct to hold the counter value and manage connections
type RocketChatClient struct {
	client     *resty.Client
	serverURL  string
	username   string
	password   string
	userID     string
	authToken  string
	counter    int
	counterMux sync.Mutex
}
