package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/analytics"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/sender"
	"github.com/go-webauthn/webauthn/webauthn"
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
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}
	// Save the booking to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")
	_, err := collection.InsertOne(ctx, booking)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	cache.SetBooking(appsession, booking)

	return true, nil
}

// Confirms the user check-in by checking certain criteria
func ConfirmCheckIn(ctx *gin.Context, appsession *models.AppSession, checkIn models.CheckIn) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Save the check-in to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	// Find the booking by bookingId, occupiId, and creator
	filter := bson.M{
		"occupiId": checkIn.BookingID,
		"creator":  checkIn.Creator,
	}

	update := bson.M{"$set": bson.M{"checkedIn": true}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error("Failed to update booking:", err)
		return false, err
	}

	if booking, err := cache.GetBooking(appsession, checkIn.BookingID); err == nil {
		booking.CheckedIn = true
		cache.SetBooking(appsession, booking)
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
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false
	}

	// Check if the booking exists in the cache if cache is not nil
	if _, err := cache.GetBooking(appsession, id); err == nil {
		return true
	}

	// Check if the booking exists in the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	filter := bson.M{"occupiId": id}
	var existingbooking models.Booking
	err := collection.FindOne(ctx, filter).Decode(&existingbooking)
	if err != nil {
		logrus.Error(err)
		return false
	}

	// Add the booking to the cache if cache is not nil
	cache.SetBooking(appsession, existingbooking)

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
	userStruct := CreateBasicUser(user)
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
		City:     info.City,
		Region:   info.Region,
		Country:  info.Country,
		Location: info.Location,
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
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}
	// Save the check-in to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	// Find the booking by bookingId, roomId, and check if the email is in the emails object
	filter := bson.M{
		"occupiId": id,
		"creator":  email,
	}

	// Delete the booking
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		logrus.Error("Failed to cancel booking:", err)
		return false, err
	}

	// delete booking from cache if cache is not nil
	cache.DeleteBooking(appsession, id)

	return true, nil
}

// Get user information
func GetUserDetails(ctx *gin.Context, appsession *models.AppSession, email string) (models.UserDetailsRequest, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return models.UserDetailsRequest{}, errors.New("database is nil")
	}

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

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

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

// AddResetToken adds a reset token to the database **Deprecated - Cannot confirm if this is still in use**
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

// retrieves the email associated with a reset token **Deprecated - Cannot confirm if this is still in use**
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

// CheckResetToken function **Deprecated - Cannot confirm if this is still in use**
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
func UpdateUserPassword(ctx *gin.Context, appsession *models.AppSession, email string, password string) (bool, error) {
	// Check if the database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Update the password in the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"password": password}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// Update users password in cache if cache is not nil
	if userData, err := cache.GetUser(appsession, email); err == nil {
		userData.Password = password
		cache.SetUser(appsession, userData)
	}

	return true, nil
}

// ClearRestToekn, removes the reset token from the database **Deprecated - Cannot confirm if this is still in use**
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

// ValidateResetToken validates the reset token **Deprecated - Cannot confirm if this is still in use**
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
	findOptions := options.FindOne()
	// exclude the security.credentials field only
	findOptions.SetProjection(bson.M{"security.credentials": 0})
	var user models.User
	err := collection.FindOne(ctx, filter, findOptions).Decode(&user)
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

func DeleteImageIDFromRoom(ctx *gin.Context, appsession *models.AppSession, roomID, imageID string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Rooms")

	filter := bson.M{"roomId": roomID}
	update := bson.M{"$pull": bson.M{"roomImageIds": imageID}}

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

func AddRoom(ctx *gin.Context, appsession *models.AppSession, rroom models.RequestRoom) (string, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return "", errors.New("database is nil")
	}

	room := models.Room{
		RoomID:       rroom.RoomID,
		RoomNo:       rroom.RoomNo,
		FloorNo:      rroom.FloorNo,
		MinOccupancy: rroom.MinOccupancy,
		MaxOccupancy: rroom.MaxOccupancy,
		Description:  rroom.Description,
		RoomName:     rroom.RoomName,
		RoomImageIDs: []string{},
	}

	// filter - ensure no room exists with the same roomid or roomno before inserting
	filter := bson.M{"$or": []bson.M{
		{"roomId": rroom.RoomID},
		{"roomNo": rroom.RoomNo},
	}}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Rooms")

	// check if room already exists
	var existingRoom models.Room
	err := collection.FindOne(ctx, filter).Decode(&existingRoom)

	if err == nil {
		return "", errors.New("room already exists")
	}

	res, err := collection.InsertOne(ctx, room)
	if err != nil {
		logrus.WithError(err).Error("Failed to add room")
		return "", err
	}

	return res.InsertedID.(primitive.ObjectID).Hex(), nil
}

