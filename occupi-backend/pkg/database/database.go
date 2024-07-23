package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/sender"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/gin-gonic/gin"
)

// returns all data from the mongo database
func GetAllData(ctx *gin.Context, appsession *models.AppSession) []bson.M {
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return nil
	}
	// Use the client
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

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

	// Return the users

	return users
}

// attempts to save booking in database
func SaveBooking(ctx *gin.Context, appsession *models.AppSession, booking models.Booking) (bool, error) {
	// Save the booking to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")
	_, err := collection.InsertOne(ctx, booking)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// Confirms the user check-in by checking certain criteria
func ConfirmCheckIn(ctx *gin.Context, appsession *models.AppSession, checkIn models.CheckIn) (bool, error) {
	// Save the check-in to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	// Find the booking by bookingId, roomId, and creator
	filter := bson.M{
		"_id":     checkIn.BookingID,
		"creator": checkIn.Creator,
	}

	// Find the booking
	var booking models.Booking
	err := collection.FindOne(context.TODO(), filter).Decode(&booking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			logrus.Error("Booking not found")
			return false, errors.New("booking not found")
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
func EmailExists(ctx *gin.Context, appsession *models.AppSession, email string) bool {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false
	}

	// Check if the email exists in the cache if cache is not nil
	if _, err := cache.GetUser(appsession, email); err == nil {
		return true
	}

	// Check if the email exists in the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false
	}

	// Add the user to the cache if cache is not nil, even if there is an error we don't care
	cache.SetUser(appsession, user)

	return true
}

// checks if booking exists in database
func BookingExists(ctx *gin.Context, appsession *models.AppSession, id string) bool {
	// Check if the booking exists in the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	filter := bson.M{"_id": id}
	var existingbooking models.Booking
	err := collection.FindOne(ctx, filter).Decode(&existingbooking)
	if err != nil {
		logrus.Error(err)
		return false
	}
	return true
}

// adds user to database
func AddUser(ctx *gin.Context, appsession *models.AppSession, user models.RegisterUser) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}
	// convert to user struct
	userStruct := models.User{
		OccupiID:             user.EmployeeID,
		Password:             user.Password,
		Email:                user.Email,
		Role:                 constants.Basic,
		OnSite:               true,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations:       []models.Location{},
		ExpoPushToken:        user.ExpoPushToken,
	}
	// Save the user to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, userStruct)

	return true, nil
}

// adds otp to database
func AddOTP(ctx *gin.Context, appsession *models.AppSession, email string, otp string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}
	// Save the OTP to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OTPS")
	otpStruct := models.OTP{
		Email:      email,
		OTP:        otp,
		ExpireWhen: time.Now().Add(time.Second * time.Duration(configs.GetOTPExpiration())),
	}
	_, err := collection.InsertOne(ctx, otpStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	// Add the OTP to the cache if cache is not nil
	cache.SetOTP(appsession, otpStruct)

	return true, nil
}

// checks if otp exists in database
func OTPExists(ctx *gin.Context, appsession *models.AppSession, email string, otp string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Check if the OTP exists in the cache if cache is not nil
	if otpdata, err := cache.GetOTP(appsession, email, otp); err == nil {
		if time.Now().After(otpdata.ExpireWhen) {
			return false, nil
		}
		return true, nil
	}

	// Check if the OTP exists in the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OTPS")
	filter := bson.M{"email": email, "otp": otp}
	var otpStruct models.OTP
	err := collection.FindOne(ctx, filter).Decode(&otpStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// Check if the OTP has expired
	if time.Now().After(otpStruct.ExpireWhen) {
		return false, nil
	}

	// Add the OTP to the cache if cache is not nil
	cache.SetOTP(appsession, otpStruct)

	return true, nil
}

// deletes otp from database
func DeleteOTP(ctx *gin.Context, appsession *models.AppSession, email string, otp string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}
	// Delete the OTP from the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OTPS")
	filter := bson.M{"email": email, "otp": otp}
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// delete otp from cache if cache is not nil
	cache.DeleteOTP(appsession, email, otp)

	return true, nil
}

