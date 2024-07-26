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

			if tt.name != "cache is nil" {

				// check if user was deleted in cache
				userData, err := appsession.Cache.Get(cache.UserKey(email))
				assert.NotNil(t, err)
				assert.Nil(t, userData)
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

			if tt.name != "cache is nil" {
				// check if otp was deleted in cache
				otpData, err := appsession.Cache.Get(cache.OTPKey(email, otpv))
				assert.NotNil(t, err)
				assert.Nil(t, otpData)
			}
		})
	}
}
