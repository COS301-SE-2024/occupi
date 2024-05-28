package tests

import (
	"testing"
)

func TestGetResource(t *testing.T) {
	// Load environment variables from .env file
	/*if err := godotenv.Load("../.env"); err != nil {
		log.Fatal(fmt.Printf("Error loading .env file %s", err))
	}

	//connect to the database
	db := database.ConnectToDatabase()

	req, err := http.NewRequest("GET", "/api/resource", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.FetchResource(db))

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}*/
}
