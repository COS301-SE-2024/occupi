package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestEnter tests the Enter function
func TestEnter(t *testing.T) {
	r, cookies := setupTestEnvironment(t)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/rtc/enter", nil)

	// Add cookies to the request
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"counter":1`)
}

// TestExit tests the Exit function
func TestExit(t *testing.T) {
	r, cookies := setupTestEnvironment(t)

	// First, increment the counter
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/rtc/enter", nil)
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}
	r.ServeHTTP(w, req)

	// Then, decrement the counter
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", "/rtc/exit", nil)
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"counter":0`)
}

// TestExitWithoutEnter tests the Exit function when no enter has been called
func TestExitWithoutEnter(t *testing.T) {
	r, cookies := setupTestEnvironment(t)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/rtc/exit", nil)
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"counter":0`)
}
