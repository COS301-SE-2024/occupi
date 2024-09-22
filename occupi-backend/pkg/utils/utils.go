package utils

import (
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"math/big"
	"os"
	"reflect"
	"regexp"
	"strings"
	"time"

	"github.com/alexedwards/argon2id"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
	"github.com/google/uuid"
	"github.com/microcosm-cc/bluemonday"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/authenticator"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

// sets up the logger and configures it
func SetupLogger() {
	// Open or create the log file
	logFile := configs.GetLogFileName()

	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal(fmt.Printf("Failed to open log file: %v", err))
	}
	// defer file.Close()

	// Set the output of the logs to the file
	logrus.SetOutput(file)

	// Set custom formatter to include full timestamp and other options
	logrus.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
	})

	// Set log level (optional, defaults to Info)
	logrus.SetLevel(logrus.InfoLevel)
}

// Function to generate a random 4-digit number
func generateRandomNumber() (int, error) {
	var num int
	b := make([]byte, 2)
	_, err := rand.Read(b)
	if err != nil {
		return 0, err
	}
	num = int(b[0])<<8 + int(b[1])
	num %= 10000 // Ensure it's a 4-digit number
	return num, nil
}

// Function to generate an employee ID with the structure OCCUPIYYYYXXXX
func GenerateEmployeeID() string {
	currentYear := time.Now().Year()
	randomNum, err := generateRandomNumber()
	if err != nil {
		return "OCCUPI00000000"
	}
	employeeID := fmt.Sprintf("OCCUPI%d%04d", currentYear, randomNum)
	return employeeID
}

// Function to validate a given employee ID with the structure OCCUPIYYYYXXXX where YYYY is year and XXXX is a 4-digit number
func ValidateEmployeeID(employeeID string) bool {
	// Regex pattern for employee ID validation
	var employeeIDRegex = regexp.MustCompile(`^OCCUPI\d{4}\d{4}$`)
	return employeeIDRegex.MatchString(employeeID)
}

// Function to generate an employee ID with the structure OCCUPIYYYYXXXX
func GenerateBookingID() string {
	currentYear := time.Now().Year()
	randomNum, err := generateRandomNumber()
	if err != nil {
		return "BOOKOCCUPI00000000"
	}
	employeeID := fmt.Sprintf("BOOKOCCUPI%d%04d", currentYear, randomNum)
	return employeeID
}

// sanitizes the given input
func SanitizeInput(input string) string {
	p := bluemonday.UGCPolicy()
	return p.Sanitize(input)
}

// sanitizes the given input of array of strings
func SanitizeInputArray(input []string) []string {
	for i, val := range input {
		input[i] = SanitizeInput(val)
	}
	return input
}

