/*
occupi-backend is the backend server for the occupi project.
It is responsible for handling all the requests from the frontend and interacting with the database.

Usage:

	go run cmd/occupi-backend/main.go [environment]

The environment flag is used to specify the environment in which the server should run.

	    -env=dev.localhost
			This specifies that the server should run in development mode on localhost. This is the default environment.

		-env=dev.deployed
			This specifies that the server should run in development mode on a deployed server.

		-env=prod
			This specifies that the server should run in production mode.

		-env=test
			This specifies that the server should run in test mode.
*/
package main

import (
	"flag"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

// occupi backend entry point
func main() {
	// Define the environment flag
	env := flag.String("env", "dev.localhost", "Environment to use (dev.localhost, dev.deployed, prod)")
	flag.Parse()

	// init viper
	configs.InitViper(env)

	// setup logger to log all server interactions
	utils.SetupLogger()

	// connect to the database
	db := configs.ConnectToDatabase()

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

	// logrus all env variables
	logrus.Infof("Server running on port: %s", configs.GetPort())
	logrus.Infof("Server running in %s mode", configs.GetGinRunMode())
	logrus.Infof("Server running with cert file: %s", certFile)
	logrus.Infof("Server running with key file: %s", keyFile)

	// Listening on the port with TLS if env is prod or dev.deployed
	if configs.GetEnv() == "prod" || configs.GetEnv() == "devdeployed" {
		if err := ginRouter.RunTLS(":"+configs.GetPort(), certFile, keyFile); err != nil {
			logrus.Fatal("Failed to run server: ", err)
		}
	} else {
		if err := ginRouter.Run(":" + configs.GetPort()); err != nil {
			logrus.Fatal("Failed to run server: ", err)
		}
	}
}
