package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal(fmt.Printf("Error loading .env file with error as %s", err))
	}

	//setup logger to log all server interactions
	utils.SetupLogger()

	//connect to the database
	db := database.ConnectToDatabase()

	//create a router
	r := router.OccupiRouter(db)

	certFile := configs.GetCertFileName()
	keyFile := configs.GetKeyFileName()

	//fatal error if the cert or key file is not found
	if certFile == "CERT_FILE_NAME" || keyFile == "KEY_FILE_NAME" {
		logrus.Fatal("Cert or Key file not found")
	}

	//listening on the port
	logrus.Error(
		http.ListenAndServeTLS(
			fmt.Sprintf(":%s", configs.GetPort()),
			certFile,
			keyFile,
			middleware.LoggingMiddleware(r),
		),
	)
}
