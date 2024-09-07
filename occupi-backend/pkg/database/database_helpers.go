package database

import (
	"strconv"
	"strings"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/umahmood/haversine"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func CreateBasicUser(user models.RegisterUser) models.User {
	return models.User{
		OccupiID:             user.EmployeeID,
		Password:             user.Password,
		Email:                user.Email,
		Role:                 constants.Basic,
		OnSite:               false,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations:       []models.Location{},
		Details: models.Details{
			HasImage: false,
			Name:     "",
			DOB:      time.Now(),
			Gender:   "",
			Pronouns: "",
		},
		Notifications: models.Notifications{
			Invites:         true,
			BookingReminder: true,
		},
		Security: models.Security{
			MFA:         false,
			Biometrics:  false,
			ForceLogout: false,
			Credentials: webauthn.Credential{},
		},
		Status:                  "",
		Position:                "",
		DepartmentNo:            "",
		ExpoPushToken:           user.ExpoPushToken,
		ResetPassword:           false,
		BlockAnonymousIPAddress: false,
	}
}

func CreateAdminUser(user models.RegisterUser) models.User {
	return models.User{
		OccupiID:             user.EmployeeID,
		Password:             user.Password,
		Email:                user.Email,
		Role:                 constants.Admin,
		OnSite:               false,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations:       []models.Location{},
		Details: models.Details{
			HasImage: false,
			Name:     "",
			DOB:      time.Now(),
			Gender:   "",
			Pronouns: "",
		},
		Notifications: models.Notifications{
			Invites:         true,
			BookingReminder: true,
		},
		Security: models.Security{
			MFA:         false,
			Biometrics:  false,
			ForceLogout: false,
			Credentials: webauthn.Credential{},
		},
		Status:                  "",
		Position:                "",
		DepartmentNo:            "",
		ExpoPushToken:           user.ExpoPushToken,
		ResetPassword:           false,
		BlockAnonymousIPAddress: false,
	}
}

func CreateAUser(user models.UserRequest) models.User {
	return models.User{
		OccupiID:             user.EmployeeID,
		Password:             user.Password,
		Email:                user.Email,
		Role:                 user.Role,
		OnSite:               false,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations:       []models.Location{},
		Details: models.Details{
			HasImage:  false,
			ContactNo: user.Details.ContactNo,
			Name:      user.Details.Name,
			DOB:       user.Details.DOB,
			Gender:    user.Details.Gender,
			Pronouns:  user.Details.Pronouns,
		},
		Notifications: models.Notifications{
			BookingReminder: user.Notifications.BookingReminder,
			Invites:         user.Notifications.Invites,
		},
		Security: models.Security{
			MFA:         false,
			ForceLogout: false,
			Credentials: webauthn.Credential{},
		},
		Status:                  user.Status,
		Position:                user.Position,
		DepartmentNo:            user.DepartmentNo,
		ExpoPushToken:           user.ExpoPushToken,
		ResetPassword:           true,
		BlockAnonymousIPAddress: user.BlockAnonymousIPAddress,
	}
}

func IsLocationInRange(locations []models.Location, unrecognizedLogger *ipinfo.Core) bool {
	// Return true if there are no locations
	if len(locations) == 0 {
		return true
	}

	for _, loc := range locations {
		// Skip if loc.Location is empty
		if loc.Location == "" {
			continue
		}

		coords1 := strings.Split(loc.Location, ",")
		// Skip if coords1 does not contain exactly 2 elements (latitude and longitude)
		if len(coords1) != 2 {
			continue
		}

		lat1, err1 := strconv.ParseFloat(coords1[0], 64)
		lon1, err2 := strconv.ParseFloat(coords1[1], 64)
		// Skip if parsing latitude or longitude fails
		if err1 != nil || err2 != nil {
			continue
		}

		coords2 := strings.Split(unrecognizedLogger.Location, ",")
		// Skip if coords2 does not contain exactly 2 elements (latitude and longitude)
		if len(coords2) != 2 {
			continue
		}

		lat2, err3 := strconv.ParseFloat(coords2[0], 64)
		lon2, err4 := strconv.ParseFloat(coords2[1], 64)
		// Skip if parsing latitude or longitude fails
		if err3 != nil || err4 != nil {
			continue
		}

		loc1 := haversine.Coord{Lat: lat1, Lon: lon1}
		loc2 := haversine.Coord{Lat: lat2, Lon: lon2}

		_, km := haversine.Distance(loc1, loc2)

		if km < 1000 {
			return true
		}
	}

	return false
}

