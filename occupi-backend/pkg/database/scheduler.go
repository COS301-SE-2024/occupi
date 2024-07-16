package database

import (
	"context"
	"fmt"
	"strings"
	"time"

	//"github.com/gin-gonic/gin"
	//expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
)

func PublishMessage(appsession *models.AppSession, notification models.ScheduledNotification) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	body := fmt.Sprintf(
		"%s|%s|%s|%s|%s|%s",
		notification.Title,
		notification.Message,
		notification.SendTime.Format(time.RFC3339),
		notification.UnsentExpoPushTokens,
		utils.ConvertArrayToCommaDelimitedString(notification.Emails),
		utils.ConvertArrayToCommaDelimitedString(notification.UnreadEmails),
	)
	err := appsession.RabbitCh.PublishWithContext(ctx,
		"",
		appsession.RabbitQ.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(body),
		})
	return err

}

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
			if time.Now().After(sendTime.Add(-5*time.Second)) && time.Now().Before(sendTime.Add(5*time.Second)) {
				err := SendPushNotification(notification, appsession)
				if err != nil {
					logrus.Error("Failed to send push notification: ", err)
				}
			} else if time.Now().Before(sendTime.Add(-5 * time.Second)) {
				// wait until the time is right
				time.Sleep(time.Until(sendTime))
				err := SendPushNotification(notification, appsession)
				if err != nil {
					logrus.Error("Failed to send push notification: ", err)
				}
			} else {
				logrus.Error("Failed to send push notification: ", "notification time has passed")
			}
		}
	}()
}

func SendPushNotification(notification models.ScheduledNotification, appsession *models.AppSession) error {
	fmt.Printf("Sending push notification with title: %s, message: %s\n", notification.Title, notification.Message)
	fmt.Printf("Notification time: %s\n", notification.SendTime.Format(time.RFC3339))
	fmt.Printf("Tokens: %s\n", notification.UnsentExpoPushTokens)
	fmt.Printf("Emails: %s\n", notification.Emails)
	fmt.Printf("Unread emails: %s\n", notification.UnreadEmails)

	/*
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

		ctx, _ := gin.CreateTestContext(nil)

		// update notification in database
		success, err := DeleteExpoPushTokensFromScheduledNotification(ctx, appsession, notification)

		if err != nil {
			logrus.Error("Failed to update notification: ", err)
			return err
		}

		if !success {
			logrus.Error("Failed to update notification: ", err)
			return fmt.Errorf("failed to update notification")
		}*/

	return nil
}
