package tests

import (
	"context"
	"errors"
	"testing"

	"github.com/go-redis/redismock/v9"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func TestUserKey(t *testing.T) {
	email := "test@example.com"
	expected := "Users:test@example.com"
	result := cache.UserKey(email)
	if result != expected {
		t.Errorf("cache.UserKey(%s) = %s; want %s", email, result, expected)
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
	// Test case: cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		_, err := cache.GetUser(appsession, "test@example.com")
		if err == nil || err.Error() != "cache not found" {
			t.Errorf("expected error 'cache not found', got: %v", err)
		}
	})

	// Test case: key does not exist in cache
	t.Run("key does not exist", func(t *testing.T) {
		// Mock the Redis client
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Expect the Get command to return a key not found error
		mock.ExpectGet(cache.UserKey("test@example.com")).RedisNil()

		_, err := cache.GetUser(appsession, "test@example.com")
		if err == nil {
			t.Errorf("expected redis.Nil error, got: %v", err)
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test case: res.Bytes() fails
	t.Run("res.Bytes() fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Expect the Get command to succeed, but Bytes() to fail
		mock.ExpectGet(cache.UserKey("test@example.com")).SetVal("invalid_data")

		_, err := cache.GetUser(appsession, "test@example.com")
		if err == nil {
			t.Errorf("expected an error, got nil")
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test case: bson.Unmarshal fails
	t.Run("bson.Unmarshal fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Mock some invalid BSON data
		invalidBson := []byte{0x01, 0x02, 0x03}

		// Expect the Get command to return this invalid BSON data
		mock.ExpectGet(cache.UserKey("test@example.com")).SetVal(string(invalidBson))

		_, err := cache.GetUser(appsession, "test@example.com")
		if err == nil {
			t.Errorf("expected an unmarshalling error, got nil")
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test case: success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Create a sample user and marshal it into BSON
		expectedUser := models.User{Email: "test@example.com"}

		userBson, err := bson.Marshal(expectedUser)
		if err != nil {
			t.Fatalf("failed to marshal user: %v", err)
		}

		// Expect the Get command to return the valid BSON
		mock.ExpectGet(cache.UserKey("test@example.com")).SetVal(string(userBson))

		user, err := cache.GetUser(appsession, "test@example.com")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		// Assert that the user matches the expected user
		assert.Equal(t, expectedUser.Email, user.Email)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

func TestSetUser(t *testing.T) {
	// Test case 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		user := models.User{Email: "test@example.com"}

		// Call SetUser
		cache.SetUser(appsession, user)
		// No assertions needed; we're ensuring it returns without crashing.
	})

	// Test case 2: Marshalling the user fails
	t.Run("marshal fails", func(t *testing.T) {
		db, _ := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		invalidUser := models.User{Email: ""}

		// Call SetUser, expecting it to log the error and return early
		cache.SetUser(appsession, invalidUser)
		// No assertions needed; the function logs the error and returns.
	})

	// Test case 3: Successfully setting a user in the cache
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Create a valid user
		user := models.User{Email: "test@example.com"}

		// Marshal the user to BSON
		userBson, err := bson.Marshal(user)
		if err != nil {
			t.Fatalf("failed to marshal user: %v", err)
		}

		// Expect the Set command to be called with correct parameters
		mock.ExpectSet(cache.UserKey(user.Email), userBson, 0).SetVal("OK")

		// Call SetUser
		cache.SetUser(appsession, user)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test case 4: Setting the user in the cache fails
	t.Run("set fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Create a valid user
		user := models.User{Email: "test@example.com"}

		// Marshal the user to BSON
		userBson, err := bson.Marshal(user)
		if err != nil {
			t.Fatalf("failed to marshal user: %v", err)
		}

		// Expect the Set command to fail with an error
		mock.ExpectSet(cache.UserKey(user.Email), userBson, 0).SetErr(errors.New("failed to set user"))

		// Call SetUser
		cache.SetUser(appsession, user)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

func TestDeleteUser(t *testing.T) {
	// Test case 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		email := "test@example.com"

		// Call DeleteUser
		cache.DeleteUser(appsession, email)
		// No assertions needed; we're ensuring it returns without crashing.
	})

	// Test case 2: Successfully deleting a user from the cache
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"

		// Expect the Del command to be called with the correct key
		mock.ExpectDel(cache.UserKey(email)).SetVal(1) // Assuming 1 means successful deletion

		// Call DeleteUser
		cache.DeleteUser(appsession, email)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test case 3: Deletion fails
	t.Run("delete fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"

		// Expect the Del command to fail with an error
		mock.ExpectDel(cache.UserKey(email)).SetErr(errors.New("failed to delete user"))

		// Call DeleteUser
		cache.DeleteUser(appsession, email)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

func TestGetOTP(t *testing.T) {
	// Test case 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		email := "test@example.com"
		otp := "123456"

		// Call GetOTP
		otpData, err := cache.GetOTP(appsession, email, otp)

		// Check if the error is as expected
		if err == nil || err.Error() != "cache not found" {
			t.Errorf("expected error 'cache not found', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}
	})

	// Test case 2: Redis Get command returns an error
	t.Run("redis get returns error", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"
		otp := "123456"

		// Expect the Get command to return an error
		mock.ExpectGet(cache.OTPKey(email, otp)).RedisNil()

		// Call GetOTP
		otpData, err := cache.GetOTP(appsession, email, otp)

		// Check if the error is as expected
		if err != nil {
			t.Errorf("expected error '%v', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}
	})

	// Test case 3: res.Bytes() returns an error
	t.Run("res.Bytes() returns error", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"
		otp := "123456"

		// Simulate redis.Get command with invalid data
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal("invalid_data")

		// Call GetOTP
		otpData, err := cache.GetOTP(appsession, email, otp)

		// Check if the error contains "failed to get bytes"
		if err == nil || err.Error() != "failed to get bytes" {
			t.Errorf("expected error 'failed to get bytes', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}
	})

	// Test case 4: bson.Unmarshal fails
	t.Run("bson.Unmarshal fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"
		otp := "123456"

		// Simulate redis.Get command with invalid BSON data
		invalidBson := []byte{0x01, 0x02, 0x03}
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(invalidBson))

		// Call GetOTP
		otpData, err := cache.GetOTP(appsession, email, otp)

		// Check if the error contains "failed to unmarshall"
		if err == nil || err.Error() != "failed to unmarshall" {
			t.Errorf("expected error 'failed to unmarshall', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}
	})

	// Test case 5: Successfully get OTP from cache
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"
		otp := "123456"

		// Create a valid OTP
		expectedOTP := models.OTP{OTP: otp}

		// Marshal the OTP to BSON
		otpBson, err := bson.Marshal(expectedOTP)
		if err != nil {
			t.Fatalf("failed to marshal OTP: %v", err)
		}

		// Expect the Get command to be called with the correct key
		mock.ExpectGet(cache.OTPKey(email, otp)).SetVal(string(otpBson))

		// Call GetOTP
		otpData, err := cache.GetOTP(appsession, email, otp)

		// Check if there is no error
		if err != nil {
			t.Errorf("unexpected error: %v", err)
		}

		// Check if the returned OTP data matches the expected OTP
		if otpData != expectedOTP {
			t.Errorf("expected OTP data %+v, got %+v", expectedOTP, otpData)
		}
	})
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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetOTP(appsession, tt.otp)

			if tt.name != "cache is nil" {
				// check if otp was set in cache
				otpData, err := appsession.Cache.Get(context.Background(), cache.OTPKey(email, otpv))
				assert.NoError(t, res.Err())

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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}

				// add otp to cache
				otpData, _ := bson.Marshal(otp)
				err := appsession.Cache.Set(context.Background(), cache.OTPKey(email, otpv), otpData)

				assert.NoError(t, res.Err())
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteOTP(appsession, tt.expectedOTP.Email, tt.expectedOTP.OTP)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {
				// check if otp was deleted in cache
				otpData, err := appsession.Cache.Get(context.Background(), cache.OTPKey(email, otpv))
				assert.NotNil(t, err)
				assert.Nil(t, otpData)
			}

			if tt.name == "cache key does not exist" {
				// check if otp was not deleted in cache
				otpData, err := appsession.Cache.Get(context.Background(), cache.OTPKey(email, otpv))
				assert.NoError(t, res.Err())
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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetBooking(appsession, tt.booking)

			if tt.name != "cache is nil" {
				// check if booking was set in cache
				bookingData, err := appsession.Cache.Get(context.Background(), cache.RoomBookingKey(tt.booking.OccupiID))
				assert.NoError(t, res.Err())

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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			// add booking to cache
			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}
				err := appsession.Cache.Set(context.Background(), cache.RoomBookingKey(booking.OccupiID), bookingData)

				assert.NoError(t, res.Err())
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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}

				// add booking to cache
				bookingData, _ := bson.Marshal(booking)
				err := appsession.Cache.Set(context.Background(), cache.RoomBookingKey(booking.OccupiID), bookingData)

				assert.NoError(t, res.Err())
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteBooking(appsession, tt.bookingID)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {
				// check if booking was deleted in cache
				bookingData, err := appsession.Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))
				assert.NotNil(t, err)
				assert.Nil(t, bookingData)
			}

			if tt.name == "cache key does not exist" {
				// check if booking was not deleted in cache
				bookingData, err := appsession.Cache.Get(context.Background(), cache.RoomBookingKey(booking.OccupiID))
				assert.NoError(t, res.Err())
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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}
			} else {
				appsession = &models.AppSession{}
			}

			cache.SetImage(appsession, tt.image.ID, tt.image)

			if tt.name != "cache is nil" {
				// check if image was set in cache
				imageData, err := appsession.Cache.Get(context.Background(), cache.ImageKey(tt.image.ID))
				assert.NoError(t, res.Err())

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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			// add image to cache
			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}
				err := appsession.Cache.Set(context.Background(), cache.ImageKey(image.ID), imageData)

				assert.NoError(t, res.Err())
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
			db, mock := redismock.NewClientMock()
			var appsession *models.AppSession

			if tt.name != "cache is nil" {
				appsession = &models.AppSession{
					Cache: db,
				}

				// add image to cache
				imageData, _ := bson.Marshal(image)
				err := appsession.Cache.Set(context.Background(), cache.ImageKey(image.ID), imageData)

				assert.NoError(t, res.Err())
			} else {
				appsession = &models.AppSession{}
			}

			cache.DeleteImage(appsession, tt.imageID)

			if tt.name != "cache is nil" && tt.name != "cache key does not exist" {
				// check if image was deleted in cache
				imageData, err := appsession.Cache.Get(context.Background(), cache.ImageKey(image.ID))
				assert.NotNil(t, err)
				assert.Nil(t, imageData)
			}

			if tt.name == "cache key does not exist" {
				// check if image was not deleted in cache
				imageData, err := appsession.Cache.Get(context.Background(), cache.ImageKey(image.ID))
				assert.NoError(t, res.Err())
				assert.NotNil(t, imageData)
			}
		})
	}
}
