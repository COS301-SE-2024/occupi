package tests

import (
	"log"
	"os"
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func TestMain(m *testing.M) {

	log.Println("Configuring test env")

	// init viper
	env := "test"
	configs.InitViper(&env, "../configs")

	// setup logger to log all server interactions
	utils.SetupLogger()

	// begin seeding the mock database
	configs.SeedMockDatabase("../data/test_data.json")

	log.Println("Starting up tests")

	os.Exit(m.Run())
}
