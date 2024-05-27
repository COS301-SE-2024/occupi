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

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if the request has a valid token
		// If it does, call next.ServeHTTP(w, r)
		// If it doesn't, return an error response
	})
}
