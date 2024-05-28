package configs

import (
	"os"
	"strings"
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

func GetGinRunMode() string {
	ginRunMode := os.Getenv("GIN_RUN_MODE")
	if ginRunMode == "" {
		ginRunMode = "debug"
	}
	return ginRunMode
}

func GetTrustedProxies() []string {
	trustedProxies := os.Getenv("TRUSTED_PROXIES")
	if trustedProxies != "" {
		proxyList := strings.Split(trustedProxies, ",")
		return proxyList
	} else {
		return []string{""}
	}
}
