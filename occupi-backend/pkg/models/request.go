package models

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

type ErrorMsg struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type QueryInput struct {
	Filter     map[string]interface{} `json:"filter"`
	Projection []string               `json:"projection"`
	Limit      int64                  `json:"limit"`
	Page       int64                  `json:"page"`
}
