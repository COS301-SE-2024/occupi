package mail

import (
	"errors"
	"strings"

	"github.com/COS301-SE-2024/occupi/occupi-backend/configs"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"
	"gopkg.in/gomail.v2"
)

const test = "test"

// SendMail sends an email using gomail
func SendMail(appsession *models.AppSession, to string, subject string, body string) error {
	if configs.GetGinRunMode() == test {
		return nil // Do not send emails in test mode
	}

	m := gomail.NewMessage()
	m.SetHeader("From", configs.GetSystemEmail())
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	if err := appsession.MailConn.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

// SendMailBCC sends an email using gomail with BCC
func SendMailBCC(appsession *models.AppSession, subject, body, bcc string) error {
	if configs.GetGinRunMode() == test {
		return nil // Do not send emails in test mode
	}

	m := gomail.NewMessage()
	m.SetHeader("From", configs.GetSystemEmail())
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)
	m.SetHeader("Bcc", bcc)

	if err := appsession.MailConn.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

// SendBulkEmailWithBCC sends an email to multiple recipients using BCC
func SendBulkEmailWithBCC(emails []string, subject, body string, appsession *models.AppSession) error {
	// Send the email
	if configs.GetGinRunMode() != test {
		bcc := strings.Join(emails, ",")
		if err := SendMailBCC(appsession, subject, body, bcc); err != nil {
			return err
		}
	}

	return nil
}

func SendBookingEmails(booking models.Booking, appsession *models.AppSession) error {
	// Prepare the email content
	creatorSubject := "Booking Confirmation - Occupi"
	creatorBody := utils.FormatBookingEmailBodyForBooker(booking.ID, booking.RoomID, 0, booking.Emails, booking.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "You're invited to a Booking - Occupi"
	attendeesBody := utils.FormatBookingEmailBodyForAttendees(booking.ID, booking.RoomID, 0, booking.Creator)

	var attendeesEmails []string
	for _, email := range booking.Emails {
		if email != booking.Creator {
			attendeesEmails = append(attendeesEmails, email)
		}
	}

	creatorEmailError := SendMail(appsession, booking.Creator, creatorSubject, creatorBody)
	if creatorEmailError != nil {
		return creatorEmailError
	}

	// Send the confirmation email using bcc headers to all recipients
	err := SendBulkEmailWithBCC(attendeesEmails, attendeesSubject, attendeesBody, appsession)

	if err != nil {
		return errors.New("failed to send booking emails")
	}

	return nil
}

func SendCancellationEmails(cancel models.Cancel, appsession *models.AppSession) error {
	// Prepare the email content
	creatorSubject := "Booking Cancelled - Occupi"
	creatorBody := utils.FormatCancellationEmailBodyForBooker(cancel.BookingID, cancel.RoomID, 0, cancel.Creator)

	// Prepare the email content for attendees
	attendeesSubject := "Booking Cancelled - Occupi"
	attendeesBody := utils.FormatCancellationEmailBodyForAttendees(cancel.BookingID, cancel.RoomID, 0, cancel.Creator)

	var attendeesEmails []string
	for _, email := range cancel.Emails {
		if email != cancel.Creator {
			attendeesEmails = append(attendeesEmails, email)
		}
	}

	creatorEmailError := SendMail(appsession, cancel.Creator, creatorSubject, creatorBody)
	if creatorEmailError != nil {
		return creatorEmailError
	}

	// Send the confirmation email using bcc headers to all recipients
	err := SendBulkEmailWithBCC(attendeesEmails, attendeesSubject, attendeesBody, appsession)

	if err != nil {
		return errors.New("failed to send booking emails")
	}

	return nil
}
