package mail

import (
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
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
	if configs.GetGinRunMode() == "test" {
		return nil // Do not send emails in test mode
	}

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

func SendMultipleEmailsConcurrently(emails []string, subject, body string, creator string) []string {
	if configs.GetGinRunMode() == "test" {
		return []string{} // Do not send emails in test mode
	}

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

func SendBookingEmails(booking models.Booking) error {
	// Prepare the email content
	creatorSubject := "Booking Confirmation - Occupi"
	creatorBody := FormatBookingEmailBodyForBooker(booking.ID, booking.RoomID, 0, booking.Emails, booking.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "You're invited to a Booking - Occupi"
	attendeesBody := FormatBookingEmailBodyForAttendees(booking.ID, booking.RoomID, 0, booking.Creator)

	var attendees []string
	for _, email := range booking.Emails {
		if email != booking.Creator {
			attendees = append(attendees, email)
		}
	}

	creatorEmailError := SendMail(booking.Creator, creatorSubject, creatorBody)
	if creatorEmailError != nil {
		return creatorEmailError
	}

	// Send the confirmation email concurrently to all recipients
	emailErrors := SendMultipleEmailsConcurrently(attendees, attendeesSubject, attendeesBody, booking.Creator)

	if len(emailErrors) > 0 {
		return errors.New("failed to send booking  emails")
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

func SendCancellationEmails(cancel models.Cancel) error {
	// Prepare the email content
	creatorSubject := "Booking Cancelled - Occupi"
	creatorBody := FormatCancellationEmailBodyForBooker(cancel.BookingID, cancel.RoomID, 0, cancel.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "Booking Cancelled - Occupi"
	attendeesBody := FormatCancellationEmailBodyForAttendees(cancel.BookingID, cancel.RoomID, 0, cancel.Creator)

	var attendees []string
	for _, email := range cancel.Emails {
		if email != cancel.Creator {
			attendees = append(attendees, email)
		}
	}

	creatorEmailError := SendMail(cancel.Creator, creatorSubject, creatorBody)
	if creatorEmailError != nil {
		return creatorEmailError
	}

	// Send the confirmation email concurrently to all recipients
	emailErrors := SendMultipleEmailsConcurrently(attendees, attendeesSubject, attendeesBody, cancel.Creator)

	if len(emailErrors) > 0 {
		return errors.New("failed to send cancellation emails")
	}

	return nil
}
