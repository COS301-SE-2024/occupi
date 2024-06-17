package models

import (
	"go.mongodb.org/mongo-driver/mongo"
)

// state management for the web app during runtime
type AppSession struct {
	DB *mongo.Client
}

// constructor for app session
func New(db *mongo.Client) *AppSession {
	return &AppSession{
		DB: db,
	}
}
