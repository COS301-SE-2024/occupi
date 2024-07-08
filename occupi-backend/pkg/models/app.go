package models

import (
	"github.com/allegro/bigcache/v3"
	"go.mongodb.org/mongo-driver/mongo"
)

// state management for the web app during runtime
type AppSession struct {
	DB    *mongo.Client
	Cache *bigcache.BigCache
}

// constructor for app session
func New(db *mongo.Client, cache *bigcache.BigCache) *AppSession {
	return &AppSession{
		DB:    db,
		Cache: cache,
	}
}
