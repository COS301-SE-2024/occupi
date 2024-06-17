package authenticator

import (
	"errors"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
)

type Claims struct {
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.StandardClaims
}

// GenerateToken generates a JWT token for the user
func GenerateToken(email string, role string) (string, time.Time, error) {
	expirationTime := time.Now().Add(5 * time.Minute)
	claims := &Claims{
		Email: email,
		Role:  role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(configs.GetJWTSecret()))
	if err != nil {
		logrus.Error("Error generating token: ", err)
		return "", expirationTime, errors.New("Error generating token")
	}

	return tokenString, expirationTime, nil
}

// ValidateToken validates the JWT token
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(configs.GetJWTSecret()), nil
	})

	if err != nil {
		logrus.Error("Error validating token: ", err)
		return nil, errors.New("Error validating token")
	}

	if !token.Valid {
		logrus.Error("Token is invalid")
		return nil, errors.New("Token is invalid")
	}

	return claims, nil
}
