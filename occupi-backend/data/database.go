package data

import (
	"log"
	"os"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"

	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MockDatabase struct {
	OTPS     []models.OTP     `json:"otps"`
	Bookings []models.Booking `json:"bookings"`
	Rooms    []models.Room    `json:"rooms"`
	Users    []models.User    `json:"users"`
}

func SeedMockDatabase(mockdatafilepath string) {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Read the JSON file
	fileData, err := os.ReadFile(mockdatafilepath)
	if err != nil {
		log.Fatalf("Failed to read JSON file: %v", err)
	}

	// Parse the JSON file
	var mockDatabase MockDatabase
	if err := bson.UnmarshalExtJSON(fileData, true, &mockDatabase); err != nil {
		log.Fatalf("Failed to unmarshal JSON data: %v", err)
	}

	// Insert data into each collection
	otpsDocuments := make([]interface{}, 0, len(mockDatabase.OTPS))
	for _, otps := range mockDatabase.OTPS {
		otpsDocuments = append(otpsDocuments, otps)
	}
	insertData(db.Database(configs.GetMongoDBName()).Collection("OTPS"), otpsDocuments)

	BookingsDocuments := make([]interface{}, 0, len(mockDatabase.Bookings))
	for _, roomBooking := range mockDatabase.Bookings {
		BookingsDocuments = append(BookingsDocuments, roomBooking)
	}
	insertData(db.Database(configs.GetMongoDBName()).Collection("RoomBooking"), BookingsDocuments)

	roomsDocuments := make([]interface{}, 0, len(mockDatabase.Rooms))
	for _, rooms := range mockDatabase.Rooms {
		roomsDocuments = append(roomsDocuments, rooms)
	}
	insertData(db.Database(configs.GetMongoDBName()).Collection("Rooms"), roomsDocuments)

	usersDocuments := make([]interface{}, 0, len(mockDatabase.Users))
	for _, users := range mockDatabase.Users {
		usersDocuments = append(usersDocuments, users)
	}
	insertData(db.Database(configs.GetMongoDBName()).Collection("Users"), usersDocuments)

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

func CleanDatabase() {
	// connect to the database
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)

	// Drop all collections
	collections := []string{"OTPS", "RoomBooking", "Rooms", "Users"}
	for _, collection := range collections {
		if err := db.Database(configs.GetMongoDBName()).Collection(collection).Drop(context.Background()); err != nil {
			log.Fatalf("Failed to drop collection %s: %v", collection, err)
		}
		log.Printf("Successfully dropped collection %s\n", collection)
	}
}
