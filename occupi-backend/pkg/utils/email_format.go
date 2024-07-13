package utils

import (
	"strconv"

	"github.com/ipinfo/go/v2/ipinfo"
)

func AppendHeader(title string) string {
	return `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>` + title + `</title>
		<style>
			/* Inline CSS for better compatibility */
			.header {
				background-color: #f8f9fa;
				padding: 20px;
				text-align: center;
				font-family: Arial, sans-serif;
			}
			.content {
				padding: 20px;
				font-family: Arial, sans-serif;
			}
			.footer {
				padding: 10px;
				text-align: center;
				font-family: Arial, sans-serif;
				font-size: 12px;
				color: #888;
			}
		</style>
	</head>
	<body>
		<div class="header">
			<h1>Occupi ` + title + `</h1>
		</div>
	`
}

func AppendFooter() string {
	return `
		<div class="footer" style="text-align:center; padding:10px; font-size:12px;">
			<img src="https://raw.githubusercontent.com/COS301-SE-2024/occupi/develop/presentation/Occupi/Occupi-black.png" alt="Business Banner" style="width:80%; max-width:600px; height:auto; margin-bottom:10px;">
			<p style="margin:5px 0;">140 Lunnon Road, Hillcrest, Pretoria. PO Box 14679, Hatfield, 0028</p>
		</div>
		</body>
		</html>
	`
}

// formats booking email body
func FormatBookingEmailBody(bookingID string, roomID string, slot int) string {
	return `
		Dear User,

		Thank you for booking with Occupi. Here are your booking details:

		Booking ID: ` + bookingID + `
		Room ID: ` + roomID + `
		Slot: ` + strconv.Itoa(slot) + `

		If you have any questions, feel free to contact us.

		Thank you,
		The Occupi Team
		`
}

// formats booking email body to send person who booked
func FormatBookingEmailBodyForBooker(bookingID string, roomID string, slot int, attendees []string, email string) string {
	listOfAttendees := "<ul>"
	for _, email := range attendees {
		listOfAttendees += "<li>" + email + "</li>"
	}
	listOfAttendees += "</ul>"

	return AppendHeader("Booking") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully booked an office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> ` + bookingID + `<br>
				<b>Room ID:</b> ` + roomID + `<br>
				<b>Slot:</b> ` + strconv.Itoa(slot) + `<br><br>
				<b>Attendees:</b>` + listOfAttendees + `<br><br>
				Please ensure you arrive on time for your booking.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formats cancellation email body to send person who booked
func FormatCancellationEmailBodyForBooker(bookingID string, roomID string, slot int, email string) string {

	return AppendHeader("Cancellation") + `
		<div class="content">
			<p>Dear booker,</p>
			<p>
				You have successfully cancelled your booked office space. Here are the booking details:<br><br>
				<b>Booking ID:</b> ` + bookingID + `<br>
				<b>Room ID:</b> ` + roomID + `<br>
				<b>Slot:</b> ` + strconv.Itoa(slot) + `<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formats booking email body to send attendees
func FormatBookingEmailBodyForAttendees(bookingID string, roomID string, slot int, email string) string {
	return AppendHeader("Booking") + `
		<div class="content">
			<p>Dear attendees,</p>
			<p>
				` + email + ` has booked an office space and invited you to join. Here are the booking details:<br><br>
				<b>Booking ID:</b> ` + bookingID + `<br>
				<b>Room ID:</b> ` + roomID + `<br>
				<b>Slot:</b> ` + strconv.Itoa(slot) + `<br><br>
				If you have any questions, feel free to contact us.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formats cancellation email body to send attendees
func FormatCancellationEmailBodyForAttendees(bookingID string, roomID string, slot int, email string) string {
	return AppendHeader("Booking") + `
		<div class="content">
			<p>Dear attendees,</p>
			<p>
				` + email + ` has cancelled the booked office space with the following details:<br><br>
				<b>Booking ID:</b> ` + bookingID + `<br>
				<b>Room ID:</b> ` + roomID + `<br>
				<b>Slot:</b> ` + strconv.Itoa(slot) + `<br><br>
				If you have any questions, feel free to contact us.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formats verification email body
func FormatEmailVerificationBody(otp string, email string) string {
	return AppendHeader("Registration") + `
		<div class="content">
			<p>Dear ` + email + `,</p>
			<p>
				Thank you for registering with Occupi. <br><br>
				To complete your registration, please use the following One-Time Password (OTP) to verify your email address:<br>
				OTP: <b>` + otp + `</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formats re - verification email body
func FormatReVerificationEmailBody(otp string, email string) string {
	return AppendHeader("Re-verification") + `
		<div class="content">
			<p>Dear ` + email + `,</p>
			<p>
				Thank you for using Occupi. <br><br>
				To verify your email address, please use the following One-Time Password (OTP):<br>
				OTP: <b>` + otp + `</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formats ip address confirmation email body
func FormatIPAddressConfirmationEmailBody(otp string, email string) string {
	return AppendHeader("IP Address Confirmation") + `
		<div class="content">
			<p>Dear ` + email + `,</p>
			<p>
				Thank you for using Occupi. <br><br>
				We have detected a new login attempt from an unrecognized IP address. To confirm this login, please use the following One-Time Password (OTP):<br>
				OTP: <b>` + otp + `</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

func FormatIPAddressConfirmationEmailBodyWithIPInfo(otp string, email string, unrecognizedLogger *ipinfo.Core) string {
	return AppendHeader("IP Address Confirmation") + `
		<div class="content">
			<p>Dear ` + email + `,</p>
			<p>
				Thank you for using Occupi. <br><br>
				We have detected a new login attempt from ` + unrecognizedLogger.IP.String() +
		` in ` + unrecognizedLogger.City + `, ` + unrecognizedLogger.Region + `, ` + unrecognizedLogger.CountryName +
		`<br>Country Flag<br><img src="` + unrecognizedLogger.CountryFlagURL +
		`" alt="Country Flag" style="width: 20px; height: 20px; display: inline-block;"><br> 
				To confirm this login, please use the following One-Time Password (OTP):<br>
				OTP: <b>` + otp + `</b><br>
				This OTP is valid for the next <i>10 minutes</i>. Please do not share this OTP with anyone for security reasons.<br><br>
				If you did not request this email, please disregard it.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// FormatPasswordResetEmailBody(otp, email)
func FormatResetPasswordEmailBody(otp string, email string) string {
	return AppendHeader("Password Reset") + `
		<div class="content">
			<p>Dear ` + email + `,</p>
			<p>
				You have requested to reset your password. Your One-Time Password (OTP) is:<br>
				<h2 style="color: #4a4a4a; background-color: #f0f0f0; padding: 10px; display: inline-block;">` + otp + `</h2><br><br>
				Please use this OTP to reset your password. If you did not request this email, please ignore it.<br><br>
				This OTP will expire in 10 minutes.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}

// formatTwoFAEmailBody
func FormatTwoFAEmailBody(otp string, email string) string {
	return AppendHeader("Two-Factor Authentication") + `
		<div class="content">
			<p>Dear ` + email + `,</p>
			<p>
				You have requested to enable Two-Factor Authentication. Your One-Time Password (OTP) is:<br>
				<h2 style="color: #4a4a4a; background-color: #f0f0f0; padding: 10px; display: inline-block;">` + otp + `</h2><br><br>
				Please use this OTP to enable Two-Factor Authentication. If you did not request this email, please ignore it.<br><br>
				This OTP will expire in 10 minutes.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + AppendFooter()
}