func ComputeAvailableSlots(bookings []models.Booking, dateOfBooking time.Time) []models.Slot {
	var availableSlots []models.Slot

	// Define the boundaries
	// 8:00 AM to 5:00 PM
	startOfDay := time.Date(dateOfBooking.Year(), dateOfBooking.Month(), dateOfBooking.Day(), 8, 0, 0, 0, time.UTC) // 8:00 AM
	endOfDay := time.Date(dateOfBooking.Year(), dateOfBooking.Month(), dateOfBooking.Day(), 17, 0, 0, 0, time.UTC)  // 5:00 PM

	previousEnd := startOfDay

	for _, booking := range bookings {
		if booking.Start.After(previousEnd) {
			availableSlots = append(availableSlots, models.Slot{
				Start: previousEnd,
				End:   booking.Start,
			})
		}
		previousEnd = booking.End
	}

	// Check for a slot after the last booking
	if previousEnd.Before(endOfDay) {
		availableSlots = append(availableSlots, models.Slot{
			Start: previousEnd,
			End:   endOfDay,
		})
	}

	return availableSlots
}

// caps time now to range of 8:00 AM to 5:00 PM
func CapTimeRange() time.Time {
	now := time.Now()
	if now.Hour() < 7 {
		now = time.Date(now.Year(), now.Month(), now.Day(), 7, 0, 0, 0, time.UTC)
	} else if now.Hour() > 17 {
		now = time.Date(now.Year(), now.Month(), now.Day(), 17, 0, 0, 0, time.UTC)
	}
	return now
}

// CompareAndReturnTime validates the newTime against the oldTime and returns:
// - oldTime's date at 5 PM if newTime's date is after oldTime's date or newTime's time is after 5 PM on the same date.
// - newTime if it's on the same date as oldTime and before or at 5 PM.
func CompareAndReturnTime(oldTime, newTime time.Time) time.Time {
	// Set 5 PM time on oldTime's date
	oldDateFivePM := time.Date(oldTime.Year(), oldTime.Month(), oldTime.Day(), 17, 0, 0, 0, oldTime.Location())

	// Compare dates
	oldDate := time.Date(oldTime.Year(), oldTime.Month(), oldTime.Day(), 0, 0, 0, 0, oldTime.Location())
	newDate := time.Date(newTime.Year(), newTime.Month(), newTime.Day(), 0, 0, 0, 0, newTime.Location())

	if newDate.After(oldDate) {
		return oldDateFivePM
	} else if newDate.Equal(oldDate) && newTime.After(oldDateFivePM) {
		return oldDateFivePM
	}

	return newTime
}

// IsWeekend checks if the given date is a weekend
func IsWeekend(date time.Time) bool {
	// Check if the given date is a Saturday or Sunday
	return date.Weekday() == time.Saturday || date.Weekday() == time.Sunday
}

// WeekOfTheYear returns the week number of the year for the given date
func WeekOfTheYear(date time.Time) int {
	_, week := date.ISOWeek()
	return week
}

// DayOfTheWeek returns the day of the week for the given date as a string
func DayOfTheWeek(date time.Time) string {
	return date.Weekday().String()
}

// Month returns the month as an int
func Month(date time.Time) int {
	return int(date.Month())
}
