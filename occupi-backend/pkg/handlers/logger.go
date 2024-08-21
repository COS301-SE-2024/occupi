package handlers

import (
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

func captureError(ctx *gin.Context, err error) {
	hub := sentrygin.GetHubFromContext(ctx)
	if hub == nil {
		return
	} else {
		hub.CaptureException(err)
	}
}

func captureMessage(ctx *gin.Context, message string) {
	hub := sentrygin.GetHubFromContext(ctx)
	if hub == nil {
		return
	} else {
		hub.CaptureMessage(message)
	}
}
