package database

import (
	"context"
	"fmt"
	"net/url"
	"strconv"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
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

// attempts to save booking in database
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
func ConfirmCheckIn(ctx *gin.Context, db *mongo.Client, checkIn models.CheckIn) (bool, error) {
	// Save the check-in to the database
	collection := db.Database("Occupi").Collection("bookings")

	// Build the dynamic filter for email check
	emailFilter := bson.A{}
	for key := range checkIn.Email {
		emailFilter = append(emailFilter, bson.M{"emails." + strconv.Itoa(key): checkIn.Email})
	}

	//Find the booking by bookingId, roomId, and check if the email is in the emails object
	filter := bson.M{
		"bookingId": checkIn.BookingID,
		"roomId":    checkIn.RoomID,
		"$or":       emailFilter,
	}

	// Find the booking
	var booking models.Booking
	err := collection.FindOne(context.TODO(), filter).Decode(&booking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			logrus.Error("Email not associated with the room")
			return false, fmt.Errorf("Email not associated with the room")
		}
		logrus.Error("Failed to find booking:", err)
		return false, err
	}

	update := bson.M{
		"$set": bson.M{"checkedIn": true},
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedBooking models.Booking
	err = collection.FindOneAndUpdate(context.TODO(), filter, update, opts).Decode(&updatedBooking)
	if err != nil {
		logrus.Error("Failed to update booking:", err)
		return false, err
	}
	return true, nil
}

// checks if email exists in database
func EmailExists(ctx *gin.Context, db *mongo.Client, email string) bool {
	// Check if the email exists in the database
	collection := db.Database("Occupi").Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false
	}
	return true
}

// checks if booking exists in database
func BookingExists(ctx *gin.Context, db *mongo.Client, bookingID int) bool {
	// Check if the booking exists in the database
	collection := db.Database("Occupi").Collection("RoomBooking")
	filter := bson.M{"bookingID": bookingID}
	var booking models.Booking
	err := collection.FindOne(ctx, filter).Decode(&booking)
	if err != nil {
		logrus.Error(err)
		return false
	}
	return true
}

// adds user to database
func AddUser(ctx *gin.Context, db *mongo.Client, user models.RequestUser) (bool, error) {
	// convert to user struct
	userStruct := models.User{
		OccupiID:             utils.GenerateEmployeeID(),
		Password:             user.Password,
		Email:                user.Email,
		Role:                 "basic",
		OnSite:               true,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
	}
	// Save the user to the database
	collection := db.Database("Occupi").Collection("Users")
	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// adds otp to database
func AddOTP(ctx *gin.Context, db *mongo.Client, email string, otp string) (bool, error) {
	// Save the OTP to the database
	collection := db.Database("Occupi").Collection("OTPS")
	otpStruct := models.OTP{
		Email:      email,
		OTP:        otp,
		ExpireWhen: time.Now().Add(time.Minute * 10),
	}
	_, err := collection.InsertOne(ctx, otpStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// checks if otp exists in database
func OTPExists(ctx *gin.Context, db *mongo.Client, email string, otp string) (bool, error) {
	// Check if the OTP exists in the database
	collection := db.Database("Occupi").Collection("OTPS")
	filter := bson.M{"email": email, "otp": otp}
	var otpStruct models.OTP
	err := collection.FindOne(ctx, filter).Decode(&otpStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// deletes otp from database
func DeleteOTP(ctx *gin.Context, db *mongo.Client, email string, otp string) (bool, error) {
	// Delete the OTP from the database
	collection := db.Database("Occupi").Collection("OTPS")
	filter := bson.M{"email": email, "otp": otp}
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// verifies a user in the database
func VerifyUser(ctx *gin.Context, db *mongo.Client, email string) (bool, error) {
	// Verify the user in the database and set next date to verify to 30 days from now
	collection := db.Database("Occupi").Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"isVerified": true, "nextVerificationDate": time.Now().AddDate(0, 0, 30)}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// get's the hash password stored in the database belonging to this user
func GetPassword(ctx *gin.Context, db *mongo.Client, email string) (string, error) {
	// Get the password from the database
	collection := db.Database("Occupi").Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return "", err
	}
	return user.Password, nil
}

// checks if the next verification date is due
func CheckIfNextVerificationDateIsDue(ctx *gin.Context, db *mongo.Client, email string) (bool, error) {
	// Check if the next verification date is due
	collection := db.Database("Occupi").Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	if time.Now().After(user.NextVerificationDate) {
		_, err := UpdateVerificationStatusTo(ctx, db, email, false)
		if err != nil {
			logrus.Error(err)
			return false, err
		}
		return true, nil
	}
	return false, nil
}

// checks if the user is verified
func CheckIfUserIsVerified(ctx *gin.Context, db *mongo.Client, email string) (bool, error) {
	// Check if the user is verified
	collection := db.Database("Occupi").Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return user.IsVerified, nil
}

// updates the users verification status to true or false
func UpdateVerificationStatusTo(ctx *gin.Context, db *mongo.Client, email string, status bool) (bool, error) {
	// Update the verification status of the user
	collection := db.Database("Occupi").Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"isVerified": status}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}
