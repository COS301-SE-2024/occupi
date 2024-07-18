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
	UseCookies  		bool  `json:"use_cookies"`
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
	Email              string `json:"email" binding:"required,email"`
	Twofa              string `json:"2fa"`
	CurrentPassword    string `json:"currentPassword"`
	NewPassword        string `json:"newPassword"`
	NewPasswordConfirm string `json:"newPasswordConfirm"`
}