// GetResetOTP retrieves the OTP for the given email and OTP from the database
func GetResetOTP(ctx context.Context, db *mongo.Client, email, otp string) (*models.OTP, error) {
	collection := db.Database(configs.GetMongoDBName()).Collection("OTPs")
	var resetOTP models.OTP
	filter := bson.M{"email": email, "otp": otp}
	err := collection.FindOne(ctx, filter).Decode(&resetOTP)
	if err != nil {
		return nil, err
	}
	return &resetOTP, nil
}

// verifies a user in the database
func VerifyUser(ctx *gin.Context, appsession *models.AppSession, email string, ipAddress string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	info, err := configs.GetIPInfo(ipAddress, appsession.IPInfo)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	location := &models.Location{
		City:    info.City,
		Region:  info.Region,
		Country: info.Country,
	}

	// Verify the user in the database and set next date to verify to 30 days from now
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	// append location to known locations array
	update := bson.M{
		"$set": bson.M{
			"isVerified":           true,
			"nextVerificationDate": time.Now().AddDate(0, 0, 30),
		},
		"$addToSet": bson.M{
			"knownLocations": location,
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	if userData, err := cache.GetUser(appsession, email); err == nil {
		userData.IsVerified = true
		userData.NextVerificationDate = time.Now().AddDate(0, 0, 30)
		userData.KnownLocations = append(userData.KnownLocations, *location)
		cache.SetUser(appsession, userData)
	}

	return true, nil
}

// get's the hash password stored in the database belonging to this user
func GetPassword(ctx *gin.Context, appsession *models.AppSession, email string) (string, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return "", errors.New("database is nil")
	}

	// Get the password from the cache if cache is not nil
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return userData.Password, nil
	}

	// Get the password from the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return user.Password, nil
}

// checks if the next verification date is due
func CheckIfNextVerificationDateIsDue(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	if userData, err := cache.GetUser(appsession, email); err == nil {
		if !time.Now().After(userData.NextVerificationDate) {
			return false, nil
		}
		_, err := UpdateVerificationStatusTo(ctx, appsession, email, false)
		if err != nil {
			logrus.Error(err)
			return false, err
		}
		return true, nil
	}

	// Check if the next verification date is due
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	if !time.Now().After(user.NextVerificationDate) {
		return false, nil
	}
	_, err = UpdateVerificationStatusTo(ctx, appsession, email, false)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// checks if the user is verified
func CheckIfUserIsVerified(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Check if the user is verified in the cache if cache is not nil
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return userData.IsVerified, nil
	}

	// Check if the user is verified
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return user.IsVerified, nil
}

// updates the users verification status to true or false
func UpdateVerificationStatusTo(ctx *gin.Context, appsession *models.AppSession, email string, status bool) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Update the verification status of the user
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"isVerified": status}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// if user is in cache, update the user in the cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		userData.IsVerified = status
		cache.SetUser(appsession, userData)
	}

	return true, nil
}

// Confirms if a booking has been cancelled
func ConfirmCancellation(ctx *gin.Context, appsession *models.AppSession, id string, email string) (bool, error) {
	// Save the check-in to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	// Find the booking by bookingId, roomId, and check if the email is in the emails object
	filter := bson.M{
		"_id":     id,
		"creator": email}

	// Find the booking
	var localBooking models.Booking
	err := collection.FindOne(context.TODO(), filter).Decode(&localBooking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			logrus.Error("Email not associated with the room")
			return false, errors.New("email not associated with the room")
		}
		logrus.Error("Failed to find booking:", err)
		return false, err
	}

	// Delete the booking
	_, err = collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		logrus.Error("Failed to cancel booking:", err)
		return false, err
	}
	return true, nil
}

