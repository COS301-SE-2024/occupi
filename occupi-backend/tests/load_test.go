package tests

// func setupRouter() *gin.Engine {
// 	gin.SetMode(gin.TestMode)
// 	appsession := &models.AppSession{}
// 	store := cookie.NewStore([]byte("secret"))
// 	r := gin.Default()
// 	r.Use(sessions.Sessions("occupi-sessions-store", store))
// 	router.OccupiRouter(r, appsession)
// 	return r
// }

// func TestLoadBalancing(t *testing.T) {
// 	router := setupRouter()

// 	// Create a wait group to wait for all goroutines to finish
// 	var wg sync.WaitGroup

// 	// Number of concurrent requests
// 	numRequests := 1000

// 	// Channel to collect results
// 	results := make(chan int, numRequests)

// 	// Function to send a POST request to the /rtc/check-in endpoint
// 	sendRequest := func(url string) {
// 		defer wg.Done()
// 		req, _ := http.NewRequest("POST", url, nil)
// 		w := httptest.NewRecorder()
// 		router.ServeHTTP(w, req)
// 		results <- w.Code
// 	}

// 	// Start sending concurrent requests
// 	for i := 0; i < numRequests; i++ {
// 		wg.Add(1)
// 		go sendRequest("/rtc/enter")
// 	}

// 	// Wait for all requests to complete
// 	wg.Wait()
// 	close(results)

// 	// Check the results
// 	successCount := 0
// 	for result := range results {
// 		if result == http.StatusOK {
// 			successCount++
// 		}
// 	}

// 	assert.Equal(t, numRequests, successCount, "Not all requests were successful")
// }

// func TestLoadBalancingExit(t *testing.T) {
// 	router := setupRouter()

// 	// Create a wait group to wait for all goroutines to finish
// 	var wg sync.WaitGroup

// 	// Number of concurrent requests
// 	numRequests := 1000

// 	// Channel to collect results
// 	results := make(chan int, numRequests)

// 	// Function to send a POST request to the /rtc/exit endpoint
// 	sendRequest := func(url string) {
// 		defer wg.Done()
// 		req, _ := http.NewRequest("POST", url, nil)
// 		w := httptest.NewRecorder()
// 		router.ServeHTTP(w, req)
// 		results <- w.Code
// 	}

// 	// Start sending concurrent requests
// 	for i := 0; i < numRequests; i++ {
// 		wg.Add(1)
// 		go sendRequest("/rtc/exit")
// 	}

// 	// Wait for all requests to complete
// 	wg.Wait()
// 	close(results)

// 	// Check the results
// 	successCount := 0
// 	for result := range results {
// 		if result == http.StatusOK {
// 			successCount++
// 		}
// 	}

// 	assert.Equal(t, numRequests, successCount, "Not all requests were successful")
// }
