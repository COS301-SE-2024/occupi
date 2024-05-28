package mail

import (
	"net/smtp"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
)

func SendMail(to string, subject string, body string) error {
	from := configs.GetSystemEmail()
	password := configs.GetSmtpPassword()
	smtpHost := configs.GetSmtpHost()
	smtpPort := configs.GetSmtpPort()

	auth := smtp.PlainAuth("", from, password, smtpHost)

	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
	if err != nil {
		return err
	}

	return nil
}
