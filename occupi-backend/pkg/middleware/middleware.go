package middleware

import (
	"fmt"
	"net/http"

	"github.com/sirupsen/logrus"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logrus.Info(fmt.Printf("Request URI: %s", r.RequestURI))
		next.ServeHTTP(w, r)
	})
}
