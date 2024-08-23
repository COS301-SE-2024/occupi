package tests

import (
	"errors"
	"testing"
	"time"

	"github.com/allegro/bigcache/v3"
	"github.com/go-redis/redismock/v9"
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

func TestLoginKey(t *testing.T) {
	email := "test@example.com"
	expected := "Login:test@example.com"
	result := cache.LoginKey(email)
	if result != expected {
		t.Errorf("LoginKey(%s) = %s; want %s", email, result, expected)
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
		mock.ExpectSet(cache.UserKey(user.Email), userBson, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(userBson))

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
			t.Fatalf("failed to marshal user: %v", err.Error())
		}

		// Expect the Set command to fail with an error
		mock.ExpectSet(cache.UserKey(user.Email), userBson, time.Duration(configs.GetCacheEviction())*time.Second).SetErr(errors.New("failed to set user"))

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
		mock.ExpectGet(cache.OTPKey(email, otp)).SetErr(errors.New("key does not exist"))

		// Call GetOTP
		otpData, err := cache.GetOTP(appsession, email, otp)

		// Check if the error is as expected
		if err == nil {
			t.Errorf("expected error 'key does not exist', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
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
		if err == nil {
			t.Errorf("expected error 'failed to get bytes', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
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
		if err == nil {
			t.Errorf("expected error 'failed to unmarshall', got '%v'", err)
		}

		// Check if the returned OTP data is empty
		if otpData != (models.OTP{}) {
			t.Errorf("expected empty OTP data, got %+v", otpData)
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
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

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

func TestSetOTP(t *testing.T) {
	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		otpData := models.OTP{Email: "test@example.com", OTP: "123456"}

		cache.SetOTP(appsession, otpData)

		// No further assertions are needed; the function should return without doing anything.
	})

	// Test 2: Marshalling fails
	t.Run("marshal fails", func(t *testing.T) {
		db, _ := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Create invalid OTP data (e.g., by including a function)
		invalidOTP := models.OTP{
			Email: "test@example.com",
			OTP:   "123456",
		}

		cache.SetOTP(appsession, invalidOTP)
		// Function should log an error and return without performing any Redis operations.
	})

	// Test 3: Set fails
	t.Run("set fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		otpData := models.OTP{Email: "test@example.com", OTP: "123456"}

		// Marshal OTP to BSON
		otpDataBytes, err := bson.Marshal(otpData)
		if err != nil {
			t.Fatalf("failed to marshal OTP: %v", err)
		}

		// Simulate Redis Set command failing
		mock.ExpectSet(cache.OTPKey(otpData.Email, otpData.OTP), otpDataBytes, time.Duration(configs.GetCacheEviction())*time.Second).SetErr(errors.New("failed to set OTP"))

		cache.SetOTP(appsession, otpData)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 4: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		otpData := models.OTP{Email: "test@example.com", OTP: "123456"}

		// Marshal OTP to BSON
		otpDataBytes, err := bson.Marshal(otpData)
		if err != nil {
			t.Fatalf("failed to marshal OTP: %v", err)
		}

		// Simulate Redis Set command succeeding
		mock.ExpectSet(cache.OTPKey(otpData.Email, otpData.OTP), otpDataBytes, time.Duration(configs.GetCacheEviction())*time.Second).SetVal("OK")

		cache.SetOTP(appsession, otpData)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

func TestDeleteOTPF(t *testing.T) {
	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		email := "test@example.com"
		otp := "123456"

		cache.DeleteOTP(appsession, email, otp)

		// No further assertions are needed; the function should return without doing anything.
	})

	// Test 2: Deleting OTP from cache fails
	t.Run("delete fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"
		otp := "123456"

		// Simulate Redis Del command failing
		mock.ExpectDel(cache.OTPKey(email, otp)).SetErr(errors.New("failed to delete OTP"))

		cache.DeleteOTP(appsession, email, otp)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 3: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		email := "test@example.com"
		otp := "123456"

		// Simulate Redis Del command succeeding
		mock.ExpectDel(cache.OTPKey(email, otp)).SetVal(1)

		cache.DeleteOTP(appsession, email, otp)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

// Test SetBooking
func TestSetBooking(t *testing.T) {
	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		booking := models.Booking{OccupiID: "123"}

		cache.SetBooking(appsession, booking)

		// No further assertions; the function should return without doing anything.
	})

	// Test 2: Marshalling fails
	t.Run("marshal fails", func(t *testing.T) {
		db, _ := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Create invalid booking data (e.g., by including a function)
		invalidBooking := models.Booking{OccupiID: "123"}

		cache.SetBooking(appsession, invalidBooking)
		// The function should log an error and return without performing any Redis operations.
	})

	// Test 3: Set fails
	t.Run("set fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		booking := models.Booking{OccupiID: "123"}

		// Marshal booking to BSON
		bookingData, err := bson.Marshal(booking)
		if err != nil {
			t.Fatalf("failed to marshal booking: %v", err)
		}

		// Simulate Redis Set command failing
		mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, 0).SetErr(errors.New("failed to set booking"))

		cache.SetBooking(appsession, booking)
	})

	// Test 4: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		booking := models.Booking{OccupiID: "123"}

		// Marshal booking to BSON
		bookingData, err := bson.Marshal(booking)
		if err != nil {
			t.Fatalf("failed to marshal booking: %v", err)
		}

		// Simulate Redis Set command succeeding
		mock.ExpectSet(cache.RoomBookingKey(booking.OccupiID), bookingData, 0).SetVal("OK")

		cache.SetBooking(appsession, booking)
	})
}

// Test GetBooking
func TestGetBooking(t *testing.T) {

	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		bookingID := "123"

		_, err := cache.GetBooking(appsession, bookingID)
		if err == nil {
			t.Errorf("expected error due to cache being nil, but got nil")
		}
	})

	// Test 2: Key does not exist
	t.Run("key does not exist", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		bookingID := "123"

		// Simulate Redis Get command returning an error
		mock.ExpectGet(cache.RoomBookingKey(bookingID)).SetErr(errors.New("key does not exist"))

		_, err := cache.GetBooking(appsession, bookingID)
		if err == nil {
			t.Errorf("expected error, got nil")
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 3: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		bookingID := "123"
		booking := models.Booking{OccupiID: bookingID}

		// Marshal booking to BSON
		bookingData, err := bson.Marshal(booking)
		if err != nil {
			t.Fatalf("failed to marshal booking: %v", err)
		}

		// Simulate Redis Get command returning the marshalled data
		mock.ExpectGet(cache.RoomBookingKey(bookingID)).SetVal(string(bookingData))

		result, err := cache.GetBooking(appsession, bookingID)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if result.OccupiID != bookingID {
			t.Errorf("expected booking ID %s, got %s", bookingID, result.OccupiID)
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

// Test DeleteBooking
func TestDeleteBooking(t *testing.T) {

	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		bookingID := "123"

		cache.DeleteBooking(appsession, bookingID)

		// No further assertions; the function should return without doing anything.
	})

	// Test 2: Deleting booking from cache fails
	t.Run("delete fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		bookingID := "123"

		// Simulate Redis Del command failing
		mock.ExpectDel(cache.RoomBookingKey(bookingID)).SetErr(errors.New("failed to delete booking"))

		cache.DeleteBooking(appsession, bookingID)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 3: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		bookingID := "123"

		// Simulate Redis Del command succeeding
		mock.ExpectDel(cache.RoomBookingKey(bookingID)).SetVal(1)

		cache.DeleteBooking(appsession, bookingID)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

// Test GetImage
func TestGetImage(t *testing.T) {
	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		id := "image123"

		_, err := cache.GetImage(appsession, id)
		if err == nil {
			t.Errorf("expected error due to cache being nil, but got nil")
		}
	})

	// Test 2: Key does not exist
	t.Run("key does not exist", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		id := "image123"

		// Simulate Redis Get command returning an error
		mock.ExpectGet(cache.ImageKey(id)).SetErr(errors.New("key does not exist"))

		_, err := cache.GetImage(appsession, id)
		if err == nil {
			t.Errorf("expected error, got nil")
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 3: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		id := "image123"
		image := models.Image{ID: id, FileName: "image.png"}

		// Marshal image to BSON
		imageData, err := bson.Marshal(image)
		if err != nil {
			t.Fatalf("failed to marshal image: %v", err)
		}

		// Simulate Redis Get command returning the marshalled data
		mock.ExpectGet(cache.ImageKey(id)).SetVal(string(imageData))

		result, err := cache.GetImage(appsession, id)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if result.ID != id {
			t.Errorf("expected image ID %s, got %s", id, result.ID)
		}

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

// Test SetImage
func TestSetImage(t *testing.T) {
	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		id := "image123"
		image := models.Image{ID: id, FileName: "image.png"}

		cache.SetImage(appsession, id, image)

		// No further assertions; the function should return without doing anything.
	})

	// Test 2: Marshalling fails
	t.Run("marshal fails", func(t *testing.T) {
		db, _ := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}

		// Create invalid image data (e.g., by including a function)
		invalidImage := models.Image{ID: "", FileName: "image.png"}

		cache.SetImage(appsession, invalidImage.ID, invalidImage)
		// The function should log an error and return without performing any Redis operations.
	})

	// Test 3: Set fails
	t.Run("set fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		id := "image123"
		image := models.Image{ID: id, FileName: "image.png"}

		// Marshal image to BSON
		imageData, err := bson.Marshal(image)
		if err != nil {
			t.Fatalf("failed to marshal image: %v", err)
		}

		// Simulate Redis Set command failing
		mock.ExpectSet(cache.ImageKey(id), imageData, time.Duration(configs.GetCacheEviction())*time.Second).SetErr(errors.New("failed to set image"))

		cache.SetImage(appsession, id, image)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 4: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		id := "image123"
		image := models.Image{ID: id, FileName: "image.png"}

		// Marshal image to BSON
		imageData, err := bson.Marshal(image)
		if err != nil {
			t.Fatalf("failed to marshal image: %v", err)
		}

		// Simulate Redis Set command succeeding
		mock.ExpectSet(cache.ImageKey(id), imageData, time.Duration(configs.GetCacheEviction())*time.Second).SetVal(string(imageData))

		cache.SetImage(appsession, id, image)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

// Test DeleteImage
func TestDeleteImage(t *testing.T) {
	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{Cache: nil}
		id := "image123"

		cache.DeleteImage(appsession, id)

		// No further assertions; the function should return without doing anything.
	})

	// Test 2: Deleting image from cache fails
	t.Run("delete fails", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		id := "image123"

		// Simulate Redis Del command failing
		mock.ExpectDel(cache.ImageKey(id)).SetErr(errors.New("failed to delete image"))

		cache.DeleteImage(appsession, id)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})

	// Test 3: Success
	t.Run("success", func(t *testing.T) {
		db, mock := redismock.NewClientMock()
		appsession := &models.AppSession{Cache: db}
		id := "image123"

		// Simulate Redis Del command succeeding
		mock.ExpectDel(cache.ImageKey(id)).SetVal(1)

		cache.DeleteImage(appsession, id)

		// Ensure all expectations were met
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unmet expectations: %v", err)
		}
	})
}

