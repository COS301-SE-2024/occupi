package configs

import (
	"os"
)

//define configs in this file

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	return port
}