func GetUserCredentials(ctx *gin.Context, appsession *models.AppSession, email string) (webauthn.Credential, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return webauthn.Credential{}, errors.New("database is nil")
	}

	// check if user is in cache
	if userData, err := cache.GetUser(appsession, email); err == nil {
		return userData.Security.Credentials, nil
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	var user models.User
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return webauthn.Credential{}, err
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return user.Security.Credentials, nil
}

func AddUserCredential(ctx *gin.Context, appsession *models.AppSession, email string, credential *webauthn.Credential) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	// get user from cache
	userData, cacheErr := cache.GetUser(appsession, email)

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"security.credentials": credential}}

	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return err
	}

	// update user in cache
	if cacheErr == nil {
		userData.Security.Credentials = *credential
		cache.SetUser(appsession, userData)
	}

	return nil
}

func IsIPWithinRange(ctx *gin.Context, appsession *models.AppSession, email string, unrecognizedLogger *ipinfo.Core) bool {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false
	}

	// get the ip ranges from the cache
	if user, err := cache.GetUser(appsession, email); err == nil {
		return IsLocationInRange(user.KnownLocations, unrecognizedLogger)
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}

	var user models.User

	err := collection.FindOne(ctx, filter).Decode(&user)

	if err != nil {
		logrus.Error(err)
		return false
	}

	// Add the user to the cache if cache is not nil
	cache.SetUser(appsession, user)

	return IsLocationInRange(user.KnownLocations, unrecognizedLogger)
}

func GetAvailableSlots(ctx *gin.Context, appsession *models.AppSession, request models.RequestAvailableSlots) ([]models.Slot, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return nil, errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")

	filter := bson.M{
		"roomId": request.RoomID,
		"date":   request.Date,
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return nil, err
	}

	var bookings []models.Booking
	if err = cursor.All(ctx, &bookings); err != nil {
		return nil, err
	}

	// get all slots for the room
	slots := ComputeAvailableSlots(bookings, request.Date)

	return slots, nil
}

func ToggleOnsite(ctx *gin.Context, appsession *models.AppSession, request models.RequestOnsite) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	var updatedStatus bool
	switch request.OnSite {
	case "Yes":
		updatedStatus = true
	case "No":
		updatedStatus = false
	default:
		return errors.New("invalid status")
	}

	// check if user is already on site or off site and are trying to perform the same action again
	var userData models.User
	userData, err := cache.GetUser(appsession, request.Email)
	if err != nil {
		// get the user from the database
		filter := bson.M{"email": request.Email}
		err := collection.FindOne(ctx, filter).Decode(&userData)
		if err != nil {
			logrus.WithError(err).Error("Failed to get user from database")
			return err
		}
	}

	if userData.OnSite && updatedStatus {
		return errors.New("user is already onsite")
	} else if !userData.OnSite && !updatedStatus {
		return errors.New("user is already offsite")
	}

	filter := bson.M{"email": request.Email}
	update := bson.M{"$set": bson.M{"onSite": updatedStatus}}

	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.WithError(err).Error("Failed to update user status")
		return err
	}

	// update user in cache
	userData.OnSite = updatedStatus
	cache.SetUser(appsession, userData)

	if updatedStatus {
		// add the user to the office hours collection
		err = AddHoursToOfficeHoursCollection(ctx, appsession, request.Email)
		if err != nil {
			logrus.Error(err)
			return err
		}

		// add their attendance to the attendance collection if there is no
		// attendance object for this date otherwise increment the Number_Attended field
		err = AddAttendance(ctx, appsession)
		if err != nil {
			logrus.Error(err)
			return err
		}
	} else {
		// find the user's office hours and remove them and add the removed office hours to the OfficeHoursArchive collection
		officeHours, err := FindAndRemoveOfficeHours(ctx, appsession, request.Email)
		if err != nil {
			logrus.Error(err)
			return err
		}

		// update the fields and add to the OfficeHoursArchive time series collection
		err = AddOfficeHoursToArchive(ctx, appsession, officeHours)
		if err != nil {
			logrus.Error(err)
			return err
		}
	}

	return nil
}

func AddHoursToOfficeHoursCollection(ctx *gin.Context, appsession *models.AppSession, email string) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	// add the user to the office hours collection
	officeHours := models.OfficeHours{
		Email:   email,
		Entered: CapTimeRange(),
		Exited:  CapTimeRange(),
		Closed:  false,
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OfficeHours")

	_, err := collection.InsertOne(ctx, officeHours)
	if err != nil {
		logrus.WithError(err).Error("Failed to add user to office hours")
		return err
	}

	return nil
}

