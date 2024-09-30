package configs

import (
	"net"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
	"github.com/allegro/bigcache/v3"
	"github.com/centrifugal/gocent/v3"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/ipinfo/go/v2/ipinfo/cache"
	"github.com/redis/go-redis/v9"
	"gopkg.in/gomail.v2"

	"context"
	"fmt"
	"net/url"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// attempts to and establishes a connection with the remote mongodb database
func ConnectToDatabase(args ...string) *mongo.Client {
	// MongoDB connection parameters
	username := GetMongoDBUsername()
	password := GetMongoDBPassword()
	clusterURI := GetMongoDBCLUSTERURI()
	dbName := GetMongoDBName()
	mongoDBStartURI := GetMongoDBStartURI()

	// Escape the special characters in the password
	escapedPassword := url.QueryEscape(password)

	// Construct the connection URI
	var uri string
	if len(args) > 0 {
		uri = fmt.Sprintf("%s://%s:%s@%s/%s?%s", mongoDBStartURI, username, escapedPassword, clusterURI, dbName, args[0])
	} else {
		uri = fmt.Sprintf("%s://%s:%s@%s/%s", mongoDBStartURI, username, escapedPassword, clusterURI, dbName)
	}

	// Set client options
	clientOptions := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		fmt.Printf("Failed to connect to MongoDB: %s\n", err)
		logrus.Fatal(err)
		errv := client.Disconnect(ctx)
		logrus.Fatal(errv)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		fmt.Printf("Failed to connect to MongoDB: %s\n", err)
		logrus.Fatal(err)
		errv := client.Disconnect(ctx)
		logrus.Fatal(errv)
	}

	fmt.Println("Connected to MongoDB")
	logrus.Info("Connected to MongoDB!")

	return client
}

// Create cache
func CreateCache() *redis.Client {
	if GetEnv() == "devlocalhost" || GetEnv() == "devdeployed" || GetEnv() == "devlocalhostdocker" {
		fmt.Printf("Cache is disabled in %s mode\n", GetEnv())
		logrus.Printf("Cache is disabled in %s mode\n", GetEnv())
		return nil
	}

	redisPassword := GetRedisPassword()
	redisHost := GetRedisHost()
	redisPort := GetRedisPort()

	url := fmt.Sprintf("redis://:%s@%s:%s/0?protocol=3", redisPassword, redisHost, redisPort)
	opts, err := redis.ParseURL(url)
	if err != nil {
		fmt.Println(err)
		logrus.Fatal(err)
	}

	client := redis.NewClient(opts)

	// Test connection
	err = client.Ping(context.Background()).Err()
	if err != nil {
		fmt.Println("could not connect to Redis: ", err)
		logrus.Fatalf("could not connect to Redis: %v", err)
	}

	fmt.Println("Cache created!")
	logrus.Info("Cache created!")

	return client
}

// Create mobile link cache
func CreateMobileCache() *redis.Client {
	return nil
	/*redisPassword := GetRedisPassword()
	redisHost := GetRedisHost()
	redisPort := GetRedisPort()

	url := fmt.Sprintf("redis://:%s@%s:%s/0?protocol=3", redisPassword, redisHost, redisPort)
	opts, err := redis.ParseURL(url)
	if err != nil {
		fmt.Println(err)
		logrus.Fatal(err)
	}

	client := redis.NewClient(opts)

	// Test connection
	err = client.Ping(context.Background()).Err()
	if err != nil {
		fmt.Println("could not connect to mobile Redis: ", err)
		logrus.Fatalf("could not connect to mobile Redis: %v", err)
	}

	fmt.Println("Mobile Cache created!")
	logrus.Info("Mobile Cache created!")

	return client*/
}

// Create cache for sessions
func CreateSessionCache() *bigcache.BigCache {
	config := bigcache.DefaultConfig(time.Duration(GetCacheEviction()) * time.Second) // Set the eviction time to x seconds
	config.CleanWindow = time.Duration(GetCacheEviction()/2) * time.Second            // Set the cleanup interval to x seconds
	cache, err := bigcache.New(context.Background(), config)
	if err != nil {
		logrus.Fatal(err)
	}

	return cache
}

// create cache for rate limiting otp regenration requests
func CreateOTPRateLimitCache() *bigcache.BigCache {
	config := bigcache.DefaultConfig(time.Duration(GetOTPReqEviction()) * time.Second) // Set the eviction time to x seconds
	config.CleanWindow = time.Duration(GetOTPReqEviction()/2) * time.Second            // Set the cleanup interval to x seconds
	cache, err := bigcache.New(context.Background(), config)
	if err != nil {
		logrus.Fatal(err)
	}

	return cache
}

// create ipinfo client
func CreateIPInfoClient() *ipinfo.Client {
	// engine
	engine := cache.NewInMemory().WithExpiration(10 * time.Minute)
	// create ipinfo cache
	cache := ipinfo.NewCache(engine)

	client := ipinfo.NewClient(nil, cache, GetIPClientInfoToken())

	return client
}

