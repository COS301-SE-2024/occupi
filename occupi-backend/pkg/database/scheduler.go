package database

import (
	"fmt"
	"strings"
	"time"

	//"github.com/gin-gonic/gin"
	//expo "github.com/oliveroneill/exponent-server-sdk-golang/sdk"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
)

func createChannelAndQueue(appsession *models.AppSession) (*amqp.Channel, amqp.Queue, error) {
	ch, err := appsession.RabbitMQ.Channel()

	if err != nil {
		logrus.Error("Failed to create channel: ", err)
		return nil, amqp.Queue{}, err
	}

	defer ch.Close()

	q, err := ch.QueueDeclare(
		"notification_queue",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, amqp.Queue{}, err
	}

	return ch, q, nil
}

func PublishMessage(appsession *models.AppSession, notification models.ScheduledNotification) error {
	// publish message to the queue
	ch, q, err := createChannelAndQueue(appsession)
	if err != nil {
		return err
	}

	body := fmt.Sprintf("%s|%s|%s|%s", notification.Title, notification.Message, notification.SendTime.Format(time.RFC3339), notification.UnsentExpoPushTokens)
	err = ch.Publish(
		"",
		q.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(body),
		})
	return err

}

func ConsumeMessage(appsession *models.AppSession) {
	ch, q, err := createChannelAndQueue(appsession)
	if err != nil {
		logrus.Error("Failed to create channel and queue: ", err)
		return
	}

	msgs, err := ch.Consume(
		q.Name,
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
			if len(parts) != 4 {
				continue
			}
			title, message, sendTimeStr, unsentExpoTokens := parts[0], parts[1], parts[2], parts[3]
			sendTime, err := time.Parse(time.RFC3339, sendTimeStr)
			if err != nil {
				continue
			}
			unsentExpoTokensArr := strings.Split(unsentExpoTokens, ",")

			notification := models.ScheduledNotification{
				Title:                title,
				Message:              message,
				SendTime:             sendTime,
				UnsentExpoPushTokens: unsentExpoTokensArr,
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
	fmt.Printf("Sending push notification with title: %s, message: %s, emails: %s\n", notification.Title, notification.Message, notification.Emails)
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
