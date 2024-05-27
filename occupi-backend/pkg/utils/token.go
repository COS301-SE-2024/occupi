package utils

import (
	"crypto/rand"
	"encoding/hex"
)

func GenerateToken() (string, error) {
	token := make([]byte, 16)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(token), nil
}
