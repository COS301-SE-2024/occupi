package models

import (
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

type RegisterUser struct {
	Email         string `json:"email" binding:"required,email"`
	Password      string `json:"password" binding:"required,min=8"`
	EmployeeID    string `json:"employee_id" binding:"omitempty,startswith=OCCUPI"`
	ExpoPushToken string `json:"expoPushToken" binding:"required"`
	IsTest        string `json:"test"`
}

// expected user structure from api requests
type RequestUser struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
	EmployeeID string `json:"employee_id" binding:"omitempty,startswith=OCCUPI"`
	IsTest     string `json:"test"`
}

// expected structure of otp from api requests
type RequestUserOTP struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

type RoomRequest struct {
	FloorNo string `json:"floorNo" bson:"floorNo" binding:"required"`
}

type ErrorMsg struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type QueryInput struct {
	Operator   string                 `json:"operator"` // eq, ne, gt, gte, lt, lte, in, nin
	OrderAsc   string                 `json:"order_asc"`
	OrderDesc  string                 `json:"order_desc"`
	Filter     map[string]interface{} `json:"filter"`
	Projection []string               `json:"projection"`
	Limit      int64                  `json:"limit"`
	Page       int64                  `json:"page"`
}

type ResetPassword struct {
	Email              string `json:"email" binding:"required,email"`
	NewPassword        string `json:"newPassword" binding:"required,min=8"`
	NewPasswordConfirm string `json:"newPasswordConfirm" binding:"required,min=8"`
	OTP                string `json:"otp" binding:"required,len=6"`
}

// expected email structure from api requests
type RequestEmail struct {
	Email string `json:"email" binding:"required,email"`
}

// expected email structure from api requests
type RequestEmails struct {
	Emails []string `json:"emails" binding:"required"`
}

type SecuritySettingsRequest struct {
	Email              string `json:"email" binding:"omitempty,email"`
	Mfa                string `json:"mfa"`
	ForceLogout        string `json:"forceLogout"`
	CurrentPassword    string `json:"currentPassword" binding:"omitempty,min=8"`
	NewPassword        string `json:"newPassword" binding:"omitempty,min=8"`
	NewPasswordConfirm string `json:"newPasswordConfirm" binding:"omitempty,min=8"`
}

type UserDetailsRequest struct {
	Email        string `json:"email" binding:"omitempty,email"`
	Name         string `json:"name"`
	Dob          string `json:"dob"`
	Gender       string `json:"gender"`
	SessionEmail string `json:"session_email" binding:"required,email"`
	Employeeid   string `json:"employeeid" binding:"omitempty,startswith=OCCUPI"`
	Number       string `json:"number"`
	Pronouns     string `json:"pronouns"`
}

type NotificationsRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Invites         string `json:"invites"`
	BookingReminder string `json:"bookingReminder"`
}

type ProfileImageRequest struct {
	Email   string `json:"email" binding:"omitempty,email"`
	Quality string `json:"quality"`
}

type ImageRequest struct {
	ID      string `json:"id" binding:"required"`
	RoomID  string `json:"roomId" binding:"omitempty,startswith=RM"`
	Quality string `json:"quality"`
}

type RequestRoom struct {
	RoomID       string `json:"roomId" binding:"required,startswith=RM"`
	RoomNo       string `json:"roomNo" binding:"required"`
	FloorNo      string `json:"floorNo" binding:"required"`
	MinOccupancy int    `json:"minOccupancy" binding:"required"`
	MaxOccupancy int    `json:"maxOccupancy" binding:"required"`
	Description  string `json:"description" binding:"required"`
	RoomName     string `json:"roomName" binding:"required"`
}

type WebAuthnSession struct {
	UUID        string                `json:"uuid"`
	Email       string                `json:"email"`
	Cred        webauthn.Credential   `json:"cred"`
	SessionData *webauthn.SessionData `json:"sessionData"`
}

type RequestAvailableSlots struct {
	RoomID string    `json:"roomId" binding:"required,startswith=RM"`
	Date   time.Time `json:"date" binding:"required"`
}

type Slot struct {
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

type RequestOnsite struct {
	Email  string `json:"email" binding:"omitempty,email"`
	OnSite string `json:"onSite" binding:"required"`
}

type RequestHours struct {
	Email    string    `json:"email" binding:"omitempty,email"`
	TimeFrom time.Time `json:"timeFrom" binding:"omitempty" time_format:"2006-01-02T15:04:05Z07:00"`
	TimeTo   time.Time `json:"timeTo" binding:"omitempty" time_format:"2006-01-02T15:04:05Z07:00"`
	Limit    int64     `json:"limit"`
	Page     int64     `json:"page"`
}

type RequestBooking struct {
	Creator   string    `json:"creator" binding:"omitempty,email"`
	Attendees []string  `json:"attendees" binding:"omitempty,email"`
	TimeFrom  time.Time `json:"timeFrom" binding:"omitempty" time_format:"2006-01-02T15:04:05Z07:00"`
	TimeTo    time.Time `json:"timeTo" binding:"omitempty" time_format:"2006-01-02T15:04:05Z07:00"`
	Limit     int64     `json:"limit"`
	Page      int64     `json:"page"`
}

type RequestSpecialEvent struct {
	Date           time.Time `json:"date" binding:"required"`
	IsSpecialEvent string    `json:"isSpecialEvent" binding:"required"`
}

type UserRequest struct {
	EmployeeID              string              `json:"employee_id" binding:"omitempty,startswith=OCCUPI"`
	Password                string              `json:"password" binding:"required,min=8"`
	Email                   string              `json:"email" binding:"required,email"`
	Role                    string              `json:"role" binding:"omitempty"`
	Details                 DetailsRequest      `json:"details" binding:"omitempty"`
	Notifications           NotificationRequest `json:"notifications" binding:"omitempty"`
	Status                  string              `json:"status" bson:"status, omitempty"`
	Position                string              `json:"position" bson:"position, omitempty"`
	DepartmentNo            string              `json:"departmentNo" bson:"departmentNo, omitempty"`
	ExpoPushToken           string              `json:"expoPushToken" binding:"omitempty"`
	BlockAnonymousIPAddress bool                `json:"blockAnonymousIPAddress" binding:"omitempty"`
}

type DetailsRequest struct {
	ContactNo string    `json:"contactNo" binding:"omitempty"`
	Name      string    `json:"name" binding:"omitempty"`
	DOB       time.Time `json:"dob" binding:"omitempty"`
	Gender    string    `json:"gender" binding:"omitempty"`
	Pronouns  string    `json:"pronouns" binding:"omitempty"`
}

type NotificationRequest struct {
	Invites         bool `json:"invites" binding:"omitempty"`
	BookingReminder bool `json:"bookingReminder" binding:"omitempty"`
}

type RequestIP struct {
	IP     string   `json:"ip" binding:"omitempty"`
	Emails []string `json:"emails" binding:"omitempty"`
}

type AllowAnonymousIPRequest struct {
	Emails                  []string `json:"emails" binding:"omitempty"`
	BlockAnonymousIPAddress bool     `json:"blockAnonymousIPAddress" binding:"omitempty"`
}

type DeleteNotiRequest struct {
	Email  string `json:"email" binding:"omitempty,email"`
	NotiID string `json:"notiId" binding:"required"`
}

type RoleRequest struct {
	Email string `json:"email" binding:"required,email"`
	Role  string `json:"role" binding:"required"`
}