// validates an email against a regex pattern
func ValidateEmail(email string) bool {
	// Regex pattern for email validation
	var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// validates emails against a regex pattern
func ValidateEmails(emails []string) bool {
	for _, email := range emails {
		if !ValidateEmail(email) {
			return false
		}
	}
	return true
}

// validates a password against a regex pattern
func ValidatePassword(password string) bool {
	// Note: Golang does not support lookaheads in regex so regex looks very different and verbose
	var (
		lowercaseLetter = regexp.MustCompile(`[a-z]`)
		uppercaseLetter = regexp.MustCompile(`[A-Z]`)
		digit           = regexp.MustCompile(`\d`)
		specialChar     = regexp.MustCompile(`[@$!%*?&]`)
	)

	if len(password) < 8 {
		return false
	}

	if !lowercaseLetter.MatchString(password) {
		return false
	}

	if !uppercaseLetter.MatchString(password) {
		return false
	}

	if !digit.MatchString(password) {
		return false
	}

	if !specialChar.MatchString(password) {
		return false
	}

	return true
}

// validates an otp against a regex pattern
func ValidateOTP(otp string) bool {
	// Regex pattern for otp validation
	var otpRegex = regexp.MustCompile(`^[0-9]{6}$`)
	return otpRegex.MatchString(otp)
}

// hashes a password using argon2id algorithm
func Argon2IDHash(password string) (string, error) {
	// CreateHash returns a Argon2id hash of a plain-text password using the
	// provided algorithm parameters. The returned hash follows the format used
	// by the Argon2 reference C implementation and looks like this for hash of "pa$$word":
	// $argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
	hash, err := argon2id.CreateHash(password, argon2id.DefaultParams)
	if err != nil {
		return "", err
	}
	return hash, nil
}

// compares a password and it's hash using argon2id
func CompareArgon2IDHash(password string, hashedPassword string) (bool, error) {
	// ComparePasswordAndHash compares a plain-text password with a Argon2id hash and returns true if the
	// password and hash match, otherwise it returns false.
	match, err := argon2id.ComparePasswordAndHash(password, hashedPassword)
	if err != nil {
		return false, err
	}
	return match, nil
}

// Helper function to lower first case of a string
func LowercaseFirstLetter(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToLower(string(s[0])) + s[1:]
}

func TypeCheck(value interface{}, expectedType reflect.Type) bool {
	valueType := reflect.TypeOf(value)

	// Handle pointer types by dereferencing
	if expectedType.Kind() == reflect.Ptr {
		expectedType = expectedType.Elem()
		if value == nil {
			return true
		}
	}

	if valueType != nil && valueType.Kind() == reflect.Ptr {
		valueType = valueType.Elem()
	}

	// Handle slices and arrays
	if expectedType.Kind() == reflect.Slice || expectedType.Kind() == reflect.Array {
		if valueType.Kind() != reflect.Slice && valueType.Kind() != reflect.Array {
			return false
		}
		elemType := expectedType.Elem()
		for i := 0; i < reflect.ValueOf(value).Len(); i++ {
			if !TypeCheck(reflect.ValueOf(value).Index(i).Interface(), elemType) {
				return false
			}
		}
		return true
	}

	// Handle time.Time type
	if expectedType == reflect.TypeOf(time.Time{}) {
		_, ok := value.(string)
		if !ok {
			return false
		}
		_, err := time.Parse(time.RFC3339, value.(string))
		return err == nil
	}

	return valueType == expectedType
}

func ValidateJSON(data map[string]interface{}, expectedType reflect.Type) (map[string]interface{}, error) {
	validatedData := make(map[string]interface{})

	for i := 0; i < expectedType.NumField(); i++ {
		field := expectedType.Field(i)
		jsonTag := field.Tag.Get("json")
		validateTag := field.Tag.Get("binding")

		// Check if the JSON field exists
		value, exists := data[jsonTag]
		if !exists {
			if validateTag == "required" {
				logrus.Error("missing required field: ", jsonTag)
				return nil, fmt.Errorf("missing required field: %s", jsonTag)
			}
			continue
		}

		// Parse date/time strings to time.Time
		if field.Type == reflect.TypeOf(time.Time{}) {
			parsedTime, err := time.Parse(time.RFC3339, value.(string))
			if err != nil {
				logrus.Error("field ", jsonTag, " is of incorrect format")
				return nil, fmt.Errorf("field %s is of incorrect format", jsonTag)
			}
			validatedData[jsonTag] = parsedTime
		} else {
			validatedData[jsonTag] = value
		}

		// Check the field type
		if !TypeCheck(value, field.Type) {
			logrus.Error("field ", jsonTag, " is of incorrect type")
			return nil, fmt.Errorf("field %s is of incorrect type", jsonTag)
		}

	}
	return validatedData, nil
}

func GetErrorMsg(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "The " + LowercaseFirstLetter(fe.Field()) + " field is required"
	case "email":
		return "The " + fe.Field() + " field must be a valid email address"
	case "min":
		return "The " + fe.Field() + " field must be greater than " + fe.Param()
	}
	return "The " + fe.Field() + " field is invalid"
}

func SantizeFilter(queryInput models.QueryInput) primitive.M {
	// Remove password field from filter if present
	if queryInput.Filter == nil {
		queryInput.Filter = make(map[string]interface{})
	}
	delete(queryInput.Filter, "password")
	delete(queryInput.Filter, "unsentExpoPushTokens")

	// ensure the operator is valid if present
	if queryInput.Operator != "" && queryInput.Operator != "gt" &&
		queryInput.Operator != "gte" && queryInput.Operator != "lt" &&
		queryInput.Operator != "lte" && queryInput.Operator != "eq" &&
		queryInput.Operator != "ne" && queryInput.Operator != "in" && queryInput.Operator != "nin" {
		// default to "" if invalid operator
		queryInput.Operator = ""
	}

	var filter primitive.M

	if queryInput.Operator == "" {
		return bson.M(queryInput.Filter)
	} else { // accepts gt, gte, lt, lte, eq, ne, in, nin operators
		filter = bson.M{}
		for key, value := range queryInput.Filter {
			filter[key] = bson.M{"$" + queryInput.Operator: value}
		}
	}

	return filter
}

