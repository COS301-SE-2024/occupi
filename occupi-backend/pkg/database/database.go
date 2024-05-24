package database

import (
	"context"
    // "encoding/json"
    "fmt"
    "log"
    "net/url"
    "os"

    "github.com/joho/godotenv"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	// "github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

// var resources = []models.Resource{
// 	{ID: "1", Name: "Resource One"},
// }

func GetAllData( db *mongo.Client) []bson.M {
	// Use the client
	collection := db.Database("Occupi").Collection("Users")

	// Define filter to find documents where onSite is true
	filter := bson.M{"onSite": true}

	// Execute the query
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(context.TODO())

	var users []bson.M

    // Iterate through the results
    for cursor.Next(context.TODO()) {
        var user bson.M
        if err := cursor.Decode(&user); err != nil {
            log.Fatalf("Error decoding user: %v", err)
        }
        users = append(users, user)
    }

    if err := cursor.Err(); err != nil {
        log.Fatalf("Cursor error: %v", err)
    }

	return users

}

func GetDatabase() *mongo.Client {

	// Load environment variables from .env file
    if err := godotenv.Load(); err != nil {
		fmt.Println(err)
        log.Fatal("Error loading .env file")
    }

    // MongoDB connection parameters
    username := "Y2Kode"
    password := os.Getenv("MONGODB_PASSWORD")
    clusterURI := "occupi.3m1vvob.mongodb.net"
    dbName := "Occupi"

    // Escape the special characters in the password
    escapedPassword := url.QueryEscape(password)

    // Construct the connection URI
    uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/%s", username, escapedPassword, clusterURI, dbName)

    // Set client options
    clientOptions := options.Client().ApplyURI(uri)

    // Connect to MongoDB
    client, err := mongo.Connect(context.TODO(), clientOptions)
    if err != nil {
        log.Fatal(err)
    }

    // Check the connection
    err = client.Ping(context.TODO(), nil)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Connected to MongoDB!")

	//print configs just as an example. This will be removed once concept is understood
	port := configs.GetPort() //this is just an example to show how to use configs
	println(port)
	return client
}



//lets pretend a database connection has been made and GetDatabase returns the connection
