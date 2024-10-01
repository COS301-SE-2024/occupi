package cache

import (
	"context"
	"errors"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
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
	res := appsession.Cache.Get(context.Background(), UserKey(email))

	if res.Err() != nil {
		logrus.Error("key does not exist: ", res.Err())
		return models.User{}, res.Err()
	}

	userData, err := res.Bytes()

	if err != nil {
		logrus.Error("failed to get bytes", err)
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
	res := appsession.Cache.Set(context.Background(), UserKey(user.Email), userData, time.Duration(configs.GetCacheEviction())*time.Second)

	if res.Err() != nil {
		logrus.Error("failed to set user in cache", res.Err())
	}
}

func DeleteUser(appsession *models.AppSession, email string) {
	if appsession.Cache == nil {
		return
	}

	// delete the user from the cache
	res := appsession.Cache.Del(context.Background(), UserKey(email))

	if res.Err() != nil {
		logrus.Error("failed to delete user from cache", res.Err())
	}
}

func GetOTP(appsession *models.AppSession, email string, otp string) (models.OTP, error) {
	if appsession.Cache == nil {
		return models.OTP{}, errors.New("cache not found")
	}

	// unmarshal the otp from the cache
	var otpData models.OTP
	res := appsession.Cache.Get(context.Background(), OTPKey(email, otp))

	if res.Err() != nil {
		logrus.Error("key does not exist: ", res.Err())
		return models.OTP{}, res.Err()
	}

	otpDataBytes, err := res.Bytes()

	if err != nil {
		logrus.Error("failed to get bytes", err)
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
	res := appsession.Cache.Set(context.Background(), OTPKey(otpData.Email, otpData.OTP), otpDataBytes, time.Duration(configs.GetCacheEviction())*time.Second)

	if res.Err() != nil {
		logrus.Error("failed to set otp in cache", res.Err())
	}
}

func DeleteOTP(appsession *models.AppSession, email string, otp string) {
	if appsession.Cache == nil {
		return
	}

	// delete the otp from the cache
	res := appsession.Cache.Del(context.Background(), OTPKey(email, otp))

	if res.Err() != nil {
		logrus.Error("failed to delete otp from cache", res.Err())
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
	res := appsession.Cache.Set(context.Background(), RoomBookingKey(booking.OccupiID), bookingData, time.Duration(configs.GetCacheEviction())*time.Second)

	if res.Err() != nil {
		logrus.Error("failed to set booking in cache", err)
	}
}

func GetBooking(appsession *models.AppSession, bookingID string) (models.Booking, error) {
	if appsession.Cache == nil {
		return models.Booking{}, errors.New("cache not found")
	}

	// unmarshal the booking from the cache
	var booking models.Booking
	res := appsession.Cache.Get(context.Background(), RoomBookingKey(bookingID))

	if res.Err() != nil {
		logrus.Error("key does not exist: ", res.Err())
		return models.Booking{}, res.Err()
	}

	bookingData, err := res.Bytes()

	if err != nil {
		logrus.Error("failed to get bytes", err)
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
	res := appsession.Cache.Del(context.Background(), RoomBookingKey(bookingID))

	if res.Err() != nil {
		logrus.Error("failed to delete booking from cache", res.Err())
	}
}

func SetSession(appsession *models.AppSession, session models.WebAuthnSession, uuid string) error {
	if appsession.SessionCache == nil {
		return errors.New("cache not found")
	}

	// marshal the session
	sessionData, err := bson.Marshal(session)
	if err != nil {
		logrus.Error("failed to marshall", err)
		return err
	}

	// set the session in the cache
	if err := appsession.SessionCache.Set(SessionKey(uuid), sessionData); err != nil {
		logrus.Error("failed to set session in cache", err)
		return err
	}

	return nil
}

func GetSession(appsession *models.AppSession, uuid string) (*models.WebAuthnSession, error) {
	if appsession.SessionCache == nil {
		return nil, errors.New("cache not found")
	}

	// unmarshal the session from the cache
	var session models.WebAuthnSession
	sessionData, err := appsession.SessionCache.Get(SessionKey(uuid))

	if err != nil {
		logrus.Error("key does not exist: ", err)
		return nil, err
	}

	if err := bson.Unmarshal(sessionData, &session); err != nil {
		logrus.Error("failed to unmarshall", err)
		return nil, err
	}

	return &session, nil
}

func DeleteSession(appsession *models.AppSession, uuid string) {
	if appsession.SessionCache == nil {
		return
	}

	// delete the session from the cache
	if err := appsession.SessionCache.Delete(SessionKey(uuid)); err != nil {
		logrus.Error("failed to delete session from cache", err)
		return
	}
}

func CanMakeLogin(appsession *models.AppSession, email string) (bool, error) {
	if appsession.Cache == nil {
		return false, errors.New("cache not found")
	}

	var eviction time.Duration
	if configs.GetGinRunMode() == "test" {
		eviction = 2 * time.Second
	} else {
		eviction = 24 * time.Hour
	}

	// check if the user can make a login request
	res := appsession.Cache.Get(context.Background(), LoginKey(email))

	if res.Err() != nil {
		// add the user to the cache with a value of 1 and evict after one day
		// set the image in the cache
		res1 := appsession.Cache.Set(context.Background(), LoginKey(email), 1, eviction)

		if res1.Err() != nil {
			logrus.Error("failed to set user in cache", res1.Err())
			return false, res1.Err()
		}

		return true, nil
	}

	// check if the user has made more than 5 login requests
	loginCount, err := res.Int()

	if err != nil {
		return false, err
	}

	// Check if the value is less than 5
	if loginCount < 5 {
		// Increment the value
		loginCount += 1

		// Set the new value with the same expiration time (24 hours)
		err = appsession.Cache.Set(context.Background(), LoginKey(email), loginCount, eviction).Err()
		if err != nil {
			return false, err
		}

		return true, nil
	}

	return false, nil
}

func GetMobileUser(appsession *models.AppSession, email string) (models.MobileUser, error) {
	if appsession.MobileCache == nil {
		return models.MobileUser{}, errors.New("cache not found")
	}

	// unmarshal the user from the cache
	var user models.MobileUser
	res := appsession.MobileCache.Get(context.Background(), MobileUserKey(email))

	if res.Err() != nil {
		logrus.Error("key does not exist: ", res.Err())
		return models.MobileUser{}, res.Err()
	}

	userData, err := res.Bytes()

	if err != nil {
		logrus.Error("failed to get bytes", err)
		return models.MobileUser{}, err
	}

	if err := bson.Unmarshal(userData, &user); err != nil {
		logrus.Error("failed to unmarshall", err)
		return models.MobileUser{}, err
	}

	return user, nil
}

func SetMobileUser(appsession *models.AppSession, user models.MobileUser) {
	if appsession.MobileCache == nil {
		return
	}

	// marshal the user
	userData, err := bson.Marshal(user)
	if err != nil {
		logrus.Error("failed to marshall", err)
		return
	}

	// set the user in the cache
	res := appsession.MobileCache.Set(context.Background(), MobileUserKey(user.Email), userData, 0)

	if res.Err() != nil {
		logrus.Error("failed to set user in cache", res.Err())
	}
}

func DeleteMobileUser(appsession *models.AppSession, email string) {
	if appsession.MobileCache == nil {
		return
	}

	// delete the user from the cache
	res := appsession.MobileCache.Del(context.Background(), MobileUserKey(email))

	if res.Err() != nil {
		logrus.Error("failed to delete user from cache", res.Err())
	}
}