// Test SetSession
func TestSetSessionF(t *testing.T) {

	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{SessionCache: nil}
		session := models.WebAuthnSession{}
		uuid := "test-uuid"

		err := cache.SetSession(appsession, session, uuid)
		if err == nil {
			t.Errorf("expected error due to cache being nil, but got nil")
		}
	})

	// Test 2: Marshalling fails
	t.Run("marshal fails", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}

		// Create invalid session data (e.g., by including a function)
		invalidSession := models.WebAuthnSession{}

		_ = cache.SetSession(appsession, invalidSession, "test-uuid")
	})

	// Test 3: Set fails (Simulate by using a full cache)
	t.Run("set fails", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(1))
		appsession := &models.AppSession{SessionCache: Cache}

		// Fill the cache to capacity
		Cache.Set("full", []byte("data"))

		session := models.WebAuthnSession{}
		uuid := "test-uuid"

		_ = cache.SetSession(appsession, session, uuid)
	})

	// Test 4: Success
	t.Run("success", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}
		session := models.WebAuthnSession{}
		uuid := "test-uuid"

		err := cache.SetSession(appsession, session, uuid)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})
}

// Test GetSession
func TestGetSessionF(t *testing.T) {

	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{SessionCache: nil}
		uuid := "test-uuid"

		_, err := cache.GetSession(appsession, uuid)
		if err == nil {
			t.Errorf("expected error due to cache being nil, but got nil")
		}
	})

	// Test 2: Key does not exist
	t.Run("key does not exist", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}
		uuid := "test-uuid"

		_, err := cache.GetSession(appsession, uuid)
		if err == nil {
			t.Errorf("expected error, got nil")
		}
	})

	// Test 3: Unmarshal fails
	t.Run("unmarshal fails", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}
		uuid := "test-uuid"

		// Set invalid data in the cache
		Cache.Set(cache.SessionKey(uuid), []byte("invalid data"))

		_, err := cache.GetSession(appsession, uuid)
		if err == nil {
			t.Errorf("expected error during unmarshalling, got nil")
		}
	})

	// Test 4: Success
	t.Run("success", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}
		session := models.WebAuthnSession{}
		uuid := "test-uuid"

		// Marshal session to BSON
		sessionData, err := bson.Marshal(session)
		if err != nil {
			t.Fatalf("failed to marshal session: %v", err)
		}

		// Set the marshalled data in the cache
		Cache.Set(cache.SessionKey(uuid), sessionData)

		result, err := cache.GetSession(appsession, uuid)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if result == nil {
			t.Errorf("expected non-nil session, got nil")
		}
	})
}

