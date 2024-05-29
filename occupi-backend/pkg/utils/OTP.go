package utils

import (
	"crypto/rand"
	"fmt"
)

// generates a new OTP
func GenerateOTP() (string, error) {
	b := make([]byte, 3)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	otp := fmt.Sprintf("%06d", int(b[0])<<16|int(b[1])<<8|int(b[2]))
	return otp[:6], nil // Ensure it's exactly 6 digits
}