// Get user information
func GetUserDetails(ctx *gin.Context, appsession *models.AppSession, email string) (models.UserDetailsRequest, error) {
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	// check if user is in cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return models.UserDetailsRequest{
			Email:        userData.Email,
			Name:         userData.Details.Name,
			Dob:          userData.Details.DOB.String(),
			Gender:       userData.Details.Gender,
			SessionEmail: userData.Email,
			Employeeid:   userData.OccupiID,
			Number:       userData.Details.ContactNo,
			Pronouns:     userData.Details.Pronouns,
		}, nil
	}

	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return models.UserDetailsRequest{}, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return models.UserDetailsRequest{
		Email:        user.Email,
		Name:         user.Details.Name,
		Dob:          user.Details.DOB.String(),
		Gender:       user.Details.Gender,
		SessionEmail: user.Email,
		Employeeid:   user.OccupiID,
		Number:       user.Details.ContactNo,
		Pronouns:     user.Details.Pronouns,
	}, nil
}

// UpdateUserDetails updates the user's details
func UpdateUserDetails(ctx *gin.Context, appsession *models.AppSession, user models.UserDetailsRequest) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": user.SessionEmail}
	update := bson.M{"$set": bson.M{}}

	// get user from cache
	userData, cachErr := cache.GetUser(appsession, user.SessionEmail)

	if user.Name != "" {
		update["$set"].(bson.M)["details.name"] = user.Name
		if cachErr == nil {
			userData.Details.Name = user.Name
		}
	}
	if user.Dob != "" {
		layout := "2006-01-02" // Go's reference time format
		parsedDOB, err := time.Parse(layout, user.Dob)
		if err == nil {
			update["$set"].(bson.M)["details.dob"] = parsedDOB
			if cachErr == nil {
				userData.Details.DOB = parsedDOB
			}
		}
	}
	if user.Gender != "" {
		update["$set"].(bson.M)["details.gender"] = user.Gender
		if cachErr == nil {
			userData.Details.Gender = user.Gender
		}
	}
	if user.Email != "" {
		update["$set"].(bson.M)["email"] = user.Email
		// set their verification status to false
		update["$set"].(bson.M)["isVerified"] = false // when they login again, an otp will be sent to verify their email

		if cachErr == nil {
			userData.Email = user.Email
			userData.IsVerified = false
		}
	}
	if user.Employeeid != "" {
		update["$set"].(bson.M)["occupiId"] = user.Employeeid
		if cachErr == nil {
			userData.OccupiID = user.Employeeid
		}
	}
	if user.Number != "" {
		update["$set"].(bson.M)["details.contactNo"] = user.Number
		if cachErr == nil {
			userData.Details.ContactNo = user.Number
		}
	}
	if user.Pronouns != "" {
		update["$set"].(bson.M)["details.pronouns"] = user.Pronouns
		if cachErr == nil {
			userData.Details.Pronouns = user.Pronouns
		}
	}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error("Failed to update user details: ", err)
		return false, err
	}

	if cachErr == nil {
		cache.SetUser(appsession, userData)
	}

	return true, nil
}

// Checks if a user is an admin
func CheckIfUserIsAdmin(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Get the user from the cache if cache is not nil
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return userData.Role == constants.Admin, nil
	}

	// Check if the user is an admin
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return user.Role == constants.Admin, nil
}

