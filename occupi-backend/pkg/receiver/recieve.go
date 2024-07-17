package receiver

import (
	"context"
	"errors"
	"strings"
	"time"

	expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func StartConsumeMessage(appsession *models.AppSession) {
	msgs, err := appsession.RabbitCh.Consume(
		appsession.RabbitQ.Name,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		logrus.Error("Failed to consume message: ", err)
		return
	}

	go func() {
		for d := range msgs {
			parts := strings.Split(string(d.Body), "|")
			if len(parts) != 6 {
				continue
			}
			title, message, sendTimeStr, unsentExpoTokens, emails, unreadEmails := parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]
			sendTime, err := time.Parse(time.RFC3339, sendTimeStr)
			if err != nil {
				continue
			}

			notification := models.ScheduledNotification{
				Title:                title,
				Message:              message,
				SendTime:             sendTime,
				UnsentExpoPushTokens: utils.ConvertCommaDelimitedStringToArray(unsentExpoTokens),
				Emails:               utils.ConvertCommaDelimitedStringToArray(emails),
				UnreadEmails:         utils.ConvertCommaDelimitedStringToArray(unreadEmails),
			}

			// to account for discrepancies in time, we should allow for a range of 5 seconds before and after the scheduled time
			// whereby we can send the notification, after that, we should discard the notification, else if there
			// is still more than 5 seconds before the scheduled time, we should wait until the time is right
			now := time.Now()

			switch {
			case now.After(sendTime.Add(-5*time.Second)) && now.Before(sendTime.Add(5*time.Second)):
				err := SendPushNotification(notification, appsession)
				if err != nil {
					logrus.Error("Failed to send push notification: ", err)
				}
			case now.Before(sendTime.Add(-5 * time.Second)):
				// wait until the time is right
				time.Sleep(time.Until(sendTime))
				err := SendPushNotification(notification, appsession)
				if err != nil {
					logrus.Error("Failed to send push notification: ", err)
				}
			default:
				logrus.Error("Failed to send push notification: ", "notification time has passed")
			}
		}
	}()
}

func SendPushNotification(notification models.ScheduledNotification, appsession *models.AppSession) error {
	for _, token := range notification.UnsentExpoPushTokens {
		// To check the token is valid
		pushToken, err := expo.NewExponentPushToken(token)
		if err != nil {
			logrus.Error("Failed to create push token: ", err)
			continue
		}

		// Create a new Expo SDK client
		client := expo.NewPushClient(nil)

		// Publish message
		response, err := client.Publish(
			&expo.PushMessage{
				To:       []expo.ExponentPushToken{pushToken},
				Body:     notification.Message,
				Sound:    "default",
				Title:    notification.Title,
				Priority: expo.DefaultPriority,
			},
		)

		// Check errors
		if err != nil {
			logrus.Error("Failed to send notification: ", err)
			continue
		}

		// Validate responses
		if response.ValidateResponse() != nil {
			logrus.Error("Failed to validate response: ", response.PushMessage.To, " failed")
			continue
		}
	}

	// update notification in database
	success, err := database.DeleteExpoPushTokensFromScheduledNotification(context.Background(), appsession, notification)

	if err != nil {
		logrus.Error("Failed to update notification: ", err)
		return err
	}

	if !success {
		logrus.Error("Failed to update notification: ", err)
		return errors.New("failed to update notification")
	}

	return nil
}
