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

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/application"
)

// occupi backend entry point
func main() {
	// Define the environment flag
	env := flag.String("env", "dev.localhost", "Environment to use (dev.localhost, dev.localhost.docker, dev.deployed, prod)")
	flag.Parse()

	// Create and configure the application
	app := application.NewApplication().
		SetEnvironment(*env).
		InitializeConfig().
		SetupLogger().
		CreateAppSession().
		StartConsumer().
		SetupRouter().
		AddCORSPolicy().
		SetTrustedProxies().
		AttachRateLimitMiddleware().
		AttachSessionMiddleware().
		AttachTimeZoneMiddleware().
		AttachRealIPMiddleware().
		AttachMoniteringMiddleware().
		//AttachObservabilityMiddleware().
		RegisterRoutes().
		SetEnvVariables()

	app.RunServer()
}
