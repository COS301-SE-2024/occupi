package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"regexp"
	"time"

	"github.com/alexedwards/argon2id"
	"github.com/microcosm-cc/bluemonday"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
)

// sets up the logger and configures it
func SetupLogger() {
	// Open or create the log file
	logFile := configs.GetLogFileName()

	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(fmt.Printf("Failed to open log file: %v", err))
	}
	// defer file.Close()

	// Set the output of the logs to the file
	logrus.SetOutput(file)

	// Set custom formatter to include full timestamp and other options
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
	})

	// Set log level (optional, defaults to Info)
	logrus.SetLevel(logrus.InfoLevel)
}

// Function to generate a random 4-digit number
func generateRandomNumber() (int, error) {
	var num int
	b := make([]byte, 2)
	_, err := rand.Read(b)
	if err != nil {
		return 0, err
	}
	num = int(b[0])<<8 + int(b[1])
	num %= 10000 // Ensure it's a 4-digit number
	return num, nil
}

// Function to generate an employee ID with the structure OCCUPIYYYYXXXX
func GenerateEmployeeID() string {
	currentYear := time.Now().Year()
	randomNum, err := generateRandomNumber()
	if err != nil {
		return "OCCUPI00000000"
	}
	employeeID := fmt.Sprintf("OCCUPI%d%04d", currentYear, randomNum)
	return employeeID
}

// Function to validate a given employee ID with the structure OCCUPIYYYYXXXX where YYYY is year and XXXX is a 4-digit number
func ValidateEmployeeID(employeeID string) bool {
	// Regex pattern for employee ID validation
	var employeeIDRegex = regexp.MustCompile(`^OCCUPI\d{4}\d{4}$`)
	return employeeIDRegex.MatchString(employeeID)
}

// Function to generate an employee ID with the structure OCCUPIYYYYXXXX
func GenerateBookingID() string {
	currentYear := time.Now().Year()
	randomNum, err := generateRandomNumber()
	if err != nil {
		return "BOOKOCCUPI00000000"
	}
	employeeID := fmt.Sprintf("BOOKOCCUPI%d%04d", currentYear, randomNum)
	return employeeID
}

// generates a random auth0 state
func GenerateRandomState() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	state := base64.StdEncoding.EncodeToString(b)

	return state, nil
}

// sanitizes the given input
func SanitizeInput(input string) string {
	p := bluemonday.UGCPolicy()
	return p.Sanitize(input)
}

// validates an email against a regex pattern
func ValidateEmail(email string) bool {
	// Regex pattern for email validation
	var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// validates a password against a regex pattern
func ValidatePassword(password string) bool {
	// Note: Golang does not support lookaheads in regex so regex looks very different and verbose
	var (
		lowercaseLetter = regexp.MustCompile(`[a-z]`)
		uppercaseLetter = regexp.MustCompile(`[A-Z]`)
		digit           = regexp.MustCompile(`\d`)
		specialChar     = regexp.MustCompile(`[@$!%*?&]`)
	)

	if len(password) < 8 {
		return false
	}

	if !lowercaseLetter.MatchString(password) {
		return false
	}

	if !uppercaseLetter.MatchString(password) {
		return false
	}

	if !digit.MatchString(password) {
		return false
	}

	if !specialChar.MatchString(password) {
		return false
	}

	return true
}

// validates an otp against a regex pattern
func ValidateOTP(otp string) bool {
	// Regex pattern for otp validation
	var otpRegex = regexp.MustCompile(`^[0-9]{6}$`)
	return otpRegex.MatchString(otp)
}

// hashes a password using argon2id algorithm
func Argon2IDHash(password string) (string, error) {
	// CreateHash returns a Argon2id hash of a plain-text password using the
	// provided algorithm parameters. The returned hash follows the format used
	// by the Argon2 reference C implementation and looks like this for hash of "pa$$word":
	// $argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
	hash, err := argon2id.CreateHash(password, argon2id.DefaultParams)
	if err != nil {
		return "", err
	}
	return hash, nil
}

// compares a password and it's hash using argon2id
func CompareArgon2IDHash(password string, hashedPassword string) (bool, error) {
	// ComparePasswordAndHash compares a plain-text password with a Argon2id hash and returns true if the
	// password and hash match, otherwise it returns false.
	match, err := argon2id.ComparePasswordAndHash(password, hashedPassword)
	if err != nil {
		return false, err
	}
	return match, nil
}
