#!/bin/bash

print_help() {
    echo "Usage: $0 {command}"
    echo ""
    echo "Available commands:"
    echo "  run dev           -> go run -v cmd/occupi-backend/main.go"
    echo "  run prod          -> go run cmd/occupi-backend/main.go"
    echo "  build dev         -> go build -v cmd/occupi-backend/main.go"
    echo "  build prod        -> go build cmd/occupi-backend/main.go"
    echo "  docker build      -> docker-compose build"
    echo "  docker up         -> docker-compose up"
    echo "  test              -> go test ./tests/..."
    echo "  test codecov      -> go test ./tests/... -race -coverprofile=coverage.out -covermode=atomic"
    echo "  lint              -> golangci-lint run"
    echo "  help              -> Show this help message"
}

if [ "$1" = "run" ] && [ "$2" = "dev" ]; then
    go run -v cmd/occupi-backend/main.go
elif [ "$1" = "run" ] && [ "$2" = "prod" ]; then
    go run cmd/occupi-backend/main.go
elif [ "$1" = "build" ] && [ "$2" = "dev" ]; then
    go build -v cmd/occupi-backend/main.go
elif [ "$1" = "build" ] && [ "$2" = "prod" ]; then
    go build cmd/occupi-backend/main.go
elif [ "$1" = "docker" ] && [ "$2" = "build" ]; then
    docker-compose build
elif [ "$1" = "docker" ] && [ "$2" = "up" ]; then
    docker-compose up
elif [ "$1" = "test" ]; then
    go test -v ./tests/...
elif [ "$1" = "test" ] && [ "$2" = "codecov" ]; then
    go test -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/handlers ./tests/... -coverprofile=coverage.out
elif [ "$1" = "lint" ]; then
    golangci-lint run
elif [ "$1" = "help" ] || [ -z "$1" ]; then
    print_help
else
    echo "Invalid argument ->"  $1 $2
    print_help
    exit 1
fi
