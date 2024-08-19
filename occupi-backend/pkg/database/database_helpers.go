package database

import (
	"time"

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
}
