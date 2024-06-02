package mail

import "strconv"

// formats booking email body
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

// formats verification email body
func FormatEmailVerificationBody(otp string) string {
	return `
		Thank you for registering with Occupi. To complete your registration, please use the following One-Time Password (OTP) to verify your email address:

		OTP: ` + otp + `

		This OTP is valid for the next 10 minutes. Please do not share this OTP with anyone for security reasons.

		If you did not request this email, please disregard it.

		Thank you,
		The Occupi Team
		`
}
