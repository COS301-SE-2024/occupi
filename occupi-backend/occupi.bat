@echo off
setlocal

if "%1 %2" == "run dev" (
    go run -v cmd/occupi-backend/main.go
    exit /b 0
) else if "%1 %2" == "run prod" (
    go run cmd/occupi-backend/main.go
    exit /b 0
) else if "%1 %2" == "build dev" (
    go build -v cmd/occupi-backend/main.go
    exit /b 0
) else if "%1 %2" == "build prod" (
    go build cmd/occupi-backend/main.go
    exit /b 0
) else if "%1 %2" == "docker build" (
    docker-compose build
    exit /b 0
) else if "%1 %2" == "docker up" (
    docker-compose up
    exit /b 0
) else if "%1 %2" == "test" (
    go test ./tests/...
    exit /b 0
) else if "%1 %2" == "lint" (
    golangci-lint run
    exit /b 0
) else if "%1" == "help" (
    call :print_help
    exit /b 0
) else (
    echo Invalid argument:   %1 %2
    call :print_help
    exit /b 1
)

:print_help
echo Usage: occupi.bat {command}
echo.
echo Available commands:
echo   run dev           : go run -v cmd/occupi-backend/main.go
echo   run prod          : go run cmd/occupi-backend/main.go
echo   build dev         : go build -v cmd/occupi-backend/main.go
echo   build prod        : go build cmd/occupi-backend/main.go
echo   docker build      : docker-compose build
echo   docker up         : docker-compose up
echo   test              : go test ./tests/...
echo   lint              : golangci-lint run
echo   help              : Show this help message
exit /b 0



endlocal
