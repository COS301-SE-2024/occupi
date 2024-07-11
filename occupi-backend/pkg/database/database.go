package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
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

// Retrieves bookings associated with a user
func GetUserBookings(ctx *gin.Context, appsession *models.AppSession, email string) ([]models.Booking, error) {
	// Get the bookings for the user
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("RoomBooking")
	filter := bson.M{
		"$or": []bson.M{
			{"emails": bson.M{"$elemMatch": bson.M{"$eq": email}}},
			{"creator": email},
		},
	}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		logrus.Error(err)
		return nil, err
	}
	defer cursor.Close(ctx)
	var bookings []models.Booking
	for cursor.Next(ctx) {
		var booking models.Booking
		if err := cursor.Decode(&booking); err != nil {
			logrus.Error(err)
			return nil, err
		}
		bookings = append(bookings, booking)
	}
	return bookings, nil
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
	if appsession.Cache != nil {
		// Check if a user exists in the cache with this email
		if _, err := appsession.Cache.Get(email); err == nil {
			return true
		}
	}
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false
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

	// Add the user to the cache if cache is not nil
	if appsession.Cache != nil {
		if userData, err := bson.Marshal(user); err != nil {
			logrus.Error("Failed to marshall user: ", err)
		} else {
			if err := appsession.Cache.Set(user.Email, userData); err != nil {
				logrus.Error("Failed to set key: ", err)
			}
		}
	}

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
func AddUser(ctx *gin.Context, appsession *models.AppSession, user models.RequestUser) (bool, error) {
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
	}
	// Save the user to the database
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	_, err := collection.InsertOne(ctx, userStruct)
	if err != nil {
		logrus.Error(err)
		return false, err
	}
	// Add the user to the cache if cache is not nil
	if appsession.Cache != nil {
		if userData, err := bson.Marshal(userStruct); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(user.Email, userData); err != nil {
				logrus.Error(err)
			}
		}
	}

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
	if appsession.Cache != nil {
		if otpData, err := bson.Marshal(otpStruct); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(email+otp, otpData); err != nil {
				logrus.Error(err)
			}
		}
	}

	return true, nil
}

// checks if otp exists in database
func OTPExists(ctx *gin.Context, appsession *models.AppSession, email string, otp string) (bool, error) {
	// check if otp exists in the cache if cache is not nil
	if appsession.Cache != nil {
		// unmarshal the user from the cache
		var otpStruct models.OTP
		otpData, err := appsession.Cache.Get(email + otp)
		if err != nil {
			logrus.Error("key does not exist: ", err)
		} else {
			if err := bson.Unmarshal(otpData, &otpStruct); err != nil {
				logrus.Error("failed to unmarshall", err)
			} else {
				if time.Now().After(otpStruct.ExpireWhen) {
					return false, nil
				}
				return true, nil
			}
		}
	}

	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
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
	if appsession.Cache != nil {
		if otpData, err := bson.Marshal(otpStruct); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(email+otp, otpData); err != nil {
				logrus.Error(err)
			}
		}
	}

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
	if appsession.Cache != nil {
		if err := appsession.Cache.Delete(email + otp); err != nil {
			logrus.Error(err) // the otp may also not xist in the cache which is valid behaviour
		}
	}

	return true, nil
}

// GetResetOTP retrieves the OTP for the given email and OTP from the database
func GetResetOTP(ctx *gin.Context, db *mongo.Client, email, otp string) (*models.OTP, error) {
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
func VerifyUser(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Verify the user in the database and set next date to verify to 30 days from now
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"isVerified": true, "nextVerificationDate": time.Now().AddDate(0, 0, 30)}}
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error(err)
		return false, err
	}

	// if user is in cache, update the user in the cache
	if appsession.Cache == nil {
		return true, nil
	}

	var user models.User
	userData, err := appsession.Cache.Get(email)
	if err != nil {
		logrus.Error(err)
		return true, nil
	}

	if err := bson.Unmarshal(userData, &user); err != nil {
		logrus.Error(err)
		return true, nil
	}

	user.IsVerified = true
	user.NextVerificationDate = time.Now().AddDate(0, 0, 30)
	if userData, err := bson.Marshal(user); err == nil {
		if err := appsession.Cache.Set(email, userData); err != nil {
			logrus.Error(err)
		}
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
	if appsession.Cache != nil {
		// unmarshal the user from the cache
		var user models.User
		userData, err := appsession.Cache.Get(email)
		if err != nil {
			logrus.Error("key does not exist: ", err)
		} else {
			if err := bson.Unmarshal(userData, &user); err != nil {
				logrus.Error("failed to unmarshall", err)
			} else {
				return user.Password, nil
			}
		}
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
	if appsession.Cache != nil {
		if userData, err := bson.Marshal(user); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(user.Email, userData); err != nil {
				logrus.Error(err)
			}
		}
	}

	return user.Password, nil
}

