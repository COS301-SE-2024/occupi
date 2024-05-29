package models

//strucutre of resource object
type Resource struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

//strucutre of users
type User struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Token    string `json:"token"`
}

// strucutre of otp
type UserOTP struct {
	Email string `json:"email"`
	OTP   string `json:"otp"`
}
