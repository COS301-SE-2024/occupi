package database

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

type Item struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatal("Error loading .env file: ", err)
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := ConnectToDatabase()
	collectionName := "your_collection"

	collection := db.Database(configs.GetMongoDBName()).Collection(collectionName)

	data, err := ioutil.ReadFile("path/to/your/test_data.json")
	if err != nil {
		log.Fatalf("Failed to read JSON file: %v", err)
	}

	fmt.Println("Successfully seeded test data into MongoDB")
}

// Function to insert data if the collection is empty
func insertData(collection *mongo.Collection, documents []interface{}) {
	count, err := collection.CountDocuments(context.Background(), bson.D{})
	if err != nil {
		log.Fatalf("Failed to count documents: %v", err)
	}
	if count == 0 {
		_, err := collection.InsertMany(context.Background(), documents)
		if err != nil {
			log.Fatalf("Failed to insert documents into %s collection: %v", collection.Name(), err)
		}
		fmt.Printf("Successfully seeded data into %s collection\n", collection.Name())
	} else {
		fmt.Printf("Collection %s already has %d documents, skipping seeding\n", collection.Name(), count)
	}
}
