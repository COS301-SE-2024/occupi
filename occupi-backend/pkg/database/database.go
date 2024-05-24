package database

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

var resources = []models.Resource{
	{ID: "1", Name: "Resource One"},
}

func GetDatabase() []models.Resource {
	//print configs just as an example. This will be removed once concept is understood
	port := configs.GetPort() //this is just an example to show how to use configs
	println(port)
	return resources
}

//lets pretend a database connection has been made and GetDatabase returns the connection
