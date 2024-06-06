package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

// occupi backend entry point
func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal(fmt.Printf("Error loading .env file with error as %s", err))
	}

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := database.ConnectToDatabase()

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// Set trusted proxies
	err := ginRouter.SetTrustedProxies(configs.GetTrustedProxies())
	if err != nil {
		logrus.Fatal("Failed to set trusted proxies: ", err)
	}

	// adding rate limiting middleware
	middleware.AttachRateLimitMiddleware(ginRouter)

	// Register routes
	router.OccupiRouter(ginRouter, db)

	certFile := configs.GetCertFileName()
	keyFile := configs.GetKeyFileName()

	// fatal error if the cert or key file is not found
	if certFile == "CERT_FILE_NAME" || keyFile == "KEY_FILE_NAME" {
		logrus.Fatal("Cert or Key file not found")
	}

	// Listening on the port with TLS
	if err := ginRouter.RunTLS(":"+configs.GetPort(), certFile, keyFile); err != nil {
		logrus.Fatal("Failed to run server: ", err)
	}
}
