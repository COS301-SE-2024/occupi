package database

import (
	"context"
	"fmt"
	"net/url"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/gin-gonic/gin"
)

// attempts to and establishes a connection with the remote mongodb database
func ConnectToDatabase() *mongo.Client {
	// MongoDB connection parameters
	username := configs.GetMongoDBUsername()
	password := configs.GetMongoDBPassword()
	clusterURI := configs.GetMongoDBCLUSTERURI()
	dbName := configs.GetMongoDBName()
	mongoDBStartURI := configs.GetMongoDBStartURI()

	// Escape the special characters in the password
	escapedPassword := url.QueryEscape(password)

	// Construct the connection URI
	uri := fmt.Sprintf("%s://%s:%s@%s/%s", mongoDBStartURI, username, escapedPassword, clusterURI, dbName)

	// Set client options
	clientOptions := options.Client().ApplyURI(uri)

	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		logrus.Error(err)
	}

	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		logrus.Error(err)
	}

	logrus.Info("Connected to MongoDB!")

	return client
}

// returns all data from the mongo database
func GetAllData(db *mongo.Client) []bson.M {
	// Use the client
	collection := db.Database("Occupi").Collection("Users")

	// Define filter to find documents where onSite is true
	filter := bson.M{"onSite": true}

	// Execute the query
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		logrus.Error(err)
	}
	defer cursor.Close(context.TODO())

	var users []bson.M

	// Iterate through the results
	for cursor.Next(context.TODO()) {
		var user bson.M
		if err := cursor.Decode(&user); err != nil {
			logrus.Error(fmt.Printf("Error decoding user: %v", err))
		}
		users = append(users, user)
	}

	if err := cursor.Err(); err != nil {
		logrus.Error(fmt.Printf("Cursor error: %v", err))
	}

	return users
}

func SaveBooking(ctx *gin.Context, db *mongo.Client, booking models.Booking) (bool, error) {
	// Save the booking to the database
	collection := db.Database("Occupi").Collection("RoomBooking")
	_, err := collection.InsertOne(ctx, booking)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}