// get ip info
func GetIPInfo(ip string, client *ipinfo.Client) (*ipinfo.Core, error) {
	// check if run mode is test mode
	if GetGinRunMode() == "test" {
		return &ipinfo.Core{
			City:     "Cape Town",
			Region:   "Western Cape",
			Country:  "South Africa",
			Location: "-33.9258,18.4232",
		}, nil
	}

	info, err := client.GetIPInfo(net.ParseIP(ip))
	if err != nil {
		logrus.Error(err)
		return nil, err
	}

	return info, nil
}

func CreateRabbitConnection() *amqp.Connection {
	// RabbitMQ connection parameters
	rabbitMQUsername := GetRabbitMQUsername()
	rabbitMQPassword := GetRabbitMQPassword()
	rabbitMQHost := GetRabbitMQHost()
	rabbitMQPort := GetRabbitMQPort()

	// Construct the connection URI
	var uri string

	if rabbitMQUsername == "RABBITMQ_USERNAME" || rabbitMQPassword == "RABBITMQ_PASSWORD" {
		uri = fmt.Sprintf("amqp://%s:%s", rabbitMQHost, rabbitMQPort)
	} else {
		uri = fmt.Sprintf("amqp://%s:%s@%s:%s", rabbitMQUsername, rabbitMQPassword, rabbitMQHost, rabbitMQPort)
	}

	// Connect to RabbitMQ
	conn, err := amqp.Dial(uri)
	if err != nil {
		fmt.Printf("Failed to connect to RabbitMQ: %s\n", err)
		logrus.Fatal(err)
	}

	fmt.Println("Connected to RabbitMQ")
	logrus.Info("Connected to RabbitMQ!")

	return conn
}

func CreateRabbitChannel(conn *amqp.Connection) *amqp.Channel {
	// Create a channel
	ch, err := conn.Channel()
	if err != nil {
		logrus.Fatal(err)
	}

	return ch
}

func CreateRabbitQueue(ch *amqp.Channel) amqp.Queue {
	// Declare a queue
	q, err := ch.QueueDeclare(
		"notification_queue",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		logrus.Fatal(err)
	}

	return q
}

func CreateWebAuthnInstance() *webauthn.WebAuthn {
	// WebAuthn parameters
	rpID := GetRPID()
	rpName := GetRPName()
	rpOrigins := GetRPOrigins()

	var webAuthn *webauthn.WebAuthn
	var err error

	// Create a new WebAuthn instance
	wConfig := &webauthn.Config{
		RPID:          rpID,
		RPDisplayName: rpName,
		RPOrigins:     rpOrigins,
	}

	if webAuthn, err = webauthn.New(wConfig); err != nil {
		fmt.Printf("Failed to create WebAuthn instance: %s\n", err)
		logrus.WithError(err).Fatal("Failed to create WebAuthn instance")
	}

	fmt.Println("WebAuthn instance created!")
	logrus.Info("WebAuthn instance created!")

	return webAuthn
}

func CreateCentrifugoClient() *gocent.Client {
	// Centrifugo connection parameters
	centrifugoHost := GetCentrifugoHost()
	centrifugoPort := GetCentrifugoPort()
	centrifugoAPIKey := GetCentrifugoAPIKey()

	centrifugoAddr := fmt.Sprintf("http://%s:%s/api", centrifugoHost, centrifugoPort)
	// Create a new Centrifugo client
	client := gocent.New(gocent.Config{
		Addr: centrifugoAddr,
		Key:  centrifugoAPIKey,
	})

	fmt.Println("Centrifugo client created!")
	logrus.Info("Centrifugo client created!")

	return client
}

func CreateMailServerConnection() *gomail.Dialer {
	// Mail server connection parameters
	mailHost := GetSMTPHost()
	mailPort := GetSMTPPort()
	mailUsername := GetSystemEmail()
	mailPassword := GetSMTPPassword()

	// Create a new mail server connection
	d := gomail.NewDialer(mailHost, mailPort, mailUsername, mailPassword)

	fmt.Println("Mail server connection created!")
	logrus.Info("Mail server connection created!")

	return d
}

func CreateAzureBlobClient() *azblob.Client {
	url := fmt.Sprintf("https://%s.blob.core.windows.net/", GetAzureAccountName())

	credential, err := azblob.NewSharedKeyCredential(GetAzureAccountName(), GetAzureAccountKey())

	if err != nil {
		logrus.Fatal("Unable to create azure credentials due to error: ", err)
	}

	client, err := azblob.NewClientWithSharedKeyCredential(url, credential, nil)
	if err != nil {
		logrus.Fatal("Unable to create azure credentials due to error: ", err)
	}

	fmt.Println("Azure blob storage connection created!")
	logrus.Info("Azure blob storage connection created!")

	return client
}
