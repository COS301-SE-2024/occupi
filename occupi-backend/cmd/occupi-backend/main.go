package main

import (
	"fmt"
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
	//setup logger to log all server interactions
	utils.SetupLogger()

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		logrus.Error("Error loading .env file")
	}

	//connect to the database
	db := database.ConnectToDatabase()
	r := router.OccupiRouter(db)
	logrus.Error(
		http.ListenAndServe( //add tls in a bit
			fmt.Sprintf(":%s", configs.GetPort()),
			middleware.LoggingMiddleware(r),
		),
	)
}
