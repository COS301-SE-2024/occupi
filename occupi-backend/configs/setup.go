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

	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		logrus.Fatal(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		logrus.Fatal(err)
	}

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
