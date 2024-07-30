package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// structure of user
type User struct {
	ID                   string        `json:"_id" bson:"_id,omitempty"`
	OccupiID             string        `json:"occupiId" bson:"occupiId"`
	Password             string        `json:"password" bson:"password"`
	Email                string        `json:"email" bson:"email"`
	Role                 string        `json:"role" bson:"role"`
	OnSite               bool          `json:"onSite" bson:"onSite"`
	IsVerified           bool          `json:"isVerified" bson:"isVerified"`
	NextVerificationDate time.Time     `json:"nextVerificationDate" bson:"nextVerificationDate"`
	TwoFAEnabled         bool          `json:"twoFAEnabled" bson:"twoFAEnabled"`
	KnownLocations       []Location    `json:"knownLocations" bson:"knownLocations"`
	Details              Details       `json:"details" bson:"details, omitempty"`
	Notifications        Notifications `json:"notifications" bson:"notifications, omitempty"`
	Security             Security      `json:"security" bson:"security, omitempty"`
	Status               string        `json:"status" bson:"status, omitempty"`
	Position             string        `json:"position" bson:"position, omitempty"`
	DepartmentNo         string        `json:"departmentNo" bson:"departmentNo, omitempty"`
	ExpoPushToken        string        `json:"expoPushToken" bson:"expoPushToken"`
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
	DepartmentNo         string         `json:"departmentNo" bson:"departmentNo, omitempty"`
}

type FilterUsers struct {
	Role         string `json:"role" bson:"role, omitempty"`
	Status       string `json:"status" bson:"status, omitempty"`
	DepartmentNo string `json:"departmentNo" bson:"departmentNo, omitempty"`
}

type Details struct {
	ImageID   string    `json:"imageid" bson:"imageid"` // image id in image collection
	ContactNo string    `json:"contactNo" bson:"contactNo"`
	Name      string    `json:"name" bson:"name"`
	DOB       time.Time `json:"dob" bson:"dob"`
	Gender    string    `json:"gender" bson:"gender"`
	Pronouns  string    `json:"pronouns" bson:"pronouns"`
}

type Notifications struct {
	Invites         bool `json:"invites" bson:"invites"`
	BookingReminder bool `json:"bookingReminder" bson:"bookingReminder"`
}

type Security struct {
	MFA         bool `json:"mfa" bson:"mfa"`
	Biometrics  bool `json:"biometrics" bson:"biometrics"`
	ForceLogout bool `json:"forceLogout" bson:"forceLogout"`
}

type Location struct {
	City    string `json:"city" bson:"city"`
	Region  string `json:"region" bson:"region"`
	Country string `json:"country" bson:"country"`
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
	ID           string   `json:"_id" bson:"_id,omitempty"`
	RoomID       string   `json:"roomId" bson:"roomId,omitempty"`
	RoomNo       string   `json:"roomNo" bson:"roomNo,omitempty"`
	FloorNo      string   `json:"floorNo" bson:"floorNo" binding:"required"`
	MinOccupancy int      `json:"minOccupancy" bson:"minOccupancy,omitempty"`
	MaxOccupancy int      `json:"maxOccupancy" bson:"maxOccupancy"`
	Description  string   `json:"description" bson:"description"`
	RoomName     string   `json:"roomName" bson:"roomName"`
	RoomImageIDs []string `json:"roomImageIds" bson:"roomImageIds"`
	Resources    []string `json:"resources" bson:"resources"`
}

type ResetToken struct {
	Email      string    `bson:"email"`
	Token      string    `bson:"token"`
	ExpireWhen time.Time `bson:"expireWhen"`
}

type ScheduledNotification struct {
	ID                   string    `json:"_id" bson:"_id,omitempty"`
	Title                string    `json:"title" bson:"title"`
	Message              string    `json:"message" bson:"message"`
	Sent                 bool      `json:"sent" bson:"sent"`
	SendTime             time.Time `json:"send_time" bson:"send_time"`
	UnsentExpoPushTokens []string  `json:"unsentExpoPushTokens" bson:"unsentExpoPushTokens"`
	Emails               []string  `json:"emails" bson:"emails"`
	UnreadEmails         []string  `json:"unreadEmails" bson:"unreadEmails"`
}

type FilterStruct struct {
	Filter     primitive.M
	Projection bson.M
	Limit      int64
	Skip       int64
	Sort       primitive.M
}

type Image struct {
	ID           string `json:"_id" bson:"_id,omitempty"`
	Thumbnail    []byte `json:"image_thumbnail_res" bson:"image_thumbnail_res"`
	ImageLowRes  []byte `json:"image_low_res" bson:"image_low_res"`
	ImageMidRes  []byte `json:"image_mid_res" bson:"image_mid_res"`
	ImageHighRes []byte `json:"image_high_res" bson:"image_high_res"`
	FileName     string `json:"fileName" bson:"fileName"`
}
