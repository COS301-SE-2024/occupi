package configs

import (
	"log"
	"strconv"
	"strings"

	"github.com/spf13/viper"
)

const (
	MONGODB_USERNAME      = "MONGODB_USERNAME"
	MONGODB_PASSWORD      = "MONGODB_PASSWORD"
	MONGODB_CLUSTERURI    = "MONGODB_CLUSTERURI"
	MONGODB_DBNAME        = "MONGODB_DBNAME"
	MONGODB_START_URI     = "MONGODB_START_URI"
	PORT                  = "PORT"
	LOG_FILE_NAME         = "LOG_FILE_NAME"
	SMTP_HOST             = "SMTP_HOST"
	SMTP_PORT             = "SMTP_PORT"
	SMTP_PASSWORD         = "SMTP_PASSWORD"
	SYSTEM_EMAIL          = "SYSTEM_EMAIL"
	CERTIFICATE_FILE_PATH = "CERTIFICATE_FILE_PATH"
	KEY_FILE_PATH         = "KEY_FILE_PATH"
	GIN_RUN_MODE          = "GIN_RUN_MODE"
	TRUSTED_PROXIES       = "TRUSTED_PROXIES"
	JWT_SECRET            = "JWT_SECRET"
	SESSION_SECRET        = "SESSION_SECRET"
	OCCUPI_DOMAINS        = "OCCUPI_DOMAINS"
	ENV                   = "ENV"
)

// init viper
func InitViper(envtype *string, configpath ...string) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	if len(configpath) > 0 {
		viper.AddConfigPath(configpath[0])
	} else {
		viper.AddConfigPath("./configs")
	}
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file: %s", err)
	}

	// Merge environment-specific config
	viper.SetConfigName(*envtype)
	if err := viper.MergeInConfig(); err != nil {
		log.Fatalf("Error merging config file: %s", err)
	}
}

// gets the port to start the server on as defined in the .env file
func GetPort() string {
	port := viper.GetString(PORT)
	if port == "" {
		port = "PORT"
	}
	return port
}

// gets the mongodb username as defined in the .env file
func GetMongoDBUsername() string {
	username := viper.GetString(MONGODB_USERNAME)
	if username == "" {
		username = "MONGODB_USERNAME"
	}
	return username
}

// gets the mongodb password as defined in the .env file
func GetMongoDBPassword() string {
	password := viper.GetString(MONGODB_PASSWORD)
	if password == "" {
		password = "MONGODB_PASSWORD"
	}
	return password
}

// gets the mongodb cluster uri as defined in the .env file
func GetMongoDBCLUSTERURI() string {
	uri := viper.GetString(MONGODB_CLUSTERURI)
	if uri == "" {
		uri = "MONGODB_CLUSTERURI"
	}
	return uri
}

// gets the mongodb name as defined in the .env file
func GetMongoDBName() string {
	name := viper.GetString(MONGODB_DBNAME)
	if name == "" {
		name = "MONGODB_DBNAME"
	}
	return name
}

// gets the mongodb start uri as defined in the .env file
func GetMongoDBStartURI() string {
	startURI := viper.GetString(MONGODB_START_URI)
	if startURI == "" {
		startURI = "MONGODB_START_URI"
	}
	return startURI
}

func GetLogFileName() string {
	logFileName := viper.GetString(LOG_FILE_NAME)
	if logFileName == "" {
		logFileName = "LOG_FILE_NAME"
	}
	return logFileName
}

// gets the system email as defined in the .env file
func GetSystemEmail() string {
	email := viper.GetString(SYSTEM_EMAIL)
	if email == "" {
		email = ""
	}
	return email
}

// GetSMTPPort retrieves the SMTP port from the environment and converts it to an integer.
// If the environment variable is not set, it returns the default port 587.
func GetSMTPPort() int {
	port := viper.GetString(SMTP_PORT)
	if port == "" {
		return 587
	}

	portInt, err := strconv.Atoi(port)
	if err != nil {
		// If the conversion fails, return the default port 587
		return 587
	}
	return portInt
}

// gets the smtp password as defined in the .env file
func GetSMTPPassword() string {
	password := viper.GetString(SMTP_PASSWORD)
	if password == "" {
		password = ""
	}
	return password
}

// gets the smtp host as defined in the .env file
func GetSMTPHost() string {
	host := viper.GetString(SMTP_HOST)
	if host == "" {
		host = "smtp.gmail.com"
	}
	return host
}

// gets the certificate file name as defined in the .env file
func GetCertFileName() string {
	certFileName := viper.GetString(CERTIFICATE_FILE_PATH)
	if certFileName == "" {
		certFileName = "CERTIFICATE_FILE_PATH"
	}
	return certFileName
}

// gets the key file name as defined in the .env file
func GetKeyFileName() string {
	keyFileName := viper.GetString(KEY_FILE_PATH)
	if keyFileName == "" {
		keyFileName = "KEY_FILE_PATH"
	}
	return keyFileName
}

// gets gins run mode as defined in the .env file
func GetGinRunMode() string {
	ginRunMode := viper.GetString(GIN_RUN_MODE)
	if ginRunMode == "" {
		ginRunMode = "debug"
	}
	return ginRunMode
}

// gets list of trusted proxies as defined in the .env file
func GetTrustedProxies() []string {
	trustedProxies := viper.GetString(TRUSTED_PROXIES)
	if trustedProxies != "" {
		proxyList := strings.Split(trustedProxies, ",")
		return proxyList
	}
	return []string{""}
}

func GetJWTSecret() string {
	secret := viper.GetString(JWT_SECRET)
	if secret == "" {
		secret = "JWT_SECRET"
	}
	return secret
}

func GetSessionSecret() string {
	secret := viper.GetString(SESSION_SECRET)
	if secret == "" {
		secret = "SESSION_SECRET"
	}
	return secret
}

func GetOccupiDomains() []string {
	domains := viper.GetString(OCCUPI_DOMAINS)
	if domains != "" {
		domainList := strings.Split(domains, ",")
		return domainList
	}
	return []string{""}
}

func GetEnv() string {
	env := viper.GetString(ENV)
	if env == "" {
		env = "ENV"
	}
	return env
}
