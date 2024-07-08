package configs

import (
	"log"
	"os"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/allegro/bigcache/v3"

	"context"
	"fmt"
	"net/url"

	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MockDatabase struct {
	OTPS     []models.OTP     `json:"otps"`
	Bookings []models.Booking `json:"bookings"`
	Rooms    []models.Room    `json:"rooms"`
	Users    []models.User    `json:"users"`
}

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
	cache, err := bigcache.New(context.Background(), bigcache.DefaultConfig(10*time.Minute))
	if err != nil {
		logrus.Fatal(err)
	}

	return cache
}

func SeedMockDatabase(mockdatafilepath string) {
	// connect to the database
	db := ConnectToDatabase(constants.AdminDBAccessOption)

	// Read the JSON file
	data, err := os.ReadFile(mockdatafilepath)
	if err != nil {
		log.Fatalf("Failed to read JSON file: %v", err)
	}

	// Parse the JSON file
	var mockDatabase MockDatabase
	if err := bson.UnmarshalExtJSON(data, true, &mockDatabase); err != nil {
		log.Fatalf("Failed to unmarshal JSON data: %v", err)
	}

	// Insert data into each collection
	otpsDocuments := make([]interface{}, 0, len(mockDatabase.OTPS))
	for _, otps := range mockDatabase.OTPS {
		otpsDocuments = append(otpsDocuments, otps)
	}
	insertData(db.Database(GetMongoDBName()).Collection("OTPS"), otpsDocuments)

	BookingsDocuments := make([]interface{}, 0, len(mockDatabase.Bookings))
	for _, roomBooking := range mockDatabase.Bookings {
		BookingsDocuments = append(BookingsDocuments, roomBooking)
	}
	insertData(db.Database(GetMongoDBName()).Collection("RoomBooking"), BookingsDocuments)

	roomsDocuments := make([]interface{}, 0, len(mockDatabase.Rooms))
	for _, rooms := range mockDatabase.Rooms {
		roomsDocuments = append(roomsDocuments, rooms)
	}
	insertData(db.Database(GetMongoDBName()).Collection("Rooms"), roomsDocuments)

	usersDocuments := make([]interface{}, 0, len(mockDatabase.Users))
	for _, users := range mockDatabase.Users {
		usersDocuments = append(usersDocuments, users)
	}
	insertData(db.Database(GetMongoDBName()).Collection("Users"), usersDocuments)

	log.Println("Successfully seeded test data into MongoDB")
}

// Function to insert data if the collection is empty
func insertData(collection *mongo.Collection, documents []interface{}) {
	count, err := collection.CountDocuments(context.Background(), bson.D{})
	if err != nil {
		log.Fatalf("Failed to count documents: %v", err)
	}

	switch {
	case count == 0 && len(documents) > 0:
		_, err := collection.InsertMany(context.Background(), documents)
		if err != nil {
			log.Fatalf("Failed to insert documents into %s collection: %v", collection.Name(), err)
		}
		log.Printf("Successfully seeded data into %s collection\n", collection.Name())
	case len(documents) == 0:
		log.Printf("No documents to insert into %s skipping seeding\n", collection.Name())
	default:
		log.Printf("Collection %s already has %d documents, skipping seeding\n", collection.Name(), count)
	}
}
