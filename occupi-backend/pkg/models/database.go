package models

import (
	"os"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// structure of user
type User struct {
	ID                      string        `json:"_id" bson:"_id,omitempty"`
	OccupiID                string        `json:"occupiId" bson:"occupiId"`
	Password                string        `json:"password" bson:"password"`
	Email                   string        `json:"email" bson:"email"`
	Role                    string        `json:"role" bson:"role"`
	OnSite                  bool          `json:"onSite" bson:"onSite"`
	IsVerified              bool          `json:"isVerified" bson:"isVerified"`
	NextVerificationDate    time.Time     `json:"nextVerificationDate" bson:"nextVerificationDate"`
	TwoFAEnabled            bool          `json:"twoFAEnabled" bson:"twoFAEnabled"`
	KnownLocations          []Location    `json:"knownLocations" bson:"knownLocations"`
	Details                 Details       `json:"details" bson:"details, omitempty"`
	Notifications           Notifications `json:"notifications" bson:"notifications, omitempty"`
	Security                Security      `json:"security" bson:"security, omitempty"`
	Status                  string        `json:"status" bson:"status, omitempty"`
	Position                string        `json:"position" bson:"position, omitempty"`
	DepartmentNo            string        `json:"departmentNo" bson:"departmentNo, omitempty"`
	ExpoPushToken           string        `json:"expoPushToken" bson:"expoPushToken"`
	ResetPassword           bool          `json:"resetPassword" bson:"resetPassword"`
	BlockAnonymousIPAddress bool          `json:"blockAnonymousIPAddress" bson:"blockAnonymousIPAddress"`
}

type FilterUsers struct {
	Role         string `json:"role" bson:"role, omitempty"`
	Status       string `json:"status" bson:"status, omitempty"`
	DepartmentNo string `json:"departmentNo" bson:"departmentNo, omitempty"`
}

type Details struct {
	HasImage  bool      `json:"hasImage" bson:"hasImage"`
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
	MFA         bool                `json:"mfa" bson:"mfa"`
	Biometrics  bool                `json:"biometrics" bson:"biometrics"`
	ForceLogout bool                `json:"forceLogout" bson:"forceLogout"`
	Credentials webauthn.Credential `json:"credentials" bson:"credentials"`
}

type Location struct {
	City     string `json:"city" bson:"city"`
	Region   string `json:"region" bson:"region"`
	Country  string `json:"country" bson:"country"`
	Location string `json:"location" bson:"location"`
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
	ID           string    `json:"_id" bson:"_id,omitempty"`
	RoomID       string    `json:"roomId" bson:"roomId,omitempty"`
	RoomNo       string    `json:"roomNo" bson:"roomNo,omitempty"`
	FloorNo      string    `json:"floorNo" bson:"floorNo" binding:"required"`
	MinOccupancy int       `json:"minOccupancy" bson:"minOccupancy,omitempty"`
	MaxOccupancy int       `json:"maxOccupancy" bson:"maxOccupancy"`
	Description  string    `json:"description" bson:"description"`
	RoomName     string    `json:"roomName" bson:"roomName"`
	RoomImage    RoomImage `json:"roomImage" bson:"roomImage"`
}

type RoomImage struct {
	ID           string `json:"_id" bson:"_id,omitempty"`
	UUID         string `json:"uuid" bson:"uuid"`
	ThumbnailRes string `json:"thumbnailRes" bson:"thumbnailRes"`
	LowRes       string `json:"lowRes" bson:"lowRes"`
	MidRes       string `json:"midRes" bson:"midRes"`
	HighRes      string `json:"highRes" bson:"highRes"`
}

type ResetToken struct {
	Email      string    `bson:"email"`
	Token      string    `bson:"token"`
	ExpireWhen time.Time `bson:"expireWhen"`
}

type ScheduledNotification struct {
	ID                   string    `json:"_id" bson:"_id,omitempty"`
	NotiID               string    `json:"notiId" bson:"notiId,omitempty"`
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

type File struct {
	FileName string   `json:"fileName" bson:"fileName"`
	File     *os.File `json:"file" bson:"file"`
}

type OfficeHours struct {
	Email   string    `json:"email" bson:"email"`
	Entered time.Time `json:"entered" bson:"entered"`
	Exited  time.Time `json:"exited" bson:"exited"`
}

type AnalyticsFilterStruct struct {
	Filter primitive.M
	Limit  int64
	Skip   int64
}

type Attendance struct {
	Date           time.Time `json:"Date" bson:"Date"`
	IsWeekend      bool      `json:"Is_Weekend" bson:"Is_Weekend"`
	WeekOfTheYear  int       `json:"Week_of_the_year" bson:"Week_of_the_year"`
	DayOfWeek      string    `json:"Day_of_week" bson:"Day_of_week"`
	DayOfMonth     int       `json:"Day_of_month" bson:"Day_of_month"`
	Month          int       `json:"Month" bson:"Month"`
	SpecialEvent   bool      `json:"Special_Event" bson:"Special_Event"`
	NumberAttended int       `json:"Number_Attended" bson:"Number_Attended"`
	AttendeesEmail []string  `json:"Attendees_Email" bson:"Attendees_Email"`
}

type MobileUser struct {
	Email string `json:"email" bson:"email"`
	JWT   string `json:"jwt" bson:"jwt"`
}