// AddResetToken adds a reset token to the database
func AddResetToken(ctx context.Context, db *mongo.Client, email string, resetToken string, expirationTime time.Time) (bool, error) {
	collection := db.Database(configs.GetMongoDBName()).Collection("ResetTokens")
	resetTokenStruct := models.ResetToken{
		Email:      email,
		Token:      resetToken,
		ExpireWhen: expirationTime,
	}
	_, err := collection.InsertOne(ctx, resetTokenStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// retrieves the email associated with a reset token
func GetEmailByResetToken(ctx context.Context, db *mongo.Client, resetToken string) (string, error) {
	collection := db.Database(configs.GetMongoDBName()).Collection("ResetTokens")
	filter := bson.M{"token": resetToken}
	var resetTokenStruct models.ResetToken
	err := collection.FindOne(ctx, filter).Decode(&resetTokenStruct)
	if err != nil {
		logrus.Error(err)
		return "", err
	}
	return resetTokenStruct.Email, nil
}

// CheckResetToken function
func CheckResetToken(ctx *gin.Context, db *mongo.Client, email string, token string) (bool, error) {
	// Access the "ResetTokens" collection within the configs.GetMongoDBName() database.
	collection := db.Database(configs.GetMongoDBName()).Collection("ResetTokens")

	// Create a filter to find the document matching the provided email and token.
	filter := bson.M{"email": email, "token": token}

	// Define a variable to hold the reset token document.
	var resetToken models.ResetToken

	// Attempt to find the document in the collection.
	err := collection.FindOne(ctx, filter).Decode(&resetToken)
	if err != nil {
		// Log and return the error if the document cannot be found or decoded.
		logrus.Error(err)
		return false, err
	}

	// Check if the current time is after the token's expiration time.
	if time.Now().After(resetToken.ExpireWhen) {
		// Return false indicating the token has expired.
		return false, nil
	}

	// Return true indicating the token is still valid.
	return true, nil
}

// UpdateUserPassword, which updates the password in the database set by the user
func UpdateUserPassword(ctx *gin.Context, db *mongo.Client, email string, password string) (bool, error) {
	// Check if the database is nil
	if db == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Update the password in the database
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"password": password}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// Update users password in cache if cache is not nil

	return true, nil
}

// ClearRestToekn, removes the reset token from the database
func ClearResetToken(ctx *gin.Context, db *mongo.Client, email string, token string) (bool, error) {
	// Delete the token from the database
	collection := db.Database(configs.GetMongoDBName()).Collection("ResetTokens")
	filter := bson.M{"email": email, "token": token}
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	return true, nil
}

// ValidateResetToken
func ValidateResetToken(ctx context.Context, db *mongo.Client, email, token string) (bool, string, error) {
	// Find the reset token document
	var resetToken models.ResetToken
	collection := db.Database(configs.GetMongoDBName()).Collection("ResetTokens")
	err := collection.FindOne(ctx, bson.M{"email": email, "token": token}).Decode(&resetToken)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, "Invalid or expired token", nil
		}
		return false, "", err
	}

	// Check if the token has expired
	if time.Now().After(resetToken.ExpireWhen) {
		return false, "Token has expired", nil
	}

	return true, "", nil
}

// SaveTwoFACode saves the 2FA code for a user
func SaveTwoFACode(ctx context.Context, db *mongo.Client, email, code string) error {
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{
		"$set": bson.M{
			"twoFACode":       code,
			"twoFACodeExpiry": time.Now().Add(10 * time.Minute),
		},
	}
	_, err := collection.UpdateOne(ctx, filter, update)
	return err
}

// VerifyTwoFACode checks if the provided 2FA code is valid for the user
func VerifyTwoFACode(ctx context.Context, db *mongo.Client, email, code string) (bool, error) {
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{
		"email":           email,
		"twoFACode":       code,
		"twoFACodeExpiry": bson.M{"$gt": time.Now()},
	}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// IsTwoFAEnabled checks if 2FA is enabled for the user
func IsTwoFAEnabled(ctx context.Context, db *mongo.Client, email string) (bool, error) {
	collection := db.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return false, err
	}
	return user.TwoFAEnabled, nil
}

