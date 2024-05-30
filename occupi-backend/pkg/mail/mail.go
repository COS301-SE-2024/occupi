package mail

import (
	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"gopkg.in/gomail.v2"
)

// SendMail sends an email using gomail
func SendMail(to string, subject string, body string) error {
	from := configs.GetSystemEmail()
	password := configs.GetSmtpPassword()
	smtpHost := configs.GetSmtpHost()
	smtpPort := configs.GetSmtpPort()

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