// checks if the next verification date is due
func CheckIfNextVerificationDateIsDue(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Get the user from the cache if cache is not nil
	if appsession.Cache != nil {
		// unmarshal the user from the cache
		var user models.User
		userData, err := appsession.Cache.Get(email)
		if err != nil {
			logrus.Error(err)
		} else {
			if err := bson.Unmarshal(userData, &user); err != nil {
				logrus.Error(err)
			} else {
				if time.Now().After(user.NextVerificationDate) {
					_, err := UpdateVerificationStatusTo(ctx, appsession, email, false)
					if err != nil {
						logrus.Error(err)
						return false, err
					}
					return true, nil
				}
				return false, nil
			}
		}
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
	if appsession.Cache != nil {
		if userData, err := bson.Marshal(user); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(user.Email, userData); err != nil {
				logrus.Error(err)
			}
		}
	}

	if time.Now().After(user.NextVerificationDate) {
		_, err := UpdateVerificationStatusTo(ctx, appsession, email, false)
		if err != nil {
			logrus.Error(err)
			return false, err
		}
		return true, nil
	}
	return false, nil
}

// checks if the user is verified
func CheckIfUserIsVerified(ctx *gin.Context, appsession *models.AppSession, email string) (bool, error) {
	// check if database is nil
	if appsession.DB == nil {
		logrus.Error("Database is nil")
		return false, errors.New("database is nil")
	}

	// Check if the user is verified in the cache if cache is not nil
	if appsession.Cache != nil {
		// unmarshal the user from the cache
		var user models.User
		userData, err := appsession.Cache.Get(email)
		if err != nil {
			logrus.Error(err)
		} else {
			if err := bson.Unmarshal(userData, &user); err != nil {
				logrus.Error(err)
			} else {
				return user.IsVerified, nil
			}
		}
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
	if appsession.Cache != nil {
		if userData, err := bson.Marshal(user); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(user.Email, userData); err != nil {
				logrus.Error(err)
			}
		}
	}

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
	if appsession.Cache == nil {
		logrus.Error("Cache is nil")
		return true, nil
	}

	var user models.User
	userData, err := appsession.Cache.Get(email)
	if err != nil {
		logrus.Error(err)
		return true, nil
	}

	if err := bson.Unmarshal(userData, &user); err != nil {
		logrus.Error(err)
		return true, nil
	}

	user.IsVerified = status
	if userData, err := bson.Marshal(user); err == nil {
		if err := appsession.Cache.Set(email, userData); err != nil {
			logrus.Error(err)
		}
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

// Gets all rooms available for booking
func GetAllRooms(ctx *gin.Context, appsession *models.AppSession, floorNo string) ([]models.Room, error) {
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Rooms")

	var cursor *mongo.Cursor
	var err error

	// findOptions := options.Find()
	// findOptions.SetLimit(10)       // Limit the results to 10
	// findOptions.SetSkip(int64(10)) // Skip the specified number of documents for pagination

	// Find all rooms on the specified floor
	filter := bson.M{"floorNo": floorNo}
	// cursor, err = collection.Find(context.TODO(), filter, findOptions)
	cursor, err = collection.Find(context.TODO(), filter)

	if err != nil {
		logrus.Error(err)
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var rooms []models.Room
	for cursor.Next(context.TODO()) {
		var room models.Room
		if err := cursor.Decode(&room); err != nil {
			logrus.Error(err)
			return nil, err
		}
		rooms = append(rooms, room)
	}

	if err := cursor.Err(); err != nil {
		logrus.Error(err)
		return nil, err
	}

	return rooms, nil
}

// Get user information
func GetUserDetails(ctx *gin.Context, appsession *models.AppSession, email string) (models.UserDetails, error) {
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")

	filter := bson.M{"email": email}
	var user models.UserDetails
	err := collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		logrus.Error(err)
		return models.UserDetails{}, err
	}
	return user, nil
}

// AddFieldToUpdateMap adds a field to the update map if it's non-zero or non-nil
func AddFieldToUpdateMap(updateFields bson.M, fieldName string, fieldValue interface{}) {
	switch value := fieldValue.(type) {
	case string:
		if value != "" {
			updateFields[fieldName] = value
		}
	case bool:
		updateFields[fieldName] = value
	case *bool:
		if value != nil {
			updateFields[fieldName] = *value
		}
	case time.Time:
		if !value.IsZero() {
			updateFields[fieldName] = value
		}
	case *models.Details:
		if value != nil {
			nestedFields := bson.M{}
			AddFieldToUpdateMap(nestedFields, "contactNo", value.ContactNo)
			AddFieldToUpdateMap(nestedFields, "name", value.Name)
			AddFieldToUpdateMap(nestedFields, "dob", value.DOB)
			AddFieldToUpdateMap(nestedFields, "gender", value.Gender)
			AddFieldToUpdateMap(nestedFields, "pronouns", value.Pronouns)
			if len(nestedFields) > 0 {
				updateFields[fieldName] = nestedFields
			}
		}
	case *models.Notifications:
		if value != nil {
			nestedFields := bson.M{}
			AddFieldToUpdateMap(nestedFields, "allow", value.Allow)
			AddFieldToUpdateMap(nestedFields, "bookingReminder", value.BookingReminder)
			AddFieldToUpdateMap(nestedFields, "maxCapacity", value.MaxCapacity)
			if len(nestedFields) > 0 {
				updateFields[fieldName] = nestedFields
			}
		}
	case *models.Security:
		if value != nil {
			nestedFields := bson.M{}
			AddFieldToUpdateMap(nestedFields, "mfa", value.MFA)
			AddFieldToUpdateMap(nestedFields, "biometrics", value.Biometrics)
			if len(nestedFields) > 0 {
				updateFields[fieldName] = nestedFields
			}
		}
	}
}

// UpdateUserDetails updates the user's details
func UpdateUserDetails(ctx *gin.Context, appsession *models.AppSession, user models.UserDetails) (bool, error) {
	collection := appsession.DB.Database(configs.GetMongoDBName()).Collection("Users")
	filter := bson.M{"email": user.Email}

	var userStruct models.UserDetails
	err := collection.FindOne(context.TODO(), filter).Decode(&userStruct)
	if err != nil {
		logrus.Error("Failed to find user: ", err)
		return false, err
	}

	updateFields := bson.M{}
	AddFieldToUpdateMap(updateFields, "occupiId", user.OccupiID)
	AddFieldToUpdateMap(updateFields, "password", user.Password)
	AddFieldToUpdateMap(updateFields, "email", user.Email)
	AddFieldToUpdateMap(updateFields, "role", user.Role)
	AddFieldToUpdateMap(updateFields, "onSite", user.OnSite)
	AddFieldToUpdateMap(updateFields, "isVerified", user.IsVerified)
	AddFieldToUpdateMap(updateFields, "nextVerificationDate", user.NextVerificationDate)
	AddFieldToUpdateMap(updateFields, "details", user.Details)
	AddFieldToUpdateMap(updateFields, "notifications", user.Notifications)
	AddFieldToUpdateMap(updateFields, "security", user.Security)
	AddFieldToUpdateMap(updateFields, "status", user.Status)
	AddFieldToUpdateMap(updateFields, "position", user.Position)

	update := bson.M{"$set": updateFields}
	_, err = collection.UpdateOne(ctx, filter, update)
	if err != nil {
		logrus.Error("Failed to update user details: ", err)
		return false, err
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
	if appsession.Cache != nil {
		// unmarshal the user from the cache
		var user models.User
		userData, err := appsession.Cache.Get(email)
		if err != nil {
			logrus.Error(err)
		} else {
			if err := bson.Unmarshal(userData, &user); err != nil {
				logrus.Error(err)
			} else {
				return user.Role == constants.Admin, nil
			}
		}
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
	if appsession.Cache != nil {
		if userData, err := bson.Marshal(user); err != nil {
			logrus.Error(err)
		} else {
			if err := appsession.Cache.Set(user.Email, userData); err != nil {
				logrus.Error(err)
			}
		}
	}

	return user.Role == constants.Admin, nil
}

// AddResetToken adds a reset token to the database
func AddResetToken(ctx *gin.Context, db *mongo.Client, email string, resetToken string, expirationTime time.Time) (bool, error) {
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
func GetEmailByResetToken(ctx *gin.Context, db *mongo.Client, resetToken string) (string, error) {
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

// ClearResetToken removes the reset token from the database
func ClearResetToken(ctx *gin.Context, appSession *models.AppSession, email string, token string) (bool, error) {
    collection := appSession.DB.Database("Occupi").Collection("ResetTokens")
    filter := bson.M{"email": email, "token": token}
    _, err := collection.DeleteOne(ctx, filter)
    if err != nil {
        logrus.Error(err)
        return false, err
    }

    // Clear from cache
    if appSession.Cache != nil {
        cacheKey := "reset_token:" + email
        err = appSession.Cache.Delete(cacheKey)
        if err != nil {
            logrus.Error("Failed to delete reset token from cache:", err)
        }
    }

    return true, nil
}


// ValidateResetToken validates the reset token
func ValidateResetToken(ctx *gin.Context, appSession *models.AppSession, email, token string) (bool, string, error) {
    cacheKey := "reset_token:" + email

    // Check cache first
    if appSession.Cache != nil {
        cachedToken, err := appSession.Cache.Get(cacheKey)
        if err == nil && string(cachedToken) == token {
            return true, "", nil
        }
    }

    // If not in cache, check database
    var resetToken models.ResetToken
    collection := appSession.DB.Database("Occupi").Collection("ResetTokens")
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

    // Cache the valid token
    if appSession.Cache != nil {
        err = appSession.Cache.Set(cacheKey, []byte(token))
        if err != nil {
            logrus.Error("Failed to cache reset token:", err)
        }
    }

    return true, "", nil
}

// SaveTwoFACode saves the 2FA code for a user
func SaveTwoFACode(ctx *gin.Context, appSession *models.AppSession, email, code string) error {
    collection := appSession.DB.Database("Occupi").Collection("Users")
    filter := bson.M{"email": email}
    update := bson.M{
        "$set": bson.M{
            "twoFACode": code,
            "twoFACodeExpiry": time.Now().Add(10 * time.Minute),
        },
    }
    _, err := collection.UpdateOne(ctx, filter, update)
    if err != nil {
        return err
    }

    // Cache the 2FA code
    if appSession.Cache != nil {
        cacheKey := "2fa_code:" + email
        err = appSession.Cache.Set(cacheKey, []byte(code))
        if err != nil {
            logrus.Error("Failed to cache 2FA code:", err)
        }
    }

    return nil
}

// VerifyTwoFACode checks if the provided 2FA code is valid for the user
func VerifyTwoFACode(ctx *gin.Context, appSession *models.AppSession, email, code string) (bool, error) {
    cacheKey := "2fa_code:" + email

    // Check cache first
    if appSession.Cache != nil {
        cachedCode, err := appSession.Cache.Get(cacheKey)
        if err == nil && string(cachedCode) == code {
            return true, nil
        }
    }

    // If not in cache or doesn't match, check database
    collection := appSession.DB.Database("Occupi").Collection("Users")
    filter := bson.M{
        "email": email,
        "twoFACode": code,
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
func IsTwoFAEnabled(ctx *gin.Context, appSession *models.AppSession, email string) (bool, error) {
    cacheKey := "2fa_enabled:" + email

    // Check cache first
    if appSession.Cache != nil {
        cachedValue, err := appSession.Cache.Get(cacheKey)
        if err == nil {
            return string(cachedValue) == "true", nil
        }
    }

    // If not in cache, check database
    collection := appSession.DB.Database("Occupi").Collection("Users")
    filter := bson.M{"email": email}
    var user models.User
    err := collection.FindOne(ctx, filter).Decode(&user)
    if err != nil {
        return false, err
    }

    // Cache the result
    if appSession.Cache != nil {
        cacheValue := "false"
        if user.TwoFAEnabled {
            cacheValue = "true"
        }
        err = appSession.Cache.Set(cacheKey, []byte(cacheValue))
        if err != nil {
            logrus.Error("Failed to cache 2FA enabled status:", err)
        }
    }

    return user.TwoFAEnabled, nil
}

// SetTwoFAEnabled sets the 2FA enabled status for a user
func SetTwoFAEnabled(ctx *gin.Context, appSession *models.AppSession, email string, enabled bool) error {
    collection := appSession.DB.Database("Occupi").Collection("Users")
    filter := bson.M{"email": email}
    update := bson.M{"$set": bson.M{"twoFAEnabled": enabled}}

    _, err := collection.UpdateOne(ctx, filter, update)
    if err != nil {
        return err
    }

    // Update cache
    if appSession.Cache != nil {
        cacheKey := "2fa_enabled:" + email
        cacheValue := "false"
        if enabled {
            cacheValue = "true"
        }
        err = appSession.Cache.Set(cacheKey, []byte(cacheValue))
        if err != nil {
            logrus.Error("Failed to update 2FA enabled status in cache:", err)
        }
    }

    return nil
}