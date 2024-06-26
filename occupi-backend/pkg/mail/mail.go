package mail

import (
	"errors"
	"sync"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"gopkg.in/gomail.v2"
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

func SendMultipleEmailsConcurrently(emails []string, subject, body string, creator string) []string {
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

func SendBookingEmails(booking models.Booking) error {
	// Prepare the email content
	creatorSubject := "Booking Confirmation - Occupi"
	creatorBody := FormatBookingEmailBodyForBooker(booking.ID, booking.RoomID, booking.Slot, booking.Emails, booking.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "You're invited to a Booking - Occupi"
	attendeesBody := FormatBookingEmailBodyForAttendees(booking.ID, booking.RoomID, booking.Slot, booking.Creator)

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

func SendCancellationEmails(booking models.Booking) error {
	// Prepare the email content
	creatorSubject := "Booking Cancelled - Occupi"
	creatorBody := FormatCancellationEmailBodyForBooker(booking.ID, booking.RoomID, booking.Slot, booking.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "Booking Cancelled - Occupi"
	attendeesBody := FormatCancellationEmailBodyForAttendees(booking.ID, booking.RoomID, booking.Slot, booking.Creator)

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
