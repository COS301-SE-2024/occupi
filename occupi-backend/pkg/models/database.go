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
	ID        string    `json:"_id" bson:"_id,omitempty"`
	OccupiID  string    `json:"occupiId" bson:"occupiId,omitempty"`
	RoomID    string    `json:"roomId" bson:"roomId"`
	RoomName  string    `json:"roomName" bson:"roomName,omitempty"`
	Slot      int       `json:"slot" bson:"slot"`
	Emails    []string  `json:"emails" bson:"emails"`
	CheckedIn bool      `json:"checkedIn" bson:"checkedIn,omitempty"`
	Creator   string    `json:"creator" bson:"creator"`
	FloorNo   int       `json:"floorNo" bson:"floorNo"`
	Date      time.Time `json:"date" bson:"date,omitempty"`
	Start     time.Time `json:"start" bson:"start,omitempty"`
	End       time.Time `json:"end" bson:"end,omitempty"`
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

type Room struct {
	ID           string `json:"_id" bson:"_id,omitempty"`
	RoomID       string `json:"roomId" bson:"roomId,omitempty"`
	RoomNo       int    `json:"roomNo" bson:"roomNo,omitempty"`
	FloorNo      int    `json:"floorNo" bson:"floorNo,omitempty"`
	MinOccupancy int    `json:"minOccupancy" bson:"minOccupancy,omitempty"`
	MaxOccupancy int    `json:"maxOccupancy" bson:"maxOccupancy,omitempty"`
	Description  string `json:"description" bson:"description,omitempty"`
	RoomName     string `json:"roomName" bson:"roomName,omitempty"`
}
