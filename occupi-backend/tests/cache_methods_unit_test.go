package tests

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func TestUserKey(t *testing.T) {
	email := "test@example.com"
	expected := "Users:test@example.com"
	result := cache.UserKey(email)
	if result != expected {
		t.Errorf("UserKey(%s) = %s; want %s", email, result, expected)
	}
}

func TestOTPKey(t *testing.T) {
	email := "test@example.com"
	otp := "123456"
	expected := "OTPs:test@example.com:123456"
	result := cache.OTPKey(email, otp)
	if result != expected {
		t.Errorf("OTPKey(%s, %s) = %s; want %s", email, otp, result, expected)
	}
}

func TestRoomBookingKey(t *testing.T) {
	roomID := "room123"
	expected := "RoomBookings:room123"
	result := cache.RoomBookingKey(roomID)
	if result != expected {
		t.Errorf("RoomBookingKey(%s) = %s; want %s", roomID, result, expected)
	}
}

func TestImageKey(t *testing.T) {
	imageID := "image123"
	expected := "Images:image123"
	result := cache.ImageKey(imageID)
	if result != expected {
		t.Errorf("ImageKey(%s) = %s; want %s", imageID, result, expected)
	}
}

func TestGetUser(t *testing.T) {
	email := "test@example.com"
	user := models.User{Email: email}
	userData, _ := bson.Marshal(user)

	tests := []struct {
		name         string
		email        string
		expectedUser models.User
		expectedErr  error
	}{
		{
			name:         "cache is nil",
			email:        email,
			expectedUser: models.User{},
			expectedErr:  errors.New("cache not found"),
		},
		{
			name:         "cache key does not exist",
			email:        "test1@example.com",
			expectedUser: models.User{},
			expectedErr:  errors.New("Entry not found"),
		},
		{
			name:         "successful get user from cache",
			email:        email,
			expectedUser: user,
			expectedErr:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			// add user to cache
			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
				err := appsession.Cache.Set(cache.UserKey(email), userData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			result, err := cache.GetUser(appsession, tt.email)

			assert.Equal(t, tt.expectedUser, result)
			if tt.expectedErr != nil {
				assert.EqualError(t, err, tt.expectedErr.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSetUser(t *testing.T) {
	email := "test@example.com"
	user := models.User{Email: email}

	tests := []struct {
		name         string
		user         models.User
		expectedUser models.User
	}{
		{
			name:         "cache is nil",
			user:         user,
			expectedUser: models.User{},
		},
		{
			name:         "successful set user in cache",
			user:         user,
			expectedUser: user,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetUser(appsession, tt.user)

			if tt.name != "cache is nil" {

				// check if user was set in cache
				userData, err := appsession.Cache.Get(cache.UserKey(email))
				assert.NoError(t, err)

				// unmarshal the user from the cache
				var user models.User
				if err := bson.Unmarshal(userData, &user); err != nil {
					t.Error("failed to unmarshall", err)
				}

				assert.Equal(t, tt.expectedUser, user)
			}
		})
	}
}

func TestDeleteUser(t *testing.T) {
	email := "test@example.com"
	user := models.User{Email: email}

	tests := []struct {
		name         string
		email        string
		expectedUser models.User
	}{
		{
			name:         "cache is nil",
			email:        email,
			expectedUser: models.User{},
		},
		{
			name:         "successful delete user in cache",
			email:        email,
			expectedUser: models.User{},
		},
		{
			name:         "cache key does not exist",
			email:        "doesnotexist@example.com",
			expectedUser: models.User{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}

				// add user to cache
				userData, _ := bson.Marshal(user)
				err := appsession.Cache.Set(cache.UserKey(email), userData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteUser(appsession, tt.email)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {

				// check if user was deleted in cache
				userData, err := appsession.Cache.Get(cache.UserKey(email))
				assert.NotNil(t, err)
				assert.Nil(t, userData)
			}

			if tt.name == "cache key does not exist" {
				// check if user was not deleted in cache
				userData, err := appsession.Cache.Get(cache.UserKey(email))
				assert.NoError(t, err)
				assert.NotNil(t, userData)
			}
		})
	}
}

func TestGetOTP(t *testing.T) {
	email := "test@example.com"
	otpv := "123456"
	otp := models.OTP{Email: email, OTP: otpv}
	otpData, _ := bson.Marshal(otp)

	tests := []struct {
		name        string
		email       string
		expectedOTP models.OTP
		expectedErr error
	}{
		{
			name:        "cache is nil",
			email:       email,
			expectedOTP: models.OTP{},
			expectedErr: errors.New("cache not found"),
		},
		{
			name:        "cache key does not exist",
			email:       "test1@example.com",
			expectedOTP: models.OTP{},
			expectedErr: errors.New("Entry not found"),
		},
		{
			name:        "successful get otp from cache",
			email:       email,
			expectedOTP: otp,
			expectedErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			// add otp to cache
			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
				err := appsession.Cache.Set(cache.OTPKey(email, otpv), otpData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			result, err := cache.GetOTP(appsession, tt.email, otpv)

			assert.Equal(t, tt.expectedOTP, result)
			if tt.expectedErr != nil {
				assert.EqualError(t, err, tt.expectedErr.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestSetOTP(t *testing.T) {
	email := "test@example.com"
	otpv := "123456"
	otp := models.OTP{Email: email, OTP: otpv}

	tests := []struct {
		name        string
		otp         models.OTP
		expectedOTP models.OTP
	}{
		{
			name:        "cache is nil",
			otp:         otp,
			expectedOTP: models.OTP{},
		},
		{
			name: "successful set otp in cache",
			otp:  otp,
			expectedOTP: models.OTP{
				Email: email,
				OTP:   otpv,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetOTP(appsession, tt.otp)

			if tt.name != "cache is nil" {
				// check if otp was set in cache
				otpData, err := appsession.Cache.Get(cache.OTPKey(email, otpv))
				assert.NoError(t, err)

				// unmarshal the otp from the cache
				var otp models.OTP
				if err := bson.Unmarshal(otpData, &otp); err != nil {
					t.Error("failed to unmarshall", err)
				}

				assert.Equal(t, tt.expectedOTP, otp)
			}
		})
	}
}

func TestDeleteOTPF(t *testing.T) {
	email := "test@example.com"
	otpv := "123456"
	otp := models.OTP{Email: email, OTP: otpv}

	tests := []struct {
		name        string
		expectedOTP models.OTP
	}{
		{
			name:        "cache is nil",
			expectedOTP: models.OTP{},
		},
		{
			name: "successful delete otp in cache",
			expectedOTP: models.OTP{
				Email: email,
				OTP:   otpv,
			},
		},
		{
			name: "cache key does not exist",
			expectedOTP: models.OTP{
				Email: "doesnotexist@example.com",
				OTP:   "012345",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}

				// add otp to cache
				otpData, _ := bson.Marshal(otp)
				err := appsession.Cache.Set(cache.OTPKey(email, otpv), otpData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteOTP(appsession, tt.expectedOTP.Email, tt.expectedOTP.OTP)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {
				// check if otp was deleted in cache
				otpData, err := appsession.Cache.Get(cache.OTPKey(email, otpv))
				assert.NotNil(t, err)
				assert.Nil(t, otpData)
			}

			if tt.name == "cache key does not exist" {
				// check if otp was not deleted in cache
				otpData, err := appsession.Cache.Get(cache.OTPKey(email, otpv))
				assert.NoError(t, err)
				assert.NotNil(t, otpData)
			}
		})
	}
}

func TestSetBooking(t *testing.T) {
	booking := models.Booking{OccupiID: "booking123"}

	tests := []struct {
		name            string
		booking         models.Booking
		expectedBooking models.Booking
	}{
		{
			name:            "cache is nil",
			booking:         booking,
			expectedBooking: models.Booking{},
		},
		{
			name:            "successful set booking in cache",
			booking:         booking,
			expectedBooking: booking,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetBooking(appsession, tt.booking)

			if tt.name != "cache is nil" {
				// check if booking was set in cache
				bookingData, err := appsession.Cache.Get(cache.RoomBookingKey(tt.booking.OccupiID))
				assert.NoError(t, err)

				// unmarshal the booking from the cache
				var booking models.Booking
				if err := bson.Unmarshal(bookingData, &booking); err != nil {
					t.Error("failed to unmarshall", err)
				}

				assert.Equal(t, tt.expectedBooking, booking)
			}
		})
	}
}

func TestGetBooking(t *testing.T) {
	booking := models.Booking{OccupiID: "booking123"}
	bookingData, _ := bson.Marshal(booking)

	tests := []struct {
		name         string
		bookingID    string
		expectedBook models.Booking
		expectedErr  error
	}{
		{
			name:         "cache is nil",
			bookingID:    "booking123",
			expectedBook: models.Booking{},
			expectedErr:  errors.New("cache not found"),
		},
		{
			name:         "cache key does not exist",
			bookingID:    "booking1234",
			expectedBook: models.Booking{},
			expectedErr:  errors.New("Entry not found"),
		},
		{
			name:         "successful get booking from cache",
			bookingID:    "booking123",
			expectedBook: booking,
			expectedErr:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			// add booking to cache
			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
				err := appsession.Cache.Set(cache.RoomBookingKey(booking.OccupiID), bookingData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			result, err := cache.GetBooking(appsession, tt.bookingID)

			assert.Equal(t, tt.expectedBook, result)
			if tt.expectedErr != nil {
				assert.EqualError(t, err, tt.expectedErr.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestDeleteBooking(t *testing.T) {
	booking := models.Booking{OccupiID: "booking123"}

	tests := []struct {
		name         string
		bookingID    string
		expectedBook models.Booking
	}{
		{
			name:         "cache is nil",
			bookingID:    "booking123",
			expectedBook: models.Booking{},
		},
		{
			name:         "successful delete booking in cache",
			bookingID:    "booking123",
			expectedBook: models.Booking{},
		},
		{
			name:         "cache key does not exist",
			bookingID:    "booking1234",
			expectedBook: models.Booking{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}

				// add booking to cache
				bookingData, _ := bson.Marshal(booking)
				err := appsession.Cache.Set(cache.RoomBookingKey(booking.OccupiID), bookingData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteBooking(appsession, tt.bookingID)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {
				// check if booking was deleted in cache
				bookingData, err := appsession.Cache.Get(cache.RoomBookingKey(booking.OccupiID))
				assert.NotNil(t, err)
				assert.Nil(t, bookingData)
			}

			if tt.name == "cache key does not exist" {
				// check if booking was not deleted in cache
				bookingData, err := appsession.Cache.Get(cache.RoomBookingKey(booking.OccupiID))
				assert.NoError(t, err)
				assert.NotNil(t, bookingData)
			}
		})
	}
}

func TestSetImage(t *testing.T) {
	image := models.Image{ID: "image123"}

	tests := []struct {
		name          string
		image         models.Image
		expectedImage models.Image
	}{
		{
			name:          "cache is nil",
			image:         image,
			expectedImage: models.Image{},
		},
		{
			name:          "successful set image in cache",
			image:         image,
			expectedImage: image,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetImage(appsession, tt.image.ID, tt.image)

			if tt.name != "cache is nil" {
				// check if image was set in cache
				imageData, err := appsession.Cache.Get(cache.ImageKey(tt.image.ID))
				assert.NoError(t, err)

				// unmarshal the image from the cache
				var image models.Image
				if err := bson.Unmarshal(imageData, &image); err != nil {
					t.Error("failed to unmarshall", err)
				}

				assert.Equal(t, tt.expectedImage, image)
			}
		})
	}
}

func TestGetImage(t *testing.T) {
	image := models.Image{ID: "image123"}
	imageData, _ := bson.Marshal(image)

	tests := []struct {
		name        string
		imageID     string
		expectedImg models.Image
		expectedErr error
	}{
		{
			name:        "cache is nil",
			imageID:     "image123",
			expectedImg: models.Image{},
			expectedErr: errors.New("cache not found"),
		},
		{
			name:        "cache key does not exist",
			imageID:     "image1234",
			expectedImg: models.Image{},
			expectedErr: errors.New("Entry not found"),
		},
		{
			name:        "successful get image from cache",
			imageID:     "image123",
			expectedImg: image,
			expectedErr: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			// add image to cache
			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}
				err := appsession.Cache.Set(cache.ImageKey(image.ID), imageData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			result, err := cache.GetImage(appsession, tt.imageID)

			assert.Equal(t, tt.expectedImg, result)
			if tt.expectedErr != nil {
				assert.EqualError(t, err, tt.expectedErr.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestDeleteImage(t *testing.T) {
	image := models.Image{ID: "image123"}

	tests := []struct {
		name        string
		imageID     string
		expectedImg models.Image
	}{
		{
			name:        "cache is nil",
			imageID:     "image123",
			expectedImg: models.Image{},
		},
		{
			name:        "successful delete image in cache",
			imageID:     "image123",
			expectedImg: models.Image{},
		},
		{
			name:        "cache key does not exist",
			imageID:     "image1234",
			expectedImg: models.Image{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: configs.CreateCache(),
				}

				// add image to cache
				imageData, _ := bson.Marshal(image)
				err := appsession.Cache.Set(cache.ImageKey(image.ID), imageData)

				assert.NoError(t, err)
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteImage(appsession, tt.imageID)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {
				// check if image was deleted in cache
				imageData, err := appsession.Cache.Get(cache.ImageKey(image.ID))
				assert.NotNil(t, err)
				assert.Nil(t, imageData)
			}

			if tt.name == "cache key does not exist" {
				// check if image was not deleted in cache
				imageData, err := appsession.Cache.Get(cache.ImageKey(image.ID))
				assert.NoError(t, err)
				assert.NotNil(t, imageData)
			}
		})
	}
}
