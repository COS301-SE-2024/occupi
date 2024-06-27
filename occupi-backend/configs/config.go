package configs

import (
	"log"
	"strconv"
	"strings"

	"github.com/spf13/viper"
)

const (
	MongodbUsername     = "MONGODB_USERNAME"
	MongodbPassword     = "MONGODB_PASSWORD"
	MongodbClusteruri   = "MONGODB_CLUSTERURI"
	MongodbDbname       = "MONGODB_DBNAME"
	MongodbStartUri     = "MONGODB_START_URI"
	Port                = "PORT"
	LogFileName         = "LOG_FILE_NAME"
	SmtpHost            = "SMTP_HOST"
	SmtpPort            = "SMTP_PORT"
	SmtpPassword        = "SMTP_PASSWORD"
	SystemEmail         = "SYSTEM_EMAIL"
	CertificateFilePath = "CERTIFICATE_FILE_PATH"
	KeyFilePath         = "KEY_FILE_PATH"
	GinRunMode          = "GIN_RUN_MODE"
	TrustedProxies      = "TRUSTED_PROXIES"
	JwtSecret           = "JWT_SECRET"
	SessionSecret       = "SESSION_SECRET"
	OccupiDomains       = "OCCUPI_DOMAINS"
	Env                 = "ENV"
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

// gets the port to start the server on as defined in the config.yaml file
func GetPort() string {
	port := viper.GetString(Port)
	if port == "" {
		port = "PORT"
	}
	return port
}

// gets the mongodb username as defined in the config.yaml file
func GetMongoDBUsername() string {
	username := viper.GetString(MongodbUsername)
	if username == "" {
		username = "MONGODB_USERNAME"
	}
	return username
}

// gets the mongodb password as defined in the config.yaml file
func GetMongoDBPassword() string {
	password := viper.GetString(MongodbPassword)
	if password == "" {
		password = "MONGODB_PASSWORD"
	}
	return password
}

// gets the mongodb cluster uri as defined in the config.yaml file
func GetMongoDBCLUSTERURI() string {
	uri := viper.GetString(MongodbClusteruri)
	if uri == "" {
		uri = "MONGODB_CLUSTERURI"
	}
	return uri
}

// gets the mongodb name as defined in the config.yaml file
func GetMongoDBName() string {
	name := viper.GetString(MongodbDbname)
	if name == "" {
		name = "MONGODB_DBNAME"
	}
	return name
}

// gets the mongodb start uri as defined in the config.yaml file
func GetMongoDBStartURI() string {
	startURI := viper.GetString(MongodbStartUri)
	if startURI == "" {
		startURI = "MONGODB_START_URI"
	}
	return startURI
}

// gets the log file name as defined in the config.yaml file
func GetLogFileName() string {
	logFileName := viper.GetString(LogFileName)
	if logFileName == "" {
		logFileName = "LOG_FILE_NAME"
	}
	return logFileName
}

// gets the system email as defined in the config.yaml file
func GetSystemEmail() string {
	email := viper.GetString(SystemEmail)
	if email == "" {
		email = ""
	}
	return email
}

// GetSMTPPort retrieves the SMTP port from the environment and converts it to an integer.
// If the environment variable is not set, it returns the default port 587.
func GetSMTPPort() int {
	port := viper.GetString(SmtpPort)
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

// gets the smtp password as defined in the config.yaml file
func GetSMTPPassword() string {
	password := viper.GetString(SmtpPassword)
	if password == "" {
		password = ""
	}
	return password
}

// gets the smtp host as defined in the config.yaml file
func GetSMTPHost() string {
	host := viper.GetString(SmtpHost)
	if host == "" {
		host = "smtp.gmail.com"
	}
	return host
}

// gets the certificate file name as defined in the config.yaml file
func GetCertFileName() string {
	certFileName := viper.GetString(CertificateFilePath)
	if certFileName == "" {
		certFileName = "CERTIFICATE_FILE_PATH"
	}
	return certFileName
}

// gets the key file name as defined in the config.yaml file
func GetKeyFileName() string {
	keyFileName := viper.GetString(KeyFilePath)
	if keyFileName == "" {
		keyFileName = "KEY_FILE_PATH"
	}
	return keyFileName
}

// gets gins run mode as defined in the config.yaml file
func GetGinRunMode() string {
	ginRunMode := viper.GetString(GinRunMode)
	if ginRunMode == "" {
		ginRunMode = "debug"
	}
	return ginRunMode
}

// gets list of trusted proxies as defined in the config.yaml file
func GetTrustedProxies() []string {
	trustedProxies := viper.GetString(TrustedProxies)
	if trustedProxies != "" {
		proxyList := strings.Split(trustedProxies, ",")
		return proxyList
	}
	return []string{""}
}

// gets the JWT secret as defined in the config.yaml file
func GetJWTSecret() string {
	secret := viper.GetString(JwtSecret)
	if secret == "" {
		secret = "JWT_SECRET"
	}
	return secret
}

// gets the session secret as defined in the config.yaml file
func GetSessionSecret() string {
	secret := viper.GetString(SessionSecret)
	if secret == "" {
		secret = "SESSION_SECRET"
	}
	return secret
}

// gets the list of occupi domains as defined in the config.yaml file
func GetOccupiDomains() []string {
	domains := viper.GetString(OccupiDomains)
	if domains != "" {
		domainList := strings.Split(domains, ",")
		return domainList
	}
	return []string{""}
}

// gets the environment type as defined in the config.yaml file
func GetEnv() string {
	env := viper.GetString(Env)
	if env == "" {
		env = "ENV"
	}
	return env
}