// setting the 2fa enabled
func SetTwoFAEnabled(ctx context.Context, db *mongo.Database, email string, enabled bool) error {
	collection := db.Collection("users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"twoFAEnabled": enabled}}

	_, err := collection.UpdateOne(ctx, filter, update)
	return err
}

// filter collection based on the filter provided and return specific fields based on the projection provided
func FilterCollectionWithProjection(ctx *gin.Context, appsession *models.AppSession, collectionName string, filter models.FilterStruct) ([]bson.M, int64, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return nil, 0, errors.New("database is nil")
	}

	findOptions := options.Find()
	findOptions.SetProjection(filter.Projection)
	findOptions.SetLimit(filter.Limit)
	findOptions.SetSkip(filter.Skip)
	if filter.Sort != nil {
		findOptions.SetSort(filter.Sort)
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection(collectionName)

	cursor, err := collection.Find(ctx, filter.Filter, findOptions)
	if err != nil {
		logrus.Error(err)
		return nil, 0, err
	}

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, 0, err
	}

	totalResults, err := collection.CountDocuments(ctx, filter.Filter)
	if err != nil {
		return nil, 0, err
	}

	return results, totalResults, nil
}

func CheckIfUserIsLoggingInFromKnownLocation(ctx *gin.Context, appsession *models.AppSession, email string, ipAddress string) (bool, *ipinfo.Core, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, nil, errors.New("database is nil")
	}

	info, err := configs.GetIPInfo(ipAddress, appsession.IPInfo)
	if err != nil {
		logrus.Error(err)
		return false, nil, err
	}

	// Get the user from the cache if cache is not nil
	if userData, err := cache.GetUser(appsession, email); err == nil {
		for _, location := range userData.KnownLocations {
			if location.City == info.City && location.Region == info.Region && location.Country == info.Country {
				return true, nil, nil
			}
		}
		return false, info, nil
	}

	// Check if the user exists in the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err = collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return false, nil, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	for _, location := range user.KnownLocations {
		if location.Country == info.Country && location.City == info.City && location.Region == info.Region {
			return true, nil, nil
		}
	}
	return false, info, nil
}

func GetUsersPushTokens(ctx *gin.Context, appsession *models.AppSession, emails []string) ([]bson.M, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return nil, errors.New("database is nil")
	}

	if len(emails) == 0 {
		return nil, errors.New("no emails provided")
	}

	findOptions := options.Find()
	findOptions.SetProjection(bson.M{"expoPushToken": 1, "_id": 0})

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": bson.M{"$in": emails}, "notifications.invites": true}

	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		logrus.Error(err)
		return nil, err
	}

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func AddNotification(ctx *gin.Context, appsession *models.AppSession, notification models.ScheduledNotification, pushNotification bool) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Notifications")

	res, err := collection.InsertOne(ctx, notification)

	if err != nil {
		logrus.Error(err)
		return false, err
	}

	if !pushNotification {
		return true, nil
	}

	// set the notification id
	notification.ID = res.InsertedID.(primitive.ObjectID).Hex()

	err = sender.PublishMessage(appsession, notification)
	if err != nil {
		logrus.Error("Failed to publish message because: ", err)
		return false, err
	}

	return true, nil
}

func GetScheduledNotifications(ctx context.Context, appsession *models.AppSession) ([]models.ScheduledNotification, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return nil, errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Notifications")

	// filter where sent flag is false
	filter := bson.M{"sent": false}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return nil, err
	}

	var notifications []models.ScheduledNotification
	if err = cursor.All(ctx, &notifications); err != nil {
		return nil, err
	}

	return notifications, nil
}

func MarkNotificationAsSent(ctx context.Context, appsession *models.AppSession, notificationID string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Notifications")

	id, err := primitive.ObjectIDFromHex(notificationID)

	if err != nil {
		logrus.Error(err)
		return err
	}

	// update the notification to sent
	filter := bson.M{"notificationId": id}
	update := bson.M{"$set": bson.M{"sent": true}}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return err
	}

	return nil
}

