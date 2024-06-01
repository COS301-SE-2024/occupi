package models

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"go.mongodb.org/mongo-driver/mongo"
)

type AppSession struct {
	Authenticator *authenticator.Authenticator
	DB            *mongo.Client
}

func New(authenticator *authenticator.Authenticator, db *mongo.Client) *AppSession {
	return &AppSession{
		Authenticator: authenticator,
		DB:            db,
	}
}
