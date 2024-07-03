package mail

import "strconv"

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

	return appendHeader("Booking") + `
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
		</div>` + appendFooter()
}

// formats cancellation email body to send person who booked
func FormatCancellationEmailBodyForBooker(bookingID string, roomID string, slot int, email string) string {

	return appendHeader("Cancellation") + `
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
		</div>` + appendFooter()
}

// formats booking email body to send attendees
func FormatBookingEmailBodyForAttendees(bookingID string, roomID string, slot int, email string) string {
	return appendHeader("Booking") + `
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
		</div>` + appendFooter()
}

// formats cancellation email body to send attendees
func FormatCancellationEmailBodyForAttendees(bookingID string, roomID string, slot int, email string) string {
	return appendHeader("Booking") + `
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
		</div>` + appendFooter()
}

// formats verification email body
func FormatEmailVerificationBody(otp string, email string) string {
	return appendHeader("Registration") + `
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
		</div>` + appendFooter()
}

// formats re - verification email body
func FormatReVerificationEmailBody(otp string, email string) string {
	return appendHeader("Re-verification") + `
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
		</div>` + appendFooter()
}

func appendHeader(title string) string {
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

func appendFooter() string {
	return `
		<div class="footer" style="text-align:center; padding:10px; font-size:12px;">
			<img src="https://raw.githubusercontent.com/COS301-SE-2024/occupi/develop/presentation/Occupi/Occupi-black.png" alt="Business Banner" style="width:80%; max-width:600px; height:auto; margin-bottom:10px;">
			<p style="margin:5px 0;">140 Lunnon Road, Hillcrest, Pretoria. PO Box 14679, Hatfield, 0028</p>
		</div>
		</body>
		</html>
	`
}

// Password reset email 
func FormatResetPasswordEmailBody(resetLink string) string {
	return appendHeader("Password Reset") + `
		<div class="content">
			<p>Dear User,</p>
			<p>
				You have requested to reset your password. Please click the link below to reset your password:<br>
				<a href="` + resetLink + `">Reset Password</a><br><br>
				If you did not request this email, please ignore this email.<br><br>
				This link will expire in 1 hour.<br><br>
				Thank you,<br>
				<b>The Occupi Team</b><br>
			</p>
		</div>` + appendFooter()
}