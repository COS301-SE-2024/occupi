@echo off
setlocal

if "%1 %2" == "run dev" (
    docker compose -f docker-compose.local.yml up -d && go run -v cmd/occupi-backend/main.go -env=dev.localhost
    exit /b 0
) else if "%1 %2" == "run prod" (
    docker compose -f docker-compose.local.yml up -d && go run cmd/occupi-backend/main.go -env=dev.localhost
    exit /b 0
) else if "%1 %2" == "build dev" (
    go build -v cmd/occupi-backend/main.go
    exit /b 0
) else if "%1 %2" == "build prod" (
    go build cmd/occupi-backend/main.go
    exit /b 0
) else if "%1 %2" == "docker build" (
    docker compose -f docker-compose.localdev.yml build 
    exit /b 0
) else if "%1 %2" == "docker up" (
    docker compose -f docker-compose.localdev.yml up -d 
    exit /b 0
) else if "%1" == "test" (
    gotestsum --format testname -- -v ./tests/...
    exit /b 0
) else if "%1" == "report" (
    gotestsum --format testname --junitfile reports/gotestsum-report.xml -- -v ./tests/...
    exit /b 0
) else if "%1 %2" == "test codecov" (
    gotestsum --format testname -- -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils ./tests/... -coverprofile=coverage.out
    exit /b 0
) else if "%1 %2" == "report codecov" (
    gotestsum --format testname --junitfile reports/gotestsum-report.xml -- -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils ./tests/... -coverprofile=coverage.out
    exit /b 0
) else if "%1" == "lint" (
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
echo   run dev           : docker compose -f docker-compose.local.yml up -d ^ go run -v cmd/occupi-backend/main.go -env=dev.localhost
echo   run prod          : docker compose -f docker-compose.local.yml up -d ^ go run cmd/occupi-backend/main.go -env=dev.localhost
echo   build dev         : go build -v cmd/occupi-backend/main.go
echo   build prod        : go build cmd/occupi-backend/main.go
echo   docker build      : docker compose -f docker-compose.localdev.yml build
echo   docker up         : docker compose -f docker-compose.localdev.yml up -d
echo   test              : gotestsum --format testname -- -v ./tests/...
echo   report            : gotestsum --format testname --junitfile reports/gotestsum-report.xml -- -v ./tests/...
echo   test codecov      : gotestsum --format testname -- -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils ./tests/... -coverprofile=coverage.out
echo   report codecov    : gotestsum --format testname --junitfile reports/gotestsum-report.xml -- -v -coverpkg=github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/cache,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/middleware,github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils ./tests/... -coverprofile=coverage.out
echo   lint              : golangci-lint run
echo   convert report    : python reports/convert_report.py reports.json -o allure-results
echo   help              : Show this help message
exit /b 0



endlocal
