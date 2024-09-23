package configs

import (
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

const test = "test"

func CaptureError(ctx *gin.Context, err error) {
	// if gin run mode is test randomly return error
	if GetGinRunMode() == test {
		return
	}

	hub := sentrygin.GetHubFromContext(ctx)
	if hub == nil {
		return
	} else {
		hub.CaptureException(err)
	}
}

func CaptureMessage(ctx *gin.Context, message string) {
	// if gin run mode is test randomly return error
	if GetGinRunMode() == test {
		return
	}

	hub := sentrygin.GetHubFromContext(ctx)
	if hub == nil {
		return
	} else {
		hub.CaptureMessage(message)
	}
}
