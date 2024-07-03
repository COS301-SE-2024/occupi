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

type UserDetails struct {
	ID                   string         `json:"_id" bson:"_id,omitempty"`
	OccupiID             string         `json:"occupiId" bson:"occupiId"`
	Password             string         `json:"password" bson:"password"`
	Email                string         `json:"email" bson:"email"`
	Role                 string         `json:"role" bson:"role"`
	OnSite               bool           `json:"onSite" bson:"onSite"`
	IsVerified           bool           `json:"isVerified" bson:"isVerified"`
	NextVerificationDate time.Time      `json:"nextVerificationDate" bson:"nextVerificationDate"`
	Details              *Details       `json:"details" bson:"details"`
	Notifications        *Notifications `json:"notifications" bson:"notifications"`
	Security             *Security      `json:"security" bson:"security"`
	Status               string         `json:"status" bson:"status"`
	Position             string         `json:"position" bson:"position"`
}

type Details struct {
	ContactNo string    `json:"contactNo" bson:"contactNo"`
	Name      string    `json:"name" bson:"name"`
	DOB       time.Time `json:"dob" bson:"dob"`
	Gender    string    `json:"gender" bson:"gender"`
	Pronouns  string    `json:"pronouns" bson:"pronouns"`
}

type Notifications struct {
	Allow           *bool `json:"allow" bson:"allow"`
	BookingReminder *bool `json:"bookingReminder" bson:"bookingReminder"`
	MaxCapacity     *bool `json:"maxCapacity" bson:"maxCapacity"`
}

type Security struct {
	MFA        *bool `json:"mfa" bson:"mfa"`
	Biometrics *bool `json:"biometrics" bson:"biometrics"`
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

type ResetToken struct {
    Email      string    `bson:"email"`
    Token      string    `bson:"token"`
    ExpireWhen time.Time `bson:"expireWhen"`
}