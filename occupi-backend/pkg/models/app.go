package models

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/allegro/bigcache/v3"
	"github.com/centrifugal/gocent/v3"
	"github.com/gin-gonic/gin"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/ipinfo/go/v2/ipinfo"
	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/gomail.v2"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
)

// state management for the web app during runtime
type AppSession struct {
	DB           *mongo.Client
	Cache        *redis.Client
	OtpReqCache  *bigcache.BigCache
	IPInfo       *ipinfo.Client
	RabbitMQ     *amqp.Connection
	RabbitCh     *amqp.Channel
	RabbitQ      amqp.Queue
	WebAuthn     *webauthn.WebAuthn
	SessionCache *bigcache.BigCache
	Centrifugo   *gocent.Client
	Counter      *Counter
	MailConn     *gomail.Dialer
	AzureClient  *azblob.Client
	MobileCache  *redis.Client
	ExpoClient   *expo.PushClient
}

// constructor for app session
func New(db *mongo.Client, cache *redis.Client) *AppSession {
	conn := configs.CreateRabbitConnection()
	ch := configs.CreateRabbitChannel(conn)
	q := configs.CreateRabbitQueue(ch)
	centrifugo := configs.CreateCentrifugoClient()
	return &AppSession{
		DB:           db,
		Cache:        cache,
		OtpReqCache:  configs.CreateOTPRateLimitCache(),
		IPInfo:       configs.CreateIPInfoClient(),
		RabbitMQ:     conn,
		RabbitCh:     ch,
		RabbitQ:      q,
		WebAuthn:     configs.CreateWebAuthnInstance(),
		SessionCache: configs.CreateSessionCache(),
		Centrifugo:   centrifugo,
		MailConn:     configs.CreateMailServerConnection(),
		AzureClient:  configs.CreateAzureBlobClient(),
		Counter:      CreateCounter(centrifugo),
		MobileCache:  configs.CreateMobileCache(),
		ExpoClient:   expo.NewPushClient(nil),
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

// Counter struct to manage the counter value
type Counter struct {
	mu     sync.Mutex
	value  int
	client *gocent.Client
}

// increment increases the counter by 1 and publishes the change
func (c *Counter) Increment(ctx *gin.Context) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value++
	return c.publishToCentrifugo(ctx, "occupi-counter", c.value)
}

// decrement decreases the counter by 1 and publishes the change
// Decrement decrements the counter but ensures it doesn't go below zero and publishes the value to Centrifugo.
func (c *Counter) Decrement(ctx *gin.Context) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.value > 0 {
		c.value--
	} else {
		c.value = 0
	}
	return c.publishToCentrifugo(ctx, "occupi-counter", c.value)
}

// publishToCentrifugo publishes the updated counter value to a Centrifugo channel
func (c *Counter) publishToCentrifugo(ctx *gin.Context, channel string, value int) error {
	data := map[string]interface{}{
		"counter": value,
	}
	// Marshal the data into JSON format
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data for Centrifugo: %w", err)
	}
	_, err = c.client.Publish(ctx, channel, jsonData)
	if err != nil {
		return fmt.Errorf("failed to publish to Centrifugo: %w", err)
	}

	return nil
}

func (c *Counter) GetCounterValue() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.value
}

func CreateCounter(client *gocent.Client) *Counter {
	if client == nil {
		logrus.Fatal("Centrifugo client is nil")
		panic("Centrifugo client is nil")
	}
	return &Counter{
		mu:     sync.Mutex{},
		value:  0,
		client: client,
	}
}
