package models

import (
	"time"

	"github.com/allegro/bigcache/v3"
	"go.mongodb.org/mongo-driver/mongo"
)

// state management for the web app during runtime
type AppSession struct {
	DB          *mongo.Client
	Cache       *bigcache.BigCache
	EmailsSent  int
	CurrentDate time.Time
}

// constructor for app session
func New(db *mongo.Client, cache *bigcache.BigCache) *AppSession {
	return &AppSession{
		DB:          db,
		Cache:       cache,
		EmailsSent:  0,
		CurrentDate: time.Now(),
	}
}