func FindAndRemoveOfficeHours(ctx *gin.Context, appsession *models.AppSession, email string) (models.OfficeHours, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return models.OfficeHours{}, errors.New("database is nil")
	}

	// find the user's office hours and remove them
	filter := bson.M{"email": email, "closed": false}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OfficeHours")

	var officeHours models.OfficeHours
	err := collection.FindOne(ctx, filter).Decode(&officeHours)
	if err != nil {
		logrus.Error(err)
		return models.OfficeHours{}, err
	}

	// remove the office hours from the OfficeHours collection
	_, err = collection.DeleteOne(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return models.OfficeHours{}, err
	}

	return officeHours, nil
}

func AddOfficeHoursToArchive(ctx *gin.Context, appsession *models.AppSession, officeHours models.OfficeHours) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}

	// update the fields and add to the OfficeHoursArchive time series collection
	officeHours.Closed = true
	officeHours.Exited = CompareAndReturnTime(officeHours.Entered, CapTimeRange())

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OfficeHoursArchive")

	_, err := collection.InsertOne(ctx, officeHours)
	if err != nil {
		logrus.Error(err)
		return err
	}

	return nil
}

func AddAttendance(ctx *gin.Context, appsession *models.AppSession) error {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return errors.New("database is nil")
	}
	// add their attendance to the attendance collection if there is no
	// attendance object for this date otherwise increment the Number_Attended field
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("attendance")

	// Define the start and end of the day
	now := time.Now().Truncate(24 * time.Hour)
	endOfDay := now.Add(24 * time.Hour)

	// Create the filter
	filter := bson.M{
		"Date": bson.M{
			"$gte": now,
			"$lt":  endOfDay,
		},
	}

	var attendance models.Attendance
	err := collection.FindOne(ctx, filter).Decode(&attendance)
	if err != nil {
		logrus.WithError(err).Error("Failed to get attendance")
		attendance = models.Attendance{
			Date:           time.Now(),
			IsWeekend:      IsWeekend(time.Now()),
			WeekOfTheYear:  WeekOfTheYear(time.Now()),
			DayOfWeek:      DayOfTheWeek(time.Now()),
			Month:          Month(time.Now()),
			SpecialEvent:   false, // admins can set this to true if there is a special event at a later stage
			NumberAttended: 1,
		}

		_, err = collection.InsertOne(ctx, attendance)
		if err != nil {
			logrus.WithError(err).Error("Failed to add user to attendance")
			return err
		}
	} else {
		update := bson.M{"$inc": bson.M{"Number_Attended": 1}}
		_, err = collection.UpdateOne(ctx, filter, update)
		if err != nil {
			logrus.WithError(err).Error("Failed to update attendance")
			return err
		}
	}
	return nil
}

func GetAnalyticsOnHours(ctx *gin.Context, appsession *models.AppSession, email string, filter models.OfficeHoursFilterStruct, calculate string) ([]primitive.M, int64, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return nil, 0, errors.New("database is nil")
	}

	// Prepare the aggregate
	var pipeline bson.A
	switch calculate {
	case "hoursbyday":
		pipeline = analytics.GroupOfficeHoursByDay(email, filter)
	case "hoursbyweekday":
		pipeline = analytics.AverageOfficeHoursByWeekday(email, filter)
	case "ratio":
		pipeline = analytics.RatioInOutOfficeByWeekday(email, filter)
	case "peakhours":
		pipeline = analytics.BusiestHoursByWeekday(email, filter)
	case "most":
		pipeline = analytics.LeastMostInOfficeWorker(email, filter, false)
	case "least":
		pipeline = analytics.LeastMostInOfficeWorker(email, filter, true)
	case "arrivaldeparture":
		pipeline = analytics.AverageArrivalAndDepartureTimesByWeekday(email, filter)
	case "inofficehours":
		pipeline = analytics.CalculateInOfficeRate(email, filter)
	default:
		return nil, 0, errors.New("invalid calculate value")
	}

	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("OfficeHoursArchive")

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		logrus.Error(err)
		return nil, 0, err
	}

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		logrus.WithError(err).Error("Failed to get hours")
		return nil, 0, err
	}

	mongoFilter := MakeEmailAndTimeFilter(email, filter)

	// count documents
	totalResults, err := collection.CountDocuments(ctx, mongoFilter)
	if err != nil {
		logrus.WithError(err).Error("Failed to count documents")
		return nil, 0, err
	}

	return results, totalResults, nil
}
