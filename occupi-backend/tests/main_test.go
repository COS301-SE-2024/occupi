package tests

import (
	"log"
	"os"
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/joho/godotenv"
)

func TestMain(m *testing.M) {

	log.Println("Configuring test env")

	// Load environment variables from .env file
	if err := godotenv.Load("../.test.env"); err != nil {
		log.Fatal("Error loading .env file: ", err)
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// begin seeding the mock database
	database.SeedMockDatabase("../data/test_data.json")

	log.Println("Starting up tests")

	os.Exit(m.Run())
}
