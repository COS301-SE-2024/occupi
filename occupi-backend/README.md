# Welcome to Occupi-backend

Occupi's backend is the beating heart of occupi. This contains the code that interacts with our frontend and also interacts with our AI model. We are glad that you are interested in contributing to maintaining our backend. To get started, read below

### Getting started

1. You will have to download <a href="https://go.dev/doc/install">go-lang</a> as this is a <a href="https://go.dev/doc/install">go-lang</a> based backend
2. You can now begin coding. Before you do all of that however, here is a nice overview of how the codebase is organized with a small explanation for each folder/file:

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