// Test DeleteSession
func TestDeleteSession(t *testing.T) {

	// Test 1: Cache is nil
	t.Run("cache is nil", func(t *testing.T) {
		appsession := &models.AppSession{SessionCache: nil}
		uuid := "test-uuid"

		cache.DeleteSession(appsession, uuid)

		// No further assertions; the function should return without doing anything.
	})

	// Test 2: Deleting session from cache fails (Simulate by deleting a non-existent key)
	t.Run("delete fails", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}
		uuid := "test-uuid"

		cache.DeleteSession(appsession, uuid)

		// Expect no error, but we can verify with the absence of the key
		if _, err := Cache.Get(cache.SessionKey(uuid)); err == nil {
			t.Errorf("expected key to be absent, but it exists")
		}
	})

	// Test 3: Success
	t.Run("success", func(t *testing.T) {
		Cache, _ := bigcache.NewBigCache(bigcache.DefaultConfig(10 * 60 * 60))
		appsession := &models.AppSession{SessionCache: Cache}
		uuid := "test-uuid"
		session := models.WebAuthnSession{}

		// Marshal session to BSON
		sessionData, err := bson.Marshal(session)
		if err != nil {
			t.Fatalf("failed to marshal session: %v", err)
		}

		// Set the marshalled data in the cache
		Cache.Set(cache.SessionKey(uuid), sessionData)

		// Now delete it
		cache.DeleteSession(appsession, uuid)

		// Verify that the key no longer exists
		if _, err := Cache.Get(cache.SessionKey(uuid)); err == nil {
			t.Errorf("expected key to be deleted, but it still exists")
		}
	})
}

