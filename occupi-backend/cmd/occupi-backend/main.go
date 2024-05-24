package main

import (
	"log"
	"net/http"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
)

func main() {
	db := database.GetDatabase()
	r := router.NewRouter(db)
	log.Fatal(http.ListenAndServe(":8080", middleware.LoggingMiddleware(r)))
}
