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
	OccupiID  string   `json:"occupiId" bson:"occupiId,omitempty"`
	RoomID    string   `json:"roomId" bson:"roomId"`
	Slot      int      `json:"slot" bson:"slot"`
	Emails    []string `json:"emails" bson:"emails"`
	CheckedIn bool     `json:"checkedIn" bson:"checkedIn,omitempty"`
	Creator   string   `json:"creator" bson:"creator"`
	FloorNo   int      `json:"floorNo" bson:"floorNo"`
}

// structure of CheckIn
type CheckIn struct {
	BookingID string `json:"bookingId" bson:"bookingId"`
	Email     string `json:"email" bson:"email"`
	RoomID    string `json:"roomId" bson:"roomId"`
}

type OTP struct {
	ID         string    `json:"_id" bson:"_id,omitempty"`
	Email      string    `json:"email" bson:"email"`
	OTP        string    `json:"otp" bson:"otp"`
	ExpireWhen time.Time `json:"expireWhen" bson:"expireWhen"`
}

type ViewBookings struct {
	Email string `json:"email" bson:"email"`
}
