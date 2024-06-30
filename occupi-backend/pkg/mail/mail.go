package mail

import (
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"gopkg.in/gomail.v2"
)

var (
	mu                sync.Mutex
	emailsSent        int
	recipientsReached int
	dayStart          time.Time
)

// SendMail sends an email using gomail
func SendMail(to string, subject string, body string) error {
	from := configs.GetSystemEmail()
	password := configs.GetSMTPPassword()
	smtpHost := configs.GetSMTPHost()
	smtpPort := configs.GetSMTPPort()

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

func SendMultipleEmailsConcurrently(emails []string, subject, body string) []string {
	// Use a WaitGroup to wait for all goroutines to complete
	var wg sync.WaitGroup
	var emailErrors []string
	var mu sync.Mutex

	for _, email := range emails {
		wg.Add(1)
		go func(email string) {
			defer wg.Done()
			if err := SendMail(email, subject, body); err != nil {
				mu.Lock()
				emailErrors = append(emailErrors, email)
				mu.Unlock()
			}
		}(email)
	}

	// Wait for all email sending goroutines to complete
	wg.Wait()

	return emailErrors
}

func SendBulkEmailWithBCC(emails []string, subject, body string) error {
	// Lock to prevent
	mu.Lock()

	// if new day, reset email count
	if time.Since(dayStart) > 24*time.Hour {
		dayStart = time.Now()
		emailsSent = 0
		recipientsReached = 0
	}

	// if emails exceed 10, return error
	if len(emails) > 10 {
		return errors.New("exceeded maximum number of recipients")
	}

	// if we will exceed max allowed emails of 50 per day, return error
	if emailsSent+len(emails) > 50 {
		return errors.New("exceeded maximum number of emails sent per day")
	}

	// if we will exceed max allowed recipients of 500 per day, return error
	if recipientsReached+len(emails) > 500 {
		return errors.New("exceeded maximum number of recipients per day")
	}

	// Send the email
	if configs.GetGinRunMode() != "test" {
		bcc := strings.Join(emails, ",")
		if err := SendMailBCC(subject, body, bcc); err != nil {
			return err
		}
	}

	return nil
}

func SendMailBCC(subject, body, bcc string) error {
	from := configs.GetSystemEmail()
	password := configs.GetSMTPPassword()
	smtpHost := configs.GetSMTPHost()
	smtpPort := configs.GetSMTPPort()

	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	m.SetHeader("Bcc", bcc)

	d := gomail.NewDialer(smtpHost, smtpPort, from, password)

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
