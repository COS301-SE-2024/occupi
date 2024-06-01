package models

type RequestUser struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// structure of otp
type RequestUserOTP struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}
