package cache

func UserKey(email string) string {
	return "Users:" + email
}

func OTPKey(email, otp string) string {
	return "OTPs:" + email + ":" + otp
}

func RoomBookingKey(roomID string) string {
	return "RoomBookings:" + roomID
}

func ImageKey(imageID string) string {
	return "Images:" + imageID
}
