package tests

import (
	"errors"
	"testing"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/stretchr/testify/assert"
)

func TestSendBulkEmailWithBCC(t *testing.T) {
	tests := []struct {
		name          string
		emails        []string
		subject       string
		body          string
		appsession    *models.AppSession
		expectedError error
	}{
		{
			name:    "Reset email count on new day",
			emails:  []string{"test1@example.com"},
			subject: "Test Subject",
			body:    "Test Body",
			appsession: &models.AppSession{
				DB:          nil,
				Cache:       nil,
				EmailsSent:  0,
				CurrentDate: time.Now().Add(-24 * time.Hour),
			},
			expectedError: nil,
		},
		{
			name:    "Exceeded maximum number of recipients",
			emails:  []string{"1@example.com", "2@example.com", "3@example.com", "4@example.com", "5@example.com", "6@example.com", "7@example.com", "8@example.com", "9@example.com", "10@example.com", "11@example.com"},
			subject: "Test Subject",
			body:    "Test Body",
			appsession: &models.AppSession{
				DB:          nil,
				Cache:       nil,
				EmailsSent:  0,
				CurrentDate: time.Now(),
			},
			expectedError: errors.New("exceeded maximum number of recipients"),
		},
		{
			name:    "Exceeded maximum number of emails sent per day",
			emails:  []string{"test1@example.com"},
			subject: "Test Subject",
			body:    "Test Body",
			appsession: &models.AppSession{
				DB:          nil,
				Cache:       nil,
				EmailsSent:  constants.EmailsSentLimit,
				CurrentDate: time.Now(),
			},
			expectedError: errors.New("exceeded maximum number of emails sent per day"),
		},
		{
			name:    "Successful email send",
			emails:  []string{"test1@example.com"},
			subject: "Test Subject",
			body:    "Test Body",
			appsession: &models.AppSession{
				DB:          nil,
				Cache:       nil,
				EmailsSent:  0,
				CurrentDate: time.Now(),
			},
			expectedError: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := mail.SendBulkEmailWithBCC(tt.emails, tt.subject, tt.body, tt.appsession)
			if tt.expectedError != nil {
				assert.EqualError(t, err, tt.expectedError.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
