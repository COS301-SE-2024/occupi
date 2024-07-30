package models

type RegisterUser struct {
	Email         string `json:"email" binding:"required,email"`
	Password      string `json:"password" binding:"required,min=8"`
	EmployeeID    string `json:"employee_id" binding:"omitempty,startswith=OCCUPI"`
	ExpoPushToken string `json:"expoPushToken" binding:"required"`
}

// expected user structure from api requests
type RequestUser struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
	EmployeeID string `json:"employee_id" binding:"omitempty,startswith=OCCUPI"`
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
	Quality string `json:"quality"`
}

type RequestRoom struct {
	RoomID       string   `json:"roomId" binding:"required,startswith=RM"`
	RoomNo       string   `json:"roomNo" binding:"required"`
	FloorNo      string   `json:"floorNo" binding:"required"`
	MinOccupancy int      `json:"minOccupancy" binding:"required"`
	MaxOccupancy int      `json:"maxOccupancy" binding:"required"`
	Description  string   `json:"description" binding:"required"`
	RoomName     string   `json:"roomName" binding:"required"`
	Resources    []string `json:"resources" binding:"required"`
}
