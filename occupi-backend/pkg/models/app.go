package models

import (
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/ipinfo/go/v2/ipinfo"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
)

// state management for the web app during runtime
type AppSession struct {
	DB          *mongo.Client
	Cache       *bigcache.BigCache
	EmailsSent  int
	CurrentDate time.Time
	OtpReqCache *bigcache.BigCache
	IPInfo      *ipinfo.Client
	RabbitMQ    *amqp.Connection
	RabbitCh    *amqp.Channel
	RabbitQ     amqp.Queue
	webAuthn    *webauthn.WebAuthn
}

// constructor for app session
func New(db *mongo.Client, cache *bigcache.BigCache) *AppSession {
	conn := configs.CreateRabbitConnection()
	ch := configs.CreateRabbitChannel(conn)
	q := configs.CreateRabbitQueue(ch)
	return &AppSession{
		DB:          db,
		Cache:       cache,
		EmailsSent:  0,
		CurrentDate: time.Now(),
		OtpReqCache: configs.CreateOTPRateLimitCache(),
		IPInfo:      configs.CreateIPInfoClient(),
		RabbitMQ:    conn,
		RabbitCh:    ch,
		RabbitQ:     q,
		webAuthn:    configs.CreateWebAuthnInstance(),
	}
}
