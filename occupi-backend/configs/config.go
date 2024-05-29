package configs

import (
	"os"
	"strings"
)

//define configs in this file

// gets the port to start the server on as defined in the .env file
func GetPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "PORT"
	}
	return port
}

// gets the mongodb username as defined in the .env file
func GetMongoDBUsername() string {
	username := os.Getenv("MONGODB_USERNAME")
	if username == "" {
		username = "MONGODB_USERNAME"
	}
	return username
}

// gets the mongodb password as defined in the .env file
func GetMongoDBPassword() string {
	password := os.Getenv("MONGODB_PASSWORD")
	if password == "" {
		password = "MONGODB_PASSWORD"
	}
	return password
}

// gets the mongodb cluster uri as defined in the .env file
func GetMongoDBCLUSTERURI() string {
	uri := os.Getenv("MONGODB_CLUSTERURI")
	if uri == "" {
		uri = "MONGODB_CLUSTERURI"
	}
	return uri
}

// gets the mongodb name as defined in the .env file
func GetMongoDBName() string {
	name := os.Getenv("MONGODB_DBNAME")
	if name == "" {
		name = "MONGODB_DBNAME"
	}
	return name
}

// gets the mongodb start uri as defined in the .env file
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

// gets the system email as defined in the .env file
func GetSystemEmail() string {
	email := os.Getenv("SYSTEM_EMAIL")
	if email == "" {
		email = ""
	}
	return email
}

// gets the smtp port as defined in the .env file
func GetSmtpPort() string {
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "587"
	}
	return port
}

// gets the smtp password as defined in the .env file
func GetSmtpPassword() string {
	password := os.Getenv("SMTP_PASSWORD")
	if password == "" {
		password = ""
	}
	return password
}

// gets the smtp host as defined in the .env file
func GetSmtpHost() string {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		host = "smtp.gmail.com"
	}
	return host
}

// gets the certificate file name as defined in the .env file
func GetCertFileName() string {
	certFileName := os.Getenv("CERT_FILE_NAME")
	if certFileName == "" {
		certFileName = "CERT_FILE_NAME"
	}
	return certFileName
}

// gets the key file name as defined in the .env file
func GetKeyFileName() string {
	keyFileName := os.Getenv("KEY_FILE_NAME")
	if keyFileName == "" {
		keyFileName = "KEY_FILE_NAME"
	}
	return keyFileName
}

// gets gins run mode as defined in the .env file
func GetGinRunMode() string {
	ginRunMode := os.Getenv("GIN_RUN_MODE")
	if ginRunMode == "" {
		ginRunMode = "debug"
	}
	return ginRunMode
}

// gets list of trusted proxies as defined in the .env file
func GetTrustedProxies() []string {
	trustedProxies := os.Getenv("TRUSTED_PROXIES")
	if trustedProxies != "" {
		proxyList := strings.Split(trustedProxies, ",")
		return proxyList
	} else {
		return []string{""}
	}
}
