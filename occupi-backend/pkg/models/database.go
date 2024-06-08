package models

import "time"

// structure of user
type User struct {
	ID                   string    `json:"_id" bson:"_id,omitempty"`
	OccupiID             string    `json:"occupiId" bson:"occupiId"`
	Password             string    `json:"password" bson:"password"`
	Email                string    `json:"email" bson:"email"`
	Role                 string    `json:"role" bson:"role"`
	OnSite               bool      `json:"onSite" bson:"onSite"`
	IsVerified           bool      `json:"isVerified" bson:"isVerified"`
	NextVerificationDate time.Time `json:"nextVerificationDate" bson:"nextVerificationDate"`
}

// structure of booking
type Booking struct {
	ID        string   `json:"_id" bson:"_id,omitempty"`
	OccupiID  int      `json:"occupiId" bson:"occupiId"`
	BookingID int      `json:"bookingId" bson:"bookingId"`
	RoomID    string   `json:"roomId" bson:"roomId"`
	Slot      int      `json:"slot" bson:"slot"`
	Emails    []string `json:"emails" bson:"emails"`
	CheckedIn bool     `json:"checkedIn" bson:"checkedIn"`
}

// structure of CheckIn
type CheckIn struct {
	BookingID int    `json:"bookingId" bson:"bookingId"`
	Email     string `json:"email" bson:"email"`
	RoomID    string `json:"roomId" bson:"roomId"`
}

type OTP struct {
	ID         string    `json:"_id" bson:"_id,omitempty"`
	Email      string    `json:"email" bson:"email"`
	OTP        string    `json:"otp" bson:"otp"`
	ExpireWhen time.Time `json:"expireWhen" bson:"expireWhen"`
}
