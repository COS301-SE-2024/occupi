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
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	nrgin "github.com/newrelic/go-agent/v3/integrations/nrgin"
	"github.com/newrelic/go-agent/v3/newrelic"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/reciever"
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

	// create a new app session
	appsession := createAppSession()

	// start the consumer
	go reciever.StartConsumeMessage(appsession)

	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	// Create a Gin router
	ginRouter := gin.Default()

	// Set CORS
	addCORSPolicy(ginRouter)

	// Set trusted proxies
	setTrustedProxies(ginRouter)

	// adding rate limiting middleware
	middleware.AttachRateLimitMiddleware(ginRouter)

	// adding newrelic middleware
	attachNewRelicMiddleware(ginRouter)

	// attach session middleware
	attachSessionMiddleware(ginRouter)

	// Register routes
	router.OccupiRouter(ginRouter, appsession)

	// Run the server
	runServer(ginRouter)
}

func createAppSession() *models.AppSession {
	// create a new app session
	db := configs.ConnectToDatabase(constants.AdminDBAccessOption)
	cache := configs.CreateCache()
	appsession := models.New(db, cache)
	return appsession
}

func addCORSPolicy(ginRouter *gin.Engine) {
	// Set CORS
	ginRouter.Use(cors.New(cors.Config{
		AllowOrigins:     configs.GetAllowOrigins(),
		AllowMethods:     configs.GetAllowMethods(),
		AllowHeaders:     configs.GetAllowHeaders(),
		ExposeHeaders:    configs.GetExposeHeaders(),
		AllowCredentials: configs.GetAllowCredentials(),
		MaxAge:           time.Duration(configs.GetMaxAge()) * time.Second,
	}))
}

func setTrustedProxies(ginRouter *gin.Engine) {
	// Set trusted proxies
	err := ginRouter.SetTrustedProxies(configs.GetTrustedProxies())
	if err != nil {
		logrus.Fatal("Failed to set trusted proxies: ", err)
	}
}

func attachNewRelicMiddleware(ginRouter *gin.Engine) {
	if configs.GetEnv() == "prod" || configs.GetEnv() == "devdeployed" {
		// Create a newrelic application
		app, err := newrelic.NewApplication(
			newrelic.ConfigAppName("occupi-backend"),
			newrelic.ConfigLicense(configs.GetConfigLicense()),
			newrelic.ConfigAppLogForwardingEnabled(true),
		)
		if err != nil {
			logrus.Fatal("Failed to create newrelic application: ", err)
		}

		// adding newrelic middleware
		ginRouter.Use(nrgin.Middleware(app))
	}
}

func attachSessionMiddleware(ginRouter *gin.Engine) {
	// creating a new valid session for management of shared variables
	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))
}

func runServer(ginRouter *gin.Engine) {
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
