package receiver

import (
	"context"
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

	// check if there are any unsent notifications in the database
	notifications, err := database.GetScheduledNotifications(context.Background(), appsession)

	if err != nil {
		logrus.Error("Failed to get notifications: ", err)
	}

	go func() {
		for _, notification := range notifications {
			NotificationSendingLogic(notification, appsession)
		}
	}()

	go func() {
		for d := range msgs {
			parts := strings.Split(string(d.Body), "|")
			if len(parts) != 8 {
				continue
			}
			ID, notiID, title, message, sendTimeStr, unsentExpoTokens, emails, unreadEmails := parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6], parts[7]
			sendTime, err := time.Parse(time.RFC3339, sendTimeStr)
			if err != nil {
				continue
			}

			notification := models.ScheduledNotification{
				ID:                   ID,
				NotiID:               notiID,
				Title:                title,
				Message:              message,
				SendTime:             sendTime,
				UnsentExpoPushTokens: utils.ConvertCommaDelimitedStringToArray(unsentExpoTokens),
				Emails:               utils.ConvertCommaDelimitedStringToArray(emails),
				UnreadEmails:         utils.ConvertCommaDelimitedStringToArray(unreadEmails),
			}

			NotificationSendingLogic(notification, appsession)
		}
	}()
}

func NotificationSendingLogic(notification models.ScheduledNotification, appsession *models.AppSession) {
	// to account for discrepancies in time, we should allow for a range of 5 seconds before and after the scheduled time
	// whereby we can send the notification, after that, we should discard the notification, else if there
	// is still more than 5 seconds before the scheduled time, we should wait until the time is right
	now := time.Now().In(time.Local)

	switch {
	case now.After(notification.SendTime.Add(-5*time.Second)) && now.Before(notification.SendTime.Add(5*time.Second)):
		err := SendPushNotification(notification, appsession)
		if err != nil {
			logrus.Error("Failed to send push notification: ", err)
		}
	case now.Before(notification.SendTime.Add(-5 * time.Second)):
		// wait until the time is right
		time.Sleep(time.Until(notification.SendTime))
		err := SendPushNotification(notification, appsession)
		if err != nil {
			logrus.Error("Failed to send push notification: ", err)
		}
	default:
		// just mark the notification as sent
		err := database.MarkNotificationAsSent(context.Background(), appsession, notification.ID)
		if err != nil {
			logrus.Error("Failed to update notification: ", err)
		}
	}
}

func SendPushNotification(notification models.ScheduledNotification, appsession *models.AppSession) error {
	for _, token := range notification.UnsentExpoPushTokens {
		// To check the token is valid
		pushToken, err := expo.NewExponentPushToken(token)
		if err != nil {
			logrus.Error("Failed to create push token: ", err)
			continue
		}

		// Publish message
		response, err := appsession.ExpoClient.Publish(
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

	// if notification id is invalid or empty, return
	if notification.ID == "" {
		return nil
	}

	// update notification in database
	err := database.MarkNotificationAsSent(context.Background(), appsession, notification.ID)

	if err != nil {
		logrus.Error("Failed to update notification: ", err)
		return err
	}

	return nil
}
