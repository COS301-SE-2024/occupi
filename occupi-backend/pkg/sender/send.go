package sender

import (
	"context"
	"fmt"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"

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
		utils.ConvertArrayToCommaDelimitedString(notification.UnsentExpoPushTokens),
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