func TestCanMakeLogin(t *testing.T) {
	email := "test@example.com"
	key := cache.LoginKey(email)

	t.Run("cache not found", func(t *testing.T) {
		// Set up a mock Redis client
		db, _ := redismock.NewClientMock()

		appsession := &models.AppSession{
			Cache: db,
		}
		appsession.Cache = nil
		canLogin, err := cache.CanMakeLogin(appsession, email)
		assert.False(t, canLogin)
		assert.EqualError(t, err, "cache not found")
	})

	t.Run("new user - set value", func(t *testing.T) {
		// Set up a mock Redis client
		db, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			Cache: db,
		}
		// Simulate Get returning a nil value (key not found)
		mock.ExpectGet(key).RedisNil()
		// Simulate successful Set operation
		mock.ExpectSet(key, 1, 2*time.Second).SetVal("OK")

		canLogin, err := cache.CanMakeLogin(appsession, email)
		assert.True(t, canLogin)
		assert.NoError(t, err)

		// Ensure all expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err)
	})

	t.Run("existing user with login count less than 5", func(t *testing.T) {
		// Set up a mock Redis client
		db, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			Cache: db,
		}
		// Simulate Get returning a value of 3
		mock.ExpectGet(key).SetVal("3")
		// Simulate successful Set operation to update the value to 4
		mock.ExpectSet(key, 4, 2*time.Second).SetVal("OK")

		canLogin, err := cache.CanMakeLogin(appsession, email)
		assert.True(t, canLogin)
		assert.NoError(t, err)

		// Ensure all expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err)
	})

	t.Run("existing user with login count 5 or more", func(t *testing.T) {
		// Set up a mock Redis client
		db, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			Cache: db,
		}
		// Simulate Get returning a value of 5
		mock.ExpectGet(key).SetVal("5")

		canLogin, err := cache.CanMakeLogin(appsession, email)
		assert.False(t, canLogin)
		assert.NoError(t, err)

		// Ensure all expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err)
	})

	t.Run("error on Get", func(t *testing.T) {
		// Set up a mock Redis client
		db, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			Cache: db,
		}
		// Simulate Get operation error
		mock.ExpectGet(key).SetErr(errors.New("redis get error"))
		// Simulate successful Set operation
		mock.ExpectSet(key, 1, 2*time.Second).SetVal("OK")

		canLogin, err := cache.CanMakeLogin(appsession, email)
		assert.True(t, canLogin)
		assert.NoError(t, err)

		// Ensure all expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err)
	})

	t.Run("error on Set", func(t *testing.T) {
		// Set up a mock Redis client
		db, mock := redismock.NewClientMock()

		appsession := &models.AppSession{
			Cache: db,
		}
		// Simulate Get returning a value of 3
		mock.ExpectGet(key).SetVal("3")
		// Simulate Set operation error
		mock.ExpectSet(key, 4, 2*time.Second).SetErr(errors.New("redis set error"))

		canLogin, err := cache.CanMakeLogin(appsession, email)
		assert.False(t, canLogin)
		assert.EqualError(t, err, "redis set error")

		// Ensure all expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err)
	})
}
