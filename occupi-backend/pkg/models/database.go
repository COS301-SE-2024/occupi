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
	RoomID    string    `json:"roomId" bson:"roomId" binding:"required"`
	RoomName  string    `json:"roomName" bson:"roomName" binding:"required"`
	Emails    []string  `json:"emails" bson:"emails" binding:"required,dive,email"`
	CheckedIn bool      `json:"checkedIn" bson:"checkedIn"`
	Creator   string    `json:"creator" bson:"creator" binding:"required,email"`
	FloorNo   string    `json:"floorNo" bson:"floorNo" binding:"required"`
	Date      time.Time `json:"date" bson:"date" binding:"required"`
	Start     time.Time `json:"start" bson:"start" binding:"required"`
	End       time.Time `json:"end" bson:"end" binding:"required"`
}
type Cancel struct {
	BookingID string    `json:"bookingId" bson:"bookingId" binding:"required"`
	RoomID    string    `json:"roomId" bson:"roomId" binding:"required"`
	RoomName  string    `json:"roomName" bson:"roomName" binding:"required"`
	Emails    []string  `json:"emails" bson:"emails" binding:"required,dive,email"`
	Creator   string    `json:"creator" bson:"creator" binding:"required,email"`
	FloorNo   string    `json:"floorNo" bson:"floorNo" binding:"required"`
	Date      time.Time `json:"date" bson:"date" binding:"required"`
	Start     time.Time `json:"start" bson:"start" binding:"required"`
	End       time.Time `json:"end" bson:"end" binding:"required"`
}

// structure of CheckIn
type CheckIn struct {
	BookingID string `json:"bookingId" bson:"bookingId" binding:"required"`
	Creator   string `json:"creator" bson:"creator" binding:"required,email"`
	RoomID    string `json:"roomId" bson:"roomId" binding:"required"`
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
	RoomNo       string `json:"roomNo" bson:"roomNo,omitempty"`
	FloorNo      string `json:"floorNo" bson:"floorNo" binding:"required"`
	MinOccupancy int    `json:"minOccupancy" bson:"minOccupancy,omitempty"`
	MaxOccupancy int    `json:"maxOccupancy" bson:"maxOccupancy"`
	Description  string `json:"description" bson:"description"`
	RoomName     string `json:"roomName" bson:"roomName"`
}

type RoomRequest struct {
	FloorNo string `json:"floorNo" bson:"floorNo" binding:"required"`
}