func SanitizeSort(queryInput models.QueryInput) primitive.M {
	// Remove password field from filter if present
	if queryInput.Filter == nil {
		queryInput.Filter = make(map[string]interface{})
	}
	delete(queryInput.Filter, "password")
	delete(queryInput.Filter, "unsentExpoPushTokens")

	switch {
	case queryInput.OrderAsc != "" && queryInput.OrderDesc != "":
		return bson.M{queryInput.OrderAsc: 1, queryInput.OrderDesc: -1}
	case queryInput.OrderAsc != "":
		return bson.M{queryInput.OrderAsc: 1}
	case queryInput.OrderDesc != "":
		return bson.M{queryInput.OrderDesc: -1}
	default:
		return bson.M{}
	}
}

func SantizeProjection(queryInput models.QueryInput) []string {
	// Remove password field from projection if present
	sanitizedProjection := []string{}
	for _, field := range queryInput.Projection {
		if field != "password" && field != "unsentExpoPushTokens" {
			sanitizedProjection = append(sanitizedProjection, field)
		}
	}

	return sanitizedProjection
}

func ConstructProjection(queryInput models.QueryInput, sanitizedProjection []string) bson.M {
	projection := bson.M{}
	if len(queryInput.Projection) == 0 {
		projection["password"] = 0 // Exclude password by default
		projection["unsentExpoPushTokens"] = 0
	} else {
		for _, field := range sanitizedProjection {
			switch field {
			case "password":
				projection[field] = 0
			case "unsentExpoPushTokens":
				projection[field] = 0
			default:
				projection[field] = 1
			}
		}
	}
	// exclude _id field by default
	projection["_id"] = 0

	return projection
}

func GetLimitPageSkip(queryInput models.QueryInput) (int64, int64, int64) {
	limit := queryInput.Limit
	if limit <= 0 || limit > 50 {
		limit = 50 // Default limit
	}

	page := queryInput.Page
	if page <= 0 {
		page = 1
	}
	skip := (page - 1) * limit

	return limit, page, skip
}

func ComputeLimitPageSkip(limit, page int64) (int64, int64, int64) {
	if limit <= 0 {
		limit = 50 // Default limit
	}

	if page <= 0 {
		page = 1
	}
	skip := (page - 1) * limit

	return limit, page, skip
}

func ConstructBookingScheduledString(emails []string) string {
	n := len(emails)
	if n == 0 { // this cannot happen as the creator is always included in the emails
		logrus.Error("No emails provided")
		return ""
	}

	switch n {
	case 1:
		return fmt.Sprintf("A booking with %s has been scheduled", emails[0])
	case 2:
		return fmt.Sprintf("A booking with %s and %s has been scheduled", emails[0], emails[1])
	default:
		return fmt.Sprintf("A booking with %s, %s and %d others has been scheduled", emails[0], emails[1], n-1)
	}
}

func ConstructBookingStartingInScheduledString(emails []string, startTime string) string {
	n := len(emails)
	if n == 0 { // this cannot happen as the creator is always included in the emails
		logrus.Error("No emails provided")
		return ""
	}

	if startTime == "now" {
		startTime = "a few seconds"
	}

	switch n {
	case 1:
		return fmt.Sprintf("A booking with %s starts in %s", emails[0], startTime)
	case 2:
		return fmt.Sprintf("A booking with %s and %s starts in %s", emails[0], emails[1], startTime)
	default:
		return fmt.Sprintf("A booking with %s, %s and %d others starts in %s", emails[0], emails[1], n-1, startTime)
	}
}

func PrependEmailtoSlice(emails []string, email string) []string {
	emails = append([]string{email}, emails...)
	return emails
}

func ConvertToStringArray(input interface{}) []string {
	// Convert the input to a slice of strings
	var stringArray []string
	switch input := input.(type) {
	case string:
		stringArray = append(stringArray, input)
	case []string:
		stringArray = append(stringArray, input...)
	default:
		logrus.Error("Invalid input type")
		stringArray = []string{}
	}
	return stringArray
}

func ConvertTokensToStringArray(tokens []primitive.M, key string) ([]string, error) {
	stringArray := []string{}

	for _, token := range tokens {
		// Ensure the map contains the key
		value, exists := token[key]
		if !exists {
			return nil, fmt.Errorf("key %s does not exist in token %v", key, token)
		}

		// Ensure the value is a string before appending
		strValue, ok := value.(string)
		if !ok {
			return nil, fmt.Errorf("value for key %s is not a string: %v", key, value)
		}
		stringArray = append(stringArray, strValue)
	}

	return stringArray, nil
}

func ConvertArrayToCommaDelimitedString(input []string) string {
	return strings.Join(input, ",")
}

func ConvertCommaDelimitedStringToArray(input string) []string {
	return strings.Split(input, ",")
}

func RandomError() error {
	// probability of returning error should be 50/50
	num, err := generateRandomNumber()

	if err != nil {
		return errors.New("failed to generate random number")
	}

	if num%2 == 0 {
		return errors.New("random error")
	} else {
		return nil
	}
}

