package tests

import (
	"testing"
	"time"

	"github.com/joho/godotenv"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerateToken(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	email := "test1@example.com"
	role := constants.Admin
	tokenString, expirationTime, err := authenticator.GenerateToken(email, role)

	require.NoError(t, err)
	require.NotEmpty(t, tokenString)
	require.WithinDuration(t, time.Now().Add(24*7*time.Hour), expirationTime, time.Second)

	// Validate the token
	claims, err := authenticator.ValidateToken(tokenString)
	require.NoError(t, err)
	require.NotNil(t, claims)
	assert.Equal(t, email, claims.Email)
	assert.Equal(t, role, claims.Role)
}

func TestValidateToken(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	email := "test2@example.com"
	role := constants.Admin
	tokenString, _, err := authenticator.GenerateToken(email, role)

	require.NoError(t, err)
	require.NotEmpty(t, tokenString)

	// Validate the token
	claims, err := authenticator.ValidateToken(tokenString)
	require.NoError(t, err)
	require.NotNil(t, claims)
	assert.Equal(t, email, claims.Email)
	assert.Equal(t, role, claims.Role)
}

func TestValidateTokenExpired(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	email := "test3@example.com"
	role := constants.Admin

	// Generate a token that expires in 1 second
	tokenString, _, err := authenticator.GenerateToken(email, role, 1*time.Second)
	require.NoError(t, err)
	require.NotEmpty(t, tokenString)

	// Wait for the token to expire
	time.Sleep(2 * time.Second)

	// Validate the token
	claims, err := authenticator.ValidateToken(tokenString)
	require.Error(t, err)
	assert.Nil(t, claims)
}

func TestInvalidToken(t *testing.T) {
	// Load environment variables from .env file
	if err := godotenv.Load("../.env"); err != nil {
		t.Fatal("Error loading .env file: ", err)
	}

	// Test with an invalid token
	invalidTokenString := "invalid_token"
	claims, err := authenticator.ValidateToken(invalidTokenString)
	require.Error(t, err)
	assert.Nil(t, claims)
}
