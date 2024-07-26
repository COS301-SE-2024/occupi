package cache

import (
	"errors"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

func GetUser(appsession *models.AppSession, email string) (models.User, error) {
	if appsession.Cache == nil {
		return models.User{}, errors.New("cache not found")
	}

	// unmarshal the user from the cache
	var user models.User
	userData, err := appsession.Cache.Get(UserKey(email))

	if err != nil {
		logrus.Error("key does not exist: ", err)
		return models.User{}, err
	}

	if err := bson.Unmarshal(userData, &user); err != nil {
		logrus.Error("failed to unmarshall", err)
		return models.User{}, err
	}

	return user, nil
}

func SetUser(appsession *models.AppSession, user models.User) {
	if appsession.Cache == nil {
		return
	}

	// marshal the user
	userData, err := bson.Marshal(user)
	if err != nil {
		logrus.Error("failed to marshall", err)
		return
	}

	// set the user in the cache
	if err := appsession.Cache.Set(UserKey(user.Email), userData); err != nil {
		logrus.Error("failed to set user in cache", err)
		return
	}
}

func DeleteUser(appsession *models.AppSession, email string) {
	if appsession.Cache == nil {
		return
	}

	// delete the user from the cache
	if err := appsession.Cache.Delete(UserKey(email)); err != nil {
		logrus.Error("failed to delete user from cache", err)
		return
	}
}

func GetOTP(appsession *models.AppSession, email string, otp string) (models.OTP, error) {
	if appsession.Cache == nil {
		return models.OTP{}, errors.New("cache not found")
	}

	// unmarshal the otp from the cache
	var otpData models.OTP
	otpDataBytes, err := appsession.Cache.Get(OTPKey(email, otp))

	if err != nil {
		logrus.Error("key does not exist: ", err)
		return models.OTP{}, err
	}

	if err := bson.Unmarshal(otpDataBytes, &otpData); err != nil {
		logrus.Error("failed to unmarshall", err)
		return models.OTP{}, err
	}

	return otpData, nil
}

func SetOTP(appsession *models.AppSession, otpData models.OTP) {
	if appsession.Cache == nil {
		return
	}

	// marshal the otp
	otpDataBytes, err := bson.Marshal(otpData)
	if err != nil {
		logrus.Error("failed to marshall", err)
		return
	}

	// set the otp in the cache
	if err := appsession.Cache.Set(OTPKey(otpData.Email, otpData.OTP), otpDataBytes); err != nil {
		logrus.Error("failed to set otp in cache", err)
		return
	}
}

func DeleteOTP(appsession *models.AppSession, email string, otp string) {
	if appsession.Cache == nil {
		return
	}

	// delete the otp from the cache
	if err := appsession.Cache.Delete(OTPKey(email, otp)); err != nil {
		logrus.Error("failed to delete otp from cache", err)
		return
	}
}

func SetBooking(appsession *models.AppSession, booking models.Booking) {
	if appsession.Cache == nil {
		return
	}

	// marshal the booking
	bookingData, err := bson.Marshal(booking)
	if err != nil {
		logrus.Error("failed to marshall", err)
		return
	}

	// set the booking in the cache
	if err := appsession.Cache.Set(RoomBookingKey(booking.OccupiID), bookingData); err != nil {
		logrus.Error("failed to set booking in cache", err)
		return
	}
}

func GetBooking(appsession *models.AppSession, bookingID string) (models.Booking, error) {
	if appsession.Cache == nil {
		return models.Booking{}, errors.New("cache not found")
	}

	// unmarshal the booking from the cache
	var booking models.Booking
	bookingData, err := appsession.Cache.Get(RoomBookingKey(bookingID))

	if err != nil {
		logrus.Error("key does not exist: ", err)
		return models.Booking{}, err
	}

	if err := bson.Unmarshal(bookingData, &booking); err != nil {
		logrus.Error("failed to unmarshall", err)
		return models.Booking{}, err
	}

	return booking, nil
}

func DeleteBooking(appsession *models.AppSession, bookingID string) {
	if appsession.Cache == nil {
		return
	}

	// delete the booking from the cache
	if err := appsession.Cache.Delete(RoomBookingKey(bookingID)); err != nil {
		logrus.Error("failed to delete booking from cache", err)
		return
	}
}

func GetImage(appsession *models.AppSession, id string) (models.Image, error) {
	if appsession.Cache == nil {
		return models.Image{}, errors.New("cache not found")
	}

	//unmarshal the image from the cache
	var image models.Image
	imageData, err := appsession.Cache.Get(ImageKey(id))

	if err != nil {
		logrus.Error("key does not exist: ", err)
		return models.Image{}, err
	}

	if err := bson.Unmarshal(imageData, &image); err != nil {
		logrus.Error("Failed to unmarshall", err)
		return models.Image{}, err
	}

	return image, nil
}

func SetImage(appsession *models.AppSession, id string, image models.Image) {
	if appsession.Cache == nil {
		return
	}

	// marshal the image
	imageData, err := bson.Marshal(image)
	if err != nil {
		logrus.Error("failed to marshall", err)
		return
	}

	// set the image in the cache
	if err := appsession.Cache.Set(ImageKey(id), imageData); err != nil {
		logrus.Error("failed to set user in cache", err)
		return
	}
}

func DeleteImage(appsession *models.AppSession, id string) {
	if appsession.Cache == nil {
		return
	}

	// delete the image from the cache
	if err := appsession.Cache.Delete(ImageKey(id)); err != nil {
		logrus.Error("failed to delete image from cache", err)
		return
	}
}
