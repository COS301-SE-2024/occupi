# Welcome to Occupi-backend

Occupi's backend is the beating heart of occupi. This contains the code that interacts with our frontend and also interacts with our AI model. We are glad that you are interested in contributing to maintaining our backend. To get started, read below

### Getting started

1. You will have to download <a href="https://go.dev/doc/install">go-lang</a> as this is a <a href="https://go.dev/doc/install">go-lang</a> based backend
2. Create a .env file and fill out:
```bash
MONGODB_USERNAME=
MONGODB_PASSWORD=
MONGODB_CLUSTERURI=
MONGODB_DBNAME=
MONGODB_START_URI=
PORT=
LOG_FILE_NAME=
SMTP_HOST=
SMTP_PORT=
SMTP_PASSWORD=
SYSTEM_EMAIL=
CERT_FILE_NAME=
KEY_FILE_NAME=
GIN_RUN_MODE=
TRUSTED_PROXIES=
```
3. You can also proceed to download <a href="https://www.docker.com/products/docker-desktop/">docker desktop</a>
4. To build the container, run:
```bash
docker-compose build
```
5. To run the container, run:
```bash
docker-compose up
```
6. Run this command to generate some certicate and key files for TLS:
```bash
openssl req -x509 -newkey rsa:4096 -keyout <name of key file goes here> -out <name of certificate file goes here> -days 365 -nodes
```
7. You can now begin coding. Before you do all of that however, here is a nice overview of how the codebase is organized with a small explanation for each folder/file:

```bash
myapp/
├── cmd/
│   └── occupi-backend/
│       └── main.go //entry point
├── configs/
│   └── config.go //env variables are imported in this file
├── pkg/
│   ├── handlers/
│   │   └── handlers.go //handles individual api endpoints
│   ├── middleware/
│   │   ├── middleware.go //a logger for each incoming api request
│   │   └── auth.go //contains authentication middleware
│   ├── models/
│   │   └── models.go //contains database defined models(NOSQL)
│   ├── database/
│   │   ├── database.go //contains database struct
│   │   └── migrations/
│   │       └── //may perhaps contain database migrations
│   ├── router/
│   │   └── router.go //contains api endpoints
│   └── utils/
│       └── utils.go //contains universally used functions
├── tests/
│   └── handlers_test.go //unit tests endpoints
|   └── unit_test.go //unit tests utils
├── Dockerfile // Containerization
├── docker-compose.yml
├── go.mod
├── go.sum
├── nginx.conf //reverse proxy config
└── docs/
    └── // go-lang function documentation
```

### Development Cycle
1. Please make sure you have golang installed
2. Run 
```bash
go run cmd/occupi-backend/main.go
```
3. Make a request on the port you specified with
```bash
https://localhost:{port you specified in env}/ping

or

https://localhost:{port you specified in env}/api/resource
```

### Development Cycle with Docker

1. Please make use of docker desktop to manage your containers lifecycle
2. To build the container, run:
```bash
docker-compose build
```
3. To run the container, run:
```bash
docker-compose up
```
4. Make a request on the nginx port of 13000 with
```bash
```
5. To stop the container, click the stop button in docker desktop

### Writing tests for the api

1. Please write tests under the test folder for your api endpoint if you write one. Below is a general schema for writing tests that we follow:
```go
package tests

import (
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers"
)

func TestGetResource(t *testing.T) {
    req, err := http.NewRequest("GET", "/api/resource", nil)
    if err != nil {
        t.Fatal(err)
    }

    rr := httptest.NewRecorder()
    handler := http.HandlerFunc(handlers.GetResource)

    handler.ServeHTTP(rr, req)

    if status := rr.Code; status != http.StatusOK {
        t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
    }

    expected := `{"message":"Hello, World!"}`
    if rr.Body.String() != expected {
        t.Errorf("handler returned unexpected body: got %v want %v", rr.Body.String(), expected)
    }
}
```

2. Run tests with:
```bash
go test ./tests/... 
```

### Writing tests for utils

1. Please write tests under the test folder for your util function if you write one. Below is a general schema for writing tests that we follow:
```go
package tests

import (
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func TestGenEmpID(t *testing.T) {
	empID, err := utils.GenerateEmployeeID()
	if err != nil {
		t.Errorf("Error generating employee ID: %s", err)
		return
	}
	t.Logf("Generated Employee ID: %s", empID)
}
```

2. Run tests with:
```bash
go test ./tests/... 
```