func GetClaimsFromCTX(ctx *gin.Context) (*authenticator.Claims, error) {
	// attempt to get email from jwt cookie token or auth header
	tokenStr, _ := ctx.Cookie("token")
	headertokenStr := ctx.GetHeader("Authorization")
	if tokenStr == "" && headertokenStr == "" {
		return nil, errors.New("no token provided")
	}

	// set in ctx origin of token, whether it was from cookie or header
	ctx.Set("tokenOrigin", "cookie")

	if tokenStr == "" {
		tokenStr = headertokenStr
		ctx.Set("tokenOrigin", "header")
	}

	claims, err := authenticator.ValidateToken(tokenStr)
	if err != nil {
		return nil, err
	}

	return claims, nil
}

func IsSessionSet(ctx *gin.Context) bool {
	session := sessions.Default(ctx)

	email := session.Get("email")
	role := session.Get("role")

	if email == nil || role == nil {
		return false
	}

	return true
}

func SetSession(ctx *gin.Context, claims *authenticator.Claims) error {
	session := sessions.Default(ctx)

	session.Set("email", claims.Email)
	session.Set("role", claims.Role)

	if err := session.Save(); err != nil {
		return err
	}

	return nil
}

func ClearSession(ctx *gin.Context) error {
	session := sessions.Default(ctx)

	session.Clear()
	if err := session.Save(); err != nil {
		return err
	}

	return nil
}

func GetSession(ctx *gin.Context) (string, string) {
	session := sessions.Default(ctx)

	email := session.Get("email")
	role := session.Get("role")

	return email.(string), role.(string)
}

func CompareSessionAndClaims(ctx *gin.Context, claims *authenticator.Claims) bool {
	session := sessions.Default(ctx)

	email := session.Get("email")
	role := session.Get("role")

	if email == nil || role == nil {
		return false
	}

	if email != claims.Email || role != claims.Role {
		return false
	}

	return true
}

func GetClientIP(ctx *gin.Context) string {
	if ip, exists := ctx.Get("ClientIP"); exists {
		return ip.(string)
	}
	return ctx.ClientIP()
}

func GetClientTime(ctx *gin.Context) time.Time {
	loc, exists := ctx.Get("timezone")
	if !exists {
		return time.Now()
	}

	return time.Now().In(loc.(*time.Location))
}

func GenerateUUID() string {
	uuid, err := uuid.NewRandom()

	if err != nil {
		return ""
	}

	return uuid.String()
}

func RemoveNumbersFromExtension(ext string) string {
	// Remove numbers from the file extension
	extension := strings.TrimRight(ext, "0123456789")
	return extension
}

// remove ".jpg", ".jpeg", ".png" from the extension eg "image1.jpg" -> "image1"
func RemoveImageExtension(fileName string) string {
	// Define the extensions to remove
	extensions := []string{".jpg", ".jpeg", ".png"}

	for _, ext := range extensions {
		if strings.HasSuffix(strings.ToLower(fileName), ext) {
			return strings.TrimSuffix(fileName, ext)
		}
	}

	// Return the original filename if no extension matches
	return fileName
}

func Contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func RandomInt(min, max int) int {
	// if min is greater than max, swap the values
	if min > max {
		min, max = max, min
	}

	// if min is equal to max, return min
	if min == max {
		return min
	}

	// Calculate the range size (max - min + 1)
	n := max - min + 1

	// Generate a random number in the range [0, n)
	randNum, err := rand.Int(rand.Reader, big.NewInt(int64(n)))
	if err != nil {
		return 0
	}

	// Add min to shift the number to the correct range [min, max]
	return int(randNum.Int64()) + min
}

func ValidateIP(ip string) bool {
	// Regex pattern for IP validation
	var ipRegex = regexp.MustCompile(`^(\d{1,3}\.){3}\d{1,3}$`)
	return ipRegex.MatchString(ip)
}

func IsMobileDevice(ctx *gin.Context) bool {
	userAgent := ctx.GetHeader("User-Agent")
	deviceType := DetectDeviceType(userAgent)
	if deviceType == "iOS" || deviceType == "Android" {
		return true
	}
	return false
}

func DetectDeviceType(userAgent string) string {
	if strings.Contains(userAgent, "CFNetwork") ||
		strings.Contains(userAgent, "iPhone") || strings.Contains(userAgent, "iPad") {
		return "iOS"
	} else if strings.Contains(userAgent, "Macintosh") {
		return "macOS"
	} else if strings.Contains(userAgent, "Android") {
		return "Android"
	}
	return "Unknown"
}
