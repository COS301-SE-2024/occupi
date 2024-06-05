package models

// expected user structure from api requests
type RequestUser struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// expected structure of otp from api requests
type RequestUserOTP struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}
