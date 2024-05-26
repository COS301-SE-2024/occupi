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
		log.Fatal("Error loading .env file")
	}

	//setup logger to log all server interactions
	utils.SetupLogger()

	//connect to the database
	db := database.ConnectToDatabase()

	//create a router
	r := router.OccupiRouter(db)

	//listening on the port
	logrus.Error(
		http.ListenAndServe( //add tls in a bit
			fmt.Sprintf(":%s", configs.GetPort()),
			middleware.LoggingMiddleware(r),
		),
	)
}
