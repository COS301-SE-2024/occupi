package mail

import (
	"net/smtp"
)

func SendMail(to string, subject string, body string) error {
	from := "testemailnetworks123@gmail.com"
	password := "faue bmhu ytnr uogp"
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

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