func ReadNotifications(ctx *gin.Context, appsession *models.AppSession, email string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Notifications")

	// update many by removing this email from unreademails array for all notifications it is in
	updateFilter := bson.M{"emails": bson.M{"$in": []string{email}}}

	updateProjection := bson.M{"$pull": bson.M{"unreadEmails": email}}

	_, err := collection.UpdateMany(ctx, updateFilter, updateProjection)
	if err != nil {
		logrus.Error(err)
		return err
	}

	return nil
}

func GetSecuritySettings(ctx *gin.Context, appsession *models.AppSession, email string) (models.SecuritySettingsRequest, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return models.SecuritySettingsRequest{}, errors.New("database is nil")
	}

	// check if user is in cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		var mfa string
		if userData.Security.MFA {
			mfa = constants.On
		} else {
			mfa = constants.Off
		}

		var forceLogout string
		if userData.Security.ForceLogout {
			forceLogout = constants.On
		} else {
			forceLogout = constants.Off
		}

		return models.SecuritySettingsRequest{
			Email:       userData.Email,
			Mfa:         mfa,
			ForceLogout: forceLogout,
		}, nil
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return models.SecuritySettingsRequest{}, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	var mfa string
	if user.Security.MFA {
		mfa = constants.On
	} else {
		mfa = constants.Off
	}

	var forceLogout string
	if user.Security.ForceLogout {
		forceLogout = constants.On
	} else {
		forceLogout = constants.Off
	}

	return models.SecuritySettingsRequest{
		Email:       user.Email,
		Mfa:         mfa,
		ForceLogout: forceLogout,
	}, nil
}

func UpdateSecuritySettings(ctx *gin.Context, appsession *models.AppSession, securitySettings models.SecuritySettingsRequest) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	// get user from cache
	userData, cacheErr := cache.GetUser(appsession, securitySettings.Email)

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": securitySettings.Email}
	update := bson.M{"$set": bson.M{}}

	if securitySettings.NewPassword != "" {
		update["$set"].(bson.M)["password"] = securitySettings.NewPassword
		if cacheErr == nil {
			userData.Password = securitySettings.NewPassword
		}
	}

	if securitySettings.Mfa == constants.On {
		update["$set"].(bson.M)["security.mfa"] = true
		if cacheErr == nil {
			userData.Security.MFA = true
		}
	} else if securitySettings.Mfa == constants.Off {
		update["$set"].(bson.M)["security.mfa"] = false
		if cacheErr == nil {
			userData.Security.MFA = false
		}
	}

	if securitySettings.ForceLogout == constants.On {
		update["$set"].(bson.M)["security.forceLogout"] = true
		if cacheErr == nil {
			userData.Security.ForceLogout = true
		}
	} else if securitySettings.ForceLogout == constants.Off {
		update["$set"].(bson.M)["security.forceLogout"] = false
		if cacheErr == nil {
			userData.Security.ForceLogout = false
		}
	}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return err
	}

	if cacheErr == nil {
		cache.SetUser(appsession, userData)
	}

	return nil
}

func GetNotificationSettings(ctx *gin.Context, appsession *models.AppSession, email string) (models.NotificationsRequest, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return models.NotificationsRequest{}, errors.New("database is nil")
	}

	// check if user is in cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		var bookingReminder string
		if userData.Notifications.BookingReminder {
			bookingReminder = constants.On
		} else {
			bookingReminder = constants.Off
		}

		var invites string
		if userData.Notifications.Invites {
			invites = constants.On
		} else {
			invites = constants.Off
		}

		return models.NotificationsRequest{
			Email:           userData.Email,
			Invites:         invites,
			BookingReminder: bookingReminder,
		}, nil
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return models.NotificationsRequest{}, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	var bookingReminder string
	if user.Notifications.BookingReminder {
		bookingReminder = constants.On
	} else {
		bookingReminder = constants.Off
	}

	var invites string
	if user.Notifications.Invites {
		invites = constants.On
	} else {
		invites = constants.Off
	}

	return models.NotificationsRequest{
		Email:           user.Email,
		Invites:         invites,
		BookingReminder: bookingReminder,
	}, nil
}

