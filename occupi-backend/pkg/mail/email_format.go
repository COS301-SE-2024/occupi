package mail

import "strconv"

func FormatBookingEmailBody(bookingID int, roomID string, slot int) string {
	return `
		Dear User,

		Thank you for booking with Occupi. Here are your booking details:

		Booking ID: ` + strconv.Itoa(bookingID) + `
		Room ID: ` + roomID + `
		Slot: ` + strconv.Itoa(slot) + `

		If you have any questions, feel free to contact us.

		Thank you,
		The Occupi Team
		`
}
