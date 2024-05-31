package models

import (
	"time"
)

// structure of resource object
type Resource struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// structure of users
type User struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Token     string    `json:"token"`
	TokenTime time.Time `json:"token_time"`
}

// structure of otp
type UserOTP struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}

// structure of booking
type Booking struct {
	ID        string            `json:"_id" bson:"_id,omitempty"`
	OccupiID  int               `json:"occupiId" bson:"occupiId"`
	BookingID int               `json:"bookingId" bson:"bookingId"`
	RoomID    string            `json:"roomId" bson:"roomId"`
	Slot      int               `json:"slot" bson:"slot"`
	Emails    map[string]string `json:"emails" bson:"emails"`
	CheckedIn bool              `json:"checkedIn" bson:"checkedIn"`
}

// structure of CheckIn
type CheckIn struct {
	BookingID int    `json:"bookingId" bson:"bookingId"`
	Email     string `json:"email" bson:"email"`
	RoomID    string `json:"roomId" bson:"roomId"`
}
