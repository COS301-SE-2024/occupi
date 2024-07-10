package tests

import (
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/data"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {

	log.Println("Configuring test env")

	// init viper
	env := "test"
	configs.InitViper(&env, "../configs")

	// setup logger to log all server interactions
	utils.SetupLogger()

	// clean the database
	data.CleanDatabase()

	// begin seeding the mock database
	data.SeedMockDatabase("../data/test_data.json")

	log.Println("Starting up tests")

	os.Exit(m.Run())
}

func TestCORS(t *testing.T) {
	// set gin run mode
	gin.SetMode(configs.GetGinRunMode())

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     configs.GetAllowOrigins(),
		AllowMethods:     configs.GetAllowMethods(),
		AllowHeaders:     configs.GetAllowHeaders(),
		ExposeHeaders:    configs.GetExposeHeaders(),
		AllowCredentials: configs.GetAllowCredentials(),
		MaxAge:           time.Duration(configs.GetMaxAge()) * time.Second,
	}))

	router.GET("/test", func(c *gin.Context) {
		c.String(200, "CORS test")
	})

	testCases := []struct {
		origin         string
		expectedStatus int
		expectedHeader string
	}{
		{"https://localhost", http.StatusOK, "https://localhost"},
		{"http://localhost", http.StatusOK, "http://localhost"},
		{"https://domain.com", http.StatusOK, "https://domain.com"},
		{"https://dev.domain.com", http.StatusOK, "https://dev.domain.com"},
		{"https://app.domain.com", http.StatusOK, "https://app.domain.com"},
		{"https://invalid.com", http.StatusForbidden, ""},
	}

	for _, tc := range testCases {
		t.Run(tc.origin, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/test", nil)
			req.Header.Set("Origin", tc.origin)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tc.expectedStatus, w.Code)
			if tc.expectedHeader != "" {
				assert.Equal(t, tc.expectedHeader, w.Header().Get("Access-Control-Allow-Origin"))
			} else {
				assert.Empty(t, w.Header().Get("Access-Control-Allow-Origin"))
			}
		})
	}
}
