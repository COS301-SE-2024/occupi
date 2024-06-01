package mail

import "fmt"

func FormatBookingEmailBody(BookingId int, RoomId string, Slot int) string {
	return `
		Dear User,

		Thank you for booking with Occupi. Here are your booking details:

		Booking ID: ` + fmt.Sprint(BookingId) + `
		Room ID: ` + RoomId + `
		Slot: ` + fmt.Sprint(Slot) + `

		If you have any questions, feel free to contact us.

		Thank you,
		The Occupi Team
		`
}
