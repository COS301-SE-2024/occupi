package application

import (
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/newrelic/go-agent/v3/integrations/nrgin"
	"github.com/newrelic/go-agent/v3/integrations/nrlogrus"
	"github.com/newrelic/go-agent/v3/newrelic"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/receiver"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/router"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

type Application struct {
	ginRouter  *gin.Engine
	appsession *models.AppSession
	env        string
}

// NewApplication creates a new Application instance.
func NewApplication() *Application {
	return &Application{}
}

func (app *Application) SetEnvironment(env string) *Application {
	app.env = env
	return app
}

func (app *Application) InitializeConfig() *Application {
	configs.InitViper(&app.env)
	return app
}

func (app *Application) SetupLogger() *Application {
	if configs.GetEnv() != "prod" || configs.GetEnv() != "devdeployed" {
		utils.SetupLogger()
	}
	return app
}

func (app *Application) CreateAppSession() *Application {
	app.appsession = models.New(configs.ConnectToDatabase(constants.AdminDBAccessOption), configs.CreateCache())
	return app
}

func (app *Application) StartConsumer() *Application {
	go receiver.StartConsumeMessage(app.appsession)
	return app
}

func (app *Application) SetupRouter() *Application {
	gin.SetMode(configs.GetGinRunMode())
	app.ginRouter = gin.Default()
	return app
}

func (app *Application) AddCORSPolicy() *Application {
	app.ginRouter.Use(cors.New(cors.Config{
		AllowOrigins:     configs.GetAllowOrigins(),
		AllowMethods:     configs.GetAllowMethods(),
		AllowHeaders:     configs.GetAllowHeaders(),
		ExposeHeaders:    configs.GetExposeHeaders(),
		AllowCredentials: configs.GetAllowCredentials(),
		MaxAge:           time.Duration(configs.GetMaxAge()) * time.Second,
	}))
	return app
}

func (app *Application) SetTrustedProxies() *Application {
	err := app.ginRouter.SetTrustedProxies(configs.GetTrustedProxies())
	if err != nil {
		logrus.Fatal("Failed to set trusted proxies: ", err)
	}
	return app
}

func (app *Application) AttachRateLimitMiddleware() *Application {
	middleware.AttachRateLimitMiddleware(app.ginRouter)
	return app
}

func (app *Application) AttachSessionMiddleware() *Application {
	store := cookie.NewStore([]byte(configs.GetSessionSecret()))
	app.ginRouter.Use(sessions.Sessions("occupi-sessions-store", store))
	return app
}

func (app *Application) AttachTimeZoneMiddleware() *Application {
	app.ginRouter.Use(middleware.TimezoneMiddleware())
	return app
}

func (app *Application) AttachRealIPMiddleware() *Application {
	app.ginRouter.Use(middleware.RealIPMiddleware())
	return app
}

func (app *Application) AttachMoniteringMiddleware() *Application {
	// Sentry Config, New Relic Config & Zap Config
	if configs.GetEnv() == "prod" || configs.GetEnv() == "devdeployed" {
		// Create a newrelic application
		relicApp, err := newrelic.NewApplication(
			newrelic.ConfigAppName(configs.GetNewRelicAppName()),
			newrelic.ConfigLicense(configs.GetConfigLicense()),
			newrelic.ConfigCodeLevelMetricsEnabled(true),
			newrelic.ConfigAppLogForwardingEnabled(true),
			func(config *newrelic.Config) {
				logrus.SetLevel(logrus.DebugLevel)
				config.Logger = nrlogrus.StandardLogger()
			},
		)
		if err != nil {
			logrus.Fatal("Failed to create newrelic application: ", err)
		}

		// Create sentry config
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              configs.GetSentryDSN(),
			EnableTracing:    true,
			TracesSampleRate: 1.0,
		}); err != nil {
			logrus.Fatal("Sentry initialization failed: ", err)
		}

		// adding newrelic middleware
		app.ginRouter.Use(nrgin.Middleware(relicApp))
		app.ginRouter.Use(sentrygin.New(sentrygin.Options{Repanic: true}))
	}

	return app
}

func (app *Application) RegisterRoutes() *Application {
	router.OccupiRouter(app.ginRouter, app.appsession)
	return app
}

func (app *Application) SetEnvVariables() *Application {
	if configs.GetEnv() == "prod" || configs.GetEnv() == "devdeployed" {
	} else {
		os.Setenv("OTEL_EXPORTER_OTLP_INSECURE", "true")
	}
	return app
}

func (app *Application) RunServer() {
	certFile := configs.GetCertFileName()
	keyFile := configs.GetKeyFileName()

	// logrus all env variables
	logrus.Infof("Server running on port: %s", configs.GetPort())
	logrus.Infof("Server running in %s mode", configs.GetGinRunMode())
	logrus.Infof("Server running with cert file: %s", certFile)
	logrus.Infof("Server running with key file: %s", keyFile)

	// Listening on the port with TLS if env is prod or dev.deployed
	if configs.GetEnv() == "prod" || configs.GetEnv() == "devdeployed" {
		if err := app.ginRouter.RunTLS(":"+configs.GetPort(), certFile, keyFile); err != nil {
			logrus.Fatal("Failed to run server: ", err)
		}
	} else {
		if err := app.ginRouter.Run(":" + configs.GetPort()); err != nil {
			logrus.Fatal("Failed to run server: ", err)
		}
	}
}
