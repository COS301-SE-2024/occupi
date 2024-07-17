package configs

import (
	"net"
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/ipinfo/go/v2/ipinfo/cache"

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

	fmt.Printf("URI: %s\n", uri) // debug

	// Set client options
	clientOptions := options.Client().ApplyURI(uri)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	// Connect to MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		fmt.Println("Error connecting to MongoDB") // debug
		logrus.Fatal(err)
		client.Disconnect(ctx)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		fmt.Println("Error pinging MongoDB") // debug
		logrus.Fatal(err)
	}

	fmt.Println("Connected to MongoDB!") //debug
	logrus.Info("Connected to MongoDB!")

	return client
}

// Create cache
func CreateCache() *bigcache.BigCache {
	config := bigcache.DefaultConfig(time.Duration(GetCacheEviction()) * time.Second) // Set the eviction time to 5 seconds
	config.CleanWindow = time.Duration(GetCacheEviction()/2) * time.Second            // Set the cleanup interval to 5 seconds
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
			City:    "Cape Town",
			Region:  "Western Cape",
			Country: "South Africa",
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
	uri := fmt.Sprintf("amqp://%s:%s@%s:%s", rabbitMQUsername, rabbitMQPassword, rabbitMQHost, rabbitMQPort)

	fmt.Printf("URI: %s\n", uri) // debug

	// Connect to RabbitMQ
	conn, err := amqp.Dial(uri)
	if err != nil {
		fmt.Println("Error connecting to RabbitMQ") // debug
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

func CreateRabbitConnection() *amqp.Connection {
	// RabbitMQ connection parameters
	rabbitMQUsername := GetRabbitMQUsername()
	rabbitMQPassword := GetRabbitMQPassword()
	rabbitMQHost := GetRabbitMQHost()
	rabbitMQPort := GetRabbitMQPort()

	// Construct the connection URI
	uri := fmt.Sprintf("amqp://%s:%s@%s:%s", rabbitMQUsername, rabbitMQPassword, rabbitMQHost, rabbitMQPort)

	fmt.Printf("URI: %s\n", uri) // debug

	// Connect to RabbitMQ
	conn, err := amqp.Dial(uri)
	if err != nil {
		fmt.Println("Error connecting to RabbitMQ") // debug
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
