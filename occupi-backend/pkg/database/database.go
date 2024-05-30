package database

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// attempts to and establishes a connection with the remote mongodb database
func ConnectToDatabase() *mongo.Client {
	// MongoDB connection parameters
	username := configs.GetMongoDBUsername()
	password := configs.GetMongoDBPassword()
	clusterURI := configs.GetMongoDBCLUSTERURI()
	dbName := configs.GetMongoDBName()
	mongoDbStartURI := configs.GetMongoDBStartURI()

	// Escape the special characters in the password
	escapedPassword := url.QueryEscape(password)

	// Construct the connection URI
	uri := fmt.Sprintf("%s://%s:%s@%s/%s", mongoDbStartURI, username, escapedPassword, clusterURI, dbName)

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

// BookRoom handles booking a room and sends a confirmation email
func BookRoom(c *gin.Context, db *mongo.Client) {
	var booking models.Booking
	if err := c.ShouldBindJSON(&booking); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Generate a unique ID for the booking
	booking.ID = primitive.NewObjectID().Hex()

	// Save the booking to the database
	collection := db.Database("Occupi").Collection("RoomBooking")
	_, err := collection.InsertOne(c, booking)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save booking"})
		return
	}

	// Prepare the email content
	subject := "Booking Confirmation - Occupi"
	body := `
		Dear User,

		Thank you for booking with Occupi. Here are your booking details:

		Booking ID: ` + fmt.Sprint(booking.BookingId) + `
		Room ID: ` + booking.RoomId + `
		Slot: ` + fmt.Sprint(booking.Slot) + `

		If you have any questions, feel free to contact us.

		Thank you,
		The Occupi Team
		`

	// Use a WaitGroup to wait for all goroutines to complete
	var wg sync.WaitGroup
	var emailErrors []string
	var mu sync.Mutex

	for _, email := range booking.Emails {
		wg.Add(1)
		go func(email string) {
			defer wg.Done()
			if err := mail.SendMail(email, subject, body); err != nil {
				mu.Lock()
				emailErrors = append(emailErrors, email)
				mu.Unlock()
			}
		}(email)
	}

	// Wait for all email sending goroutines to complete
	wg.Wait()

	if len(emailErrors) > 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation emails to some addresses", "failedEmails": emailErrors})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Booking successful! Confirmation emails sent."})
}