func UpdateNotificationSettings(ctx *gin.Context, appsession *models.AppSession, notificationSettings models.NotificationsRequest) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	// get user from cache
	userData, cacheErr := cache.GetUser(appsession, notificationSettings.Email)

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": notificationSettings.Email}
	update := bson.M{"$set": bson.M{}}

	if notificationSettings.Invites == constants.On {
		update["$set"].(bson.M)["notifications.invites"] = true
		if cacheErr == nil {
			userData.Notifications.Invites = true
		}
	} else if notificationSettings.Invites == constants.Off {
		update["$set"].(bson.M)["notifications.invites"] = false
		if cacheErr == nil {
			userData.Notifications.Invites = false
		}
	}

	if notificationSettings.BookingReminder == constants.On {
		update["$set"].(bson.M)["notifications.bookingReminder"] = true
		if cacheErr == nil {
			userData.Notifications.BookingReminder = true
		}
	} else if notificationSettings.BookingReminder == constants.Off {
		update["$set"].(bson.M)["notifications.bookingReminder"] = false
		if cacheErr == nil {
			userData.Notifications.BookingReminder = false
		}
	}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return err
	}

	// update user in cache
	if cacheErr == nil {
		cache.SetUser(appsession, userData)
	}

	return nil
}

func UploadImageData(ctx *gin.Context, appsession *models.AppSession, image models.Image) (string, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return "", errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Images")

	id, err := collection.InsertOne(ctx, image)
	if err != nil {
		logrus.Error(err)
		return "", err
	}

	return id.InsertedID.(primitive.ObjectID).Hex(), nil
}

func GetImageData(ctx *gin.Context, appsession *models.AppSession, imageID string, quality string) (models.Image, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return models.Image{}, errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Images")

	id, err := primitive.ObjectIDFromHex(imageID)

	if err != nil {
		logrus.Error(err)
		return models.Image{}, err
	}

	filter := bson.M{"_id": id}

	// add quality attribute to projection
	findOptions := options.FindOne()
	findOptions.SetProjection(bson.M{"image_" + quality + "_res": 1, "_id": 0, "fileName": 1})

	var image models.Image
	err = collection.FindOne(ctx, filter, findOptions).Decode(&image)
	if err != nil {
		logrus.WithError(err).Error("Failed to get image data")
		return models.Image{}, err
	}

	return image, nil
}

func DeleteImageData(ctx *gin.Context, appsession *models.AppSession, imageID string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Images")

	filter := bson.M{"_id": imageID}
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return err
	}

	return nil
}

func SetUserImage(ctx *gin.Context, appsession *models.AppSession, email, imageID string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	// get user from cache
	userData, cacheErr := cache.GetUser(appsession, email)

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"details.imageid": imageID}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return err
	}

	// update user in cache
	if cacheErr == nil {
		userData.Details.ImageID = imageID
		cache.SetUser(appsession, userData)
	}

	return nil
}

func GetUserImage(ctx *gin.Context, appsession *models.AppSession, email string) (string, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return "", errors.New("database is nil")
	}

	// check if user is in cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return userData.Details.ImageID, nil
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.WithError(err).Error("Failed to get user image id")
		return "", err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return user.Details.ImageID, nil
}

func AddImageIDToRoom(ctx *gin.Context, appsession *models.AppSession, roomID, imageID string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Rooms")

	filter := bson.M{"roomId": roomID}
	update := bson.M{"$addToSet": bson.M{"roomImageIds": imageID}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return err
	}

	return nil
}

func CheckIfUserHasMFAEnabled(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// check if user is in cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return userData.Security.MFA, nil
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return false, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return user.Security.MFA, nil
}
