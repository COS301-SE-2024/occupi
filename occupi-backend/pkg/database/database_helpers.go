package database

import (
	"time"
  "strconv"
	"strings"
  
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
		OnSite:               true,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations:       []models.Location{},
		Details: models.Details{
			ImageID:  "",
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
		},
		Status:        "",
		Position:      "",
		DepartmentNo:  "",
		ExpoPushToken: user.ExpoPushToken,
	}
}

func CreateAdminUser(user models.RegisterUser) models.User {
	return models.User{
		OccupiID:             user.EmployeeID,
		Password:             user.Password,
		Email:                user.Email,
		Role:                 constants.Admin,
		OnSite:               true,
		IsVerified:           false,
		NextVerificationDate: time.Now(), // this will be updated once the email is verified
		TwoFAEnabled:         false,
		KnownLocations:       []models.Location{},
		Details: models.Details{
			ImageID:  "",
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
		},
		Status:        "",
		Position:      "",
		DepartmentNo:  "",
		ExpoPushToken: user.ExpoPushToken,
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
