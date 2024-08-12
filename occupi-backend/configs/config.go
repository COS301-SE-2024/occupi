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
	MongodbStartURI     = "MONGODB_START_URI"
	Port                = "PORT"
	LogFileName         = "LOG_FILE_NAME"
	SMTPHost            = "SMTP_HOST"
	SMTPPort            = "SMTP_PORT"
	SMTPPassword        = "SMTP_PASSWORD"
	SystemEmail         = "SYSTEM_EMAIL"
	CertificateFilePath = "CERTIFICATE_FILE_PATH"
	KeyFilePath         = "KEY_FILE_PATH"
	GinRunMode          = "GIN_RUN_MODE"
	TrustedProxies      = "TRUSTED_PROXIES"
	JwtSecret           = "JWT_SECRET"
	SessionSecret       = "SESSION_SECRET"
	OccupiDomains       = "OCCUPI_DOMAINS"
	Env                 = "ENV"
	OtpExpiration       = "OTP_EXPIRATION"
	CacheEviction       = "CACHE_EVICTION"
	OtpGenReqEviction   = "OTP_GEN_REQ_EVICTION"
	AllowOriginsVal     = "ALLOW_ORIGINS"
	AllowMethodsVal     = "ALLOW_METHODS"
	AllowHeadersVal     = "ALLOW_HEADERS"
	ExposeHeadersVal    = "EXPOSE_HEADERS"
	Caval               = "ALLOW_CREDENTIALS"
	MaxAgeVal           = "MAX_AGE"
	IPCIT               = "IP_CLIENT_INFO_TOKEN"
	RabbitMQUsername    = "RABBITMQ_USERNAME"
	RabbitMQPassword    = "RABBITMQ_PASSWORD"
	RabbitMQHost        = "RABBITMQ_HOST"
	RabbitMQPort        = "RABBITMQ_PORT"
	RPID                = "RP_ID"
	RPName              = "RP_NAME"
	RPOrigins           = "RP_ORIGINS"
	CentrifugoAKy       = "CENTRIFUGO_API_KEY"
	CentrifugoHost      = "CENTRIFUGO_HOST"
	CentrifugoPort      = "CENTRIFUGO_PORT"
	NewRelicAppName     = "NEW_RELIC_APP_NAME"
	SentryDSN           = "SENTRY_DSN"
	PassPhrase          = "TEST_PASS_PHRASE"
	NewRelicLicenseKey  = "NEW_RELIC_LICENSE_KEY"
	MiddlewareService   = "MIDDLEWARE_SERVICE"
	MiddelwareAT        = "MIDDLEWARE_ACCESS_TOKEN"
	MiddlewareTarget    = "MIDDLEWARE_TARGET"
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
	startURI := viper.GetString(MongodbStartURI)
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
	port := viper.GetString(SMTPPort)
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
	password := viper.GetString(SMTPPassword)
	if password == "" {
		password = ""
	}
	return password
}

