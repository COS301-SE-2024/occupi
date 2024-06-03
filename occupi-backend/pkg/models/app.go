package models

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"go.mongodb.org/mongo-driver/mongo"
)

// state management for the web app during runtime
type AppSession struct {
	Authenticator *authenticator.Authenticator
	DB            *mongo.Client
}

// constructor for app session
func New(authenticator *authenticator.Authenticator, db *mongo.Client) *AppSession {
	return &AppSession{
		Authenticator: authenticator,
		DB:            db,
	}
}
