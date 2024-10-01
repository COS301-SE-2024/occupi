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

func SessionKey(email string) string {
	return "Sessions:" + email
}

func LoginKey(email string) string {
	return "Login:" + email
}

func MobileUserKey(email string) string {
	return "MobileUsers:" + email
}
