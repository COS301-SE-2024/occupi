package models

type Resource struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type User struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

type UserOTP struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}
