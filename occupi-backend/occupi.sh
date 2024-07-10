#!/bin/bash

print_help() {
    echo "Usage: $0 {command}"
    echo ""
    echo "Available commands:"
    echo "  run dev           -> go run -v cmd/occupi-backend/main.go -env=dev.localhost"
    echo "  run prod          -> go run cmd/occupi-backend/main.go -env=dev.localhost"
    echo "  build dev         -> go build -v cmd/occupi-backend/main.go"
    echo "  build prod        -> go build cmd/occupi-backend/main.go"
    echo "  test              -> gotestsum --format testname -- -v ./tests/..."
    echo "  test codecov      -> gotestsum --format testname -- -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware ./tests/... -coverprofile=coverage.out"
    echo "  lint              -> golangci-lint run"
    echo "  decrypt env       -> cd scripts && chmod +x decrypt_env_variables.sh && ./decrypt_env_variables.sh"
    echo "  encrypt env       -> cd scripts && chmod +x encrypt_env_variables.sh && ./encrypt_env_variables.sh"
    echo "  help              -> Show this help message"
}

if [ "$1" = "run" ] && [ "$2" = "dev" ]; then
    go run -v cmd/occupi-backend/main.go -env=dev.localhost
elif [ "$1" = "run" ] && [ "$2" = "prod" ]; then
    go run cmd/occupi-backend/main.go -env=dev.localhost
elif [ "$1" = "build" ] && [ "$2" = "dev" ]; then
    go build -v cmd/occupi-backend/main.go
elif [ "$1" = "build" ] && [ "$2" = "prod" ]; then
    go build cmd/occupi-backend/main.go
elif [ "$1" = "test" ]; then
    gotestsum --format testname -- -v ./tests/...
elif [ "$1" = "test" ] && [ "$2" = "codecov" ]; then
    gotestsum --format testname -- -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware ./tests/... -coverprofile=coverage.out
elif [ "$1" = "lint" ]; then
    golangci-lint run
elif [ "$1" = "decrypt" ] && [ "$2" = "env" ]; then
    cd scripts && chmod +x decrypt_env_variables.sh && ./decrypt_env_variables.sh
elif [ "$1" = "encrypt" ] && [ "$2" = "env" ]; then
    cd scripts && chmod +x encrypt_env_variables.sh && ./encrypt_env_variables.sh
elif [ "$1" = "help" ] || [ -z "$1" ]; then
    print_help
else
    echo "Invalid argument ->"  $1 $2
    print_help
    exit 1
fi
