package configs

import (
	"os"
)

//define configs in this file

func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "PORT"
	}
	return port
}

func GetMongoDBUsername() string {
	username := os.Getenv("MONGODB_USERNAME")
	if username == "" {
		username = "MONGODB_USERNAME"
	}
	return username
}

func GetMongoDBPassword() string {
	password := os.Getenv("MONGODB_PASSWORD")
	if password == "" {
		password = "MONGODB_PASSWORD"
	}
	return password
}

func GetMongoDBCLUSTERURI() string {
	uri := os.Getenv("MONGODB_CLUSTERURI")
	if uri == "" {
		uri = "MONGODB_CLUSTERURI"
	}
	return uri
}

func GetMongoDBName() string {
	name := os.Getenv("MONGODB_DBNAME")
	if name == "" {
		name = "MONGODB_DBNAME"
	}
	return name
}

func GetMongoDBStartURI() string {
	startURI := os.Getenv("MONGODB_START_URI")
	if startURI == "" {
		startURI = "MONGODB_START_URI"
	}
	return startURI
}

func GetLogFileName() string {
	logFileName := os.Getenv("LOG_FILE_NAME")
	if logFileName == "" {
		logFileName = "LOG_FILE_NAME"
	}
	return logFileName
}

func GetSystemEmail() string {
	email := os.Getenv("SYSTEM_EMAIL")
	if email == "" {
		email = ""
	}
	return email
}

func GetSmtpPort() string {
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	return port
}

func GetSmtpPassword() string {
	password := os.Getenv("SMTP_PASSWORD")
	if password == "" {
		password = ""
	}
	return password
}

func GetSmtpHost() string {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		host = "smtp.gmail.com"
	}
	return host
}

func GetCertFileName() string {
	certFileName := os.Getenv("CERT_FILE_NAME")
	if certFileName == "" {
		certFileName = "CERT_FILE_NAME"
	}
	return certFileName
}

func GetKeyFileName() string {
	keyFileName := os.Getenv("KEY_FILE_NAME")
	if keyFileName == "" {
		keyFileName = "KEY_FILE_NAME"
	}
	return keyFileName
}
