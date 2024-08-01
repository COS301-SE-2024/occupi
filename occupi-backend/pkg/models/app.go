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
	WebAuthn    *webauthn.WebAuthn
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
		WebAuthn:    configs.CreateWebAuthnInstance(),
	}
}

type WebAuthnUser struct {
	ID          []byte
	Name        string
	DisplayName string
	Credentials []webauthn.Credential
}

// WebAuthnCredentials implements webauthn.User.
func (u WebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	return u.Credentials
}

// WebAuthnDisplayName implements webauthn.User.
func (u WebAuthnUser) WebAuthnDisplayName() string {
	return u.DisplayName
}

// WebAuthnID implements webauthn.User.
func (u WebAuthnUser) WebAuthnID() []byte {
	return u.ID
}

// WebAuthnName implements webauthn.User.
func (u WebAuthnUser) WebAuthnName() string {
	return u.Name
}

func NewWebAuthnUser(id []byte, name, displayName string, credentials webauthn.Credential) WebAuthnUser {
	return WebAuthnUser{
		ID:          id,
		Name:        name,
		DisplayName: displayName,
		Credentials: []webauthn.Credential{credentials},
	}
}
