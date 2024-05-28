package utils

import (
	"crypto/rand"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
)

func SetupLogger() {
	// Open or create the log file
	logFile := configs.GetLogFileName()

	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(fmt.Printf("Failed to open log file: %v", err))
	}
	//defer file.Close()

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
	num = num % 10000 // Ensure it's a 4-digit number
	return num, nil
}

// Function to generate an employee ID with the structure OCCUPIYYYYXXXX
func GenerateEmployeeID() (string, error) {
	currentYear := time.Now().Year()
	randomNum, err := generateRandomNumber()
	if err != nil {
		return "", err
	}
	employeeID := fmt.Sprintf("OCCUPI%d%04d", currentYear, randomNum)
	return employeeID, nil
}
