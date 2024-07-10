package models

import (
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/allegro/bigcache/v3"
)

// state management for the web app during runtime
type AppSession struct {
	DB          *mongo.Client
	Cache       *bigcache.BigCache
	EmailsSent  int
	CurrentDate time.Time
	OtpReqCache *bigcache.BigCache
}

// constructor for app session
func New(db *mongo.Client, cache *bigcache.BigCache) *AppSession {
	return &AppSession{
		DB:          db,
		Cache:       cache,
		EmailsSent:  0,
		CurrentDate: time.Now(),
		OtpReqCache: configs.CreateOTPRateLimitCache(),
	}
}
