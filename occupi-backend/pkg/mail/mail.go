package mail

import (
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/constants"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"gopkg.in/gomail.v2"
)

const test = "test"

// SendMail sends an email using gomail
func SendMail(to string, subject string, body string) error {
	if configs.GetGinRunMode() == test {
		return nil // Do not send emails in test mode
	}

	m := gomail.NewMessage()
	m.SetHeader("From", configs.GetSystemEmail())
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(configs.GetSMTPHost(), configs.GetSMTPPort(), configs.GetSystemEmail(), configs.GetSMTPPassword())

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

// SendMailBCC sends an email using gomail with BCC
func SendMailBCC(subject, body, bcc string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", configs.GetSystemEmail())
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	m.SetHeader("Bcc", bcc)

	d := gomail.NewDialer(configs.GetSMTPHost(), configs.GetSMTPPort(), configs.GetSystemEmail(), configs.GetSMTPPassword())

	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

func SendMultipleEmailsConcurrently(emails []string, subject, body string, creator string) []string {
	if configs.GetGinRunMode() == test {
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

// SendBulkEmailWithBCC sends an email to multiple recipients using BCC
func SendBulkEmailWithBCC(emails []string, subject, body string, appsession *models.AppSession) error {
	// if new day, reset email count
	if time.Now().Day() != appsession.CurrentDate.Day() {
		appsession.EmailsSent = 0
		appsession.CurrentDate = time.Now()
	}

	// if email addresses exceed limit, return error
	if len(emails) > constants.RecipientsLimit {
		return errors.New("exceeded maximum number of recipients")
	}

	// if we will exceed max allowed emails, return error
	if appsession.EmailsSent+1 > constants.EmailsSentLimit {
		return errors.New("exceeded maximum number of emails sent per day")
	}

	// Send the email
	if configs.GetGinRunMode() != test {
		bcc := strings.Join(emails, ",")
		if err := SendMailBCC(subject, body, bcc); err != nil {
			return err
		}
	}

	// Update the email count
	appsession.EmailsSent++

	return nil
}

func SendBookingEmails(booking models.Booking) error {
	// Prepare the email content
	creatorSubject := "Booking Confirmation - Occupi"
	creatorBody := utils.FormatBookingEmailBodyForBooker(booking.ID, booking.RoomID, 0, booking.Emails, booking.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "You're invited to a Booking - Occupi"
	attendeesBody := utils.FormatBookingEmailBodyForAttendees(booking.ID, booking.RoomID, 0, booking.Creator)

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

func SendCancellationEmails(cancel models.Cancel) error {
	// Prepare the email content
	creatorSubject := "Booking Cancelled - Occupi"
	creatorBody := utils.FormatCancellationEmailBodyForBooker(cancel.BookingID, cancel.RoomID, 0, cancel.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "Booking Cancelled - Occupi"
	attendeesBody := utils.FormatCancellationEmailBodyForAttendees(cancel.BookingID, cancel.RoomID, 0, cancel.Creator)

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