// gets the smtp host as defined in the config.yaml file
func GetSMTPHost() string {
	host := viper.GetString(SMTPHost)
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

// gets the OTP expiration time as defined in the config.yaml file in seconds
func GetOTPExpiration() int {
	expiration := viper.GetInt(OtpExpiration)
	if expiration == 0 {
		expiration = 600
	}
	return expiration
}

// gets the cache eviction time as defined in the config.yaml file in seconds
func GetCacheEviction() int {
	time := viper.GetInt(CacheEviction)
	if time == 0 {
		time = 600
	}
	return time
}

// gets the otp request eviction time as defined in the config.yaml file in seconds
func GetOTPReqEviction() int {
	time := viper.GetInt(OtpGenReqEviction)
	if time == 0 {
		time = 60
	}
	return time
}

// gets allow origins as defined in the config.yaml file
func GetAllowOrigins() []string {
	origins := viper.GetString(AllowOriginsVal)
	if origins != "" {
		originList := strings.Split(origins, ",")
		return originList
	}
	return []string{"*"}
}

// gets allow methods as defined in the config.yaml file
func GetAllowMethods() []string {
	methods := viper.GetString(AllowMethodsVal)
	if methods != "" {
		methodList := strings.Split(methods, ",")
		return methodList
	}
	return []string{"*"}
}

// gets allow headers as defined in the config.yaml file
func GetAllowHeaders() []string {
	headers := viper.GetString(AllowHeadersVal)
	if headers != "" {
		headerList := strings.Split(headers, ",")
		return headerList
	}
	return []string{"*"}
}

// gets expose headers as defined in the config.yaml file
func GetExposeHeaders() []string {
	headers := viper.GetString(ExposeHeadersVal)
	if headers != "" {
		headerList := strings.Split(headers, ",")
		return headerList
	}
	return []string{"*"}
}

// gets allow credentials as defined in the config.yaml file
func GetAllowCredentials() bool {
	credentials := viper.GetBool(Caval)
	return credentials
}

// gets max age as defined in the config.yaml file
func GetMaxAge() int {
	age := viper.GetInt(MaxAgeVal)
	return age
}

// gets the IP client info token as defined in the config.yaml file
func GetIPClientInfoToken() string {
	val := viper.GetString(IPCIT)
	if val == "" {
		val = "IP_CLIENT_INFO_TOKEN"
	}
	return val
}

// gets the rabbitmq username as defined in the config.yaml file
func GetRabbitMQUsername() string {
	username := viper.GetString(RabbitMQUsername)
	if username == "" {
		username = "RABBITMQ_USERNAME"
	}
	return username
}

// gets the rabbitmq password as defined in the config.yaml file
func GetRabbitMQPassword() string {
	password := viper.GetString(RabbitMQPassword)
	if password == "" {
		password = "RABBITMQ_PASSWORD"
	}
	return password
}

// gets the rabbitmq host as defined in the config.yaml file
func GetRabbitMQHost() string {
	host := viper.GetString(RabbitMQHost)
	if host == "" {
		host = "RABBITMQ_HOST"
	}
	return host
}

// gets the rabbitmq port as defined in the config.yaml file
func GetRabbitMQPort() string {
	port := viper.GetString(RabbitMQPort)
	if port == "" {
		port = "RABBITMQ_PORT"
	}
	return port
}

func GetRPID() string {
	id := viper.GetString(RPID)
	if id == "" {
		id = "RP_ID"
	}
	return id
}

func GetRPName() string {
	name := viper.GetString(RPName)
	if name == "" {
		name = "RP_NAME"
	}
	return name
}

func GetRPOrigins() []string {
	origins := viper.GetString(RPOrigins)
	if origins != "" {
		originList := strings.Split(origins, ",")
		return originList
	}
	return []string{}
}

func GetCentrifugoAPIKey() string {
	key := viper.GetString(CentrifugoAKy)
	if key == "" {
		key = "CENTRIFUGO_API_KEY"
	}
	return key
}

func GetCentrifugoHost() string {
	host := viper.GetString(CentrifugoHost)
	if host == "" {
		host = "CENTRIFUGO_HOST"
	}
	return host
}

func GetCentrifugoPort() string {
	port := viper.GetString(CentrifugoPort)
	if port == "" {
		port = "CENTRIFUGO_PORT"
	}
	return port
}

// gets the config license as defined in the config.yaml file
func GetConfigLicense() string {
	license := viper.GetString(NewRelicLicenseKey)
	if license == "" {
		license = "NEW_RELIC_LICENSE_KEY"
	}
	return license
}

func GetNewRelicAppName() string {
	appName := viper.GetString(NewRelicAppName)
	if appName == "" {
		appName = "NEW_RELIC_APP_NAME"
	}
	return appName
}

func GetSentryDSN() string {
	dsn := viper.GetString(SentryDSN)
	if dsn == "" {
		dsn = "SENTRY_DSN"
	}
	return dsn
}

func GetTestPassPhrase() string {
	passPhrase := viper.GetString(PassPhrase)
	if passPhrase == "" {
		passPhrase = "TEST_PASS_PHRASE"
	}
	return passPhrase
}

func GetMiddlewareService() string {
	service := viper.GetString(MiddlewareService)
	if service == "" {
		service = "MIDDLEWARE_SERVICE"
	}
	return service
}

func GetMiddlewareAccessToken() string {
	token := viper.GetString(MiddelwareAT)
	if token == "" {
		token = "MIDDLEWARE_ACCESS_TOKEN"
	}
	return token
}

func GetMiddlewareTarget() string {
	target := viper.GetString(MiddlewareTarget)
	if target == "" {
		target = "MIDDLEWARE_TARGET"
	}
	return target
}
