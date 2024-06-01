package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/database"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/mail"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResource(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(appsession.DB)

	ctx.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully",
		"data":    data,
	})
}

// handler for fetching test resource from /api/resource. Formats and returns json response
func FetchResourceAuth(ctx *gin.Context, appsession *models.AppSession) {
	data := database.GetAllData(appsession.DB)

	ctx.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Data fetched successfully and authenticated",
		"data":    data,
	})
}

// BookRoom handles booking a room and sends a confirmation email
func BookRoom(ctx *gin.Context, appsession *models.AppSession) {
	// consider structuring api respones to match that as outlined in our coding standards documentation
	//link: https://cos301-se-2024.github.io/occupi/coding-standards/go-coding-standards#response-and-error-handling

	var booking models.Booking
	if err := ctx.ShouldBindJSON(&booking); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Generate a unique ID for the booking
	booking.ID = primitive.NewObjectID().Hex()

	// Save the booking to the database
	_, err := database.SaveBooking(ctx, appsession.DB, booking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save booking"})
		return
	}

	// Prepare the email content
	subject := "Booking Confirmation - Occupi"
	body := mail.FormatBookingEmailBody(booking.BookingId, booking.RoomId, booking.Slot)

	// Send the confirmation email concurrently to all recipients
	emailErrors := utils.SendMultipleEmailsConcurrently(booking.Emails, subject, body)

	if len(emailErrors) > 0 {
		//avoid letting the user know which emails failed
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation emails to some addresses"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Booking successful! Confirmation emails sent."})
}

// CheckIn handles the check-in process for a booking
func CheckIn(ctx *gin.Context, appsession *models.AppSession) {
	// consider structuring api respones to match that as outlined in our coding standards documentation
	//link: https://cos301-se-2024.github.io/occupi/coding-standards/go-coding-standards#response-and-error-handling

	var request models.CheckIn

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	collection := appsession.DB.Database("occupi").Collection("bookings")

	// Build the dynamic filter for email check
	emailFilter := bson.A{}
	for key := range request.Email {
		emailFilter = append(emailFilter, bson.M{"emails." + strconv.Itoa(key): request.Email})
	}

	// Print the emailFilter for debugging
	fmt.Printf("Email Filter: %+v\n", emailFilter) //it would be better if you used a logger here, logrus is already setup, dont print

	// Find the booking by bookingId, roomId, and check if the email is in the emails object
	filter := bson.M{
		"bookingId": request.BookingId,
		"roomId":    request.RoomId,
		"$or":       emailFilter,
	}

	// Print the filter for debugging
	fmt.Printf("Filter: %+v\n", filter) //it would be better if you used a logger here, logrus is already setup, dont print

	// Find the booking
	var booking models.Booking
	err := collection.FindOne(context.TODO(), filter).Decode(&booking)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Booking not found or email not associated with the room"})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find booking"})
		}
		return
	}
	/**This section of code needs to be reviewed, can't make it to prod**/
	// Print the emails for debugging
	for key, email := range booking.Emails {
		fmt.Printf("Email %s: %s\n", key, email) //it would be better if you used a logger here, logrus is already setup, dont print
	}
	/**This section of code needs to be reviewed**/

	// Update the CheckedIn status
	update := bson.M{
		"$set": bson.M{"checkedIn": true},
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedBooking models.Booking

	err = collection.FindOneAndUpdate(context.TODO(), filter, update, opts).Decode(&updatedBooking)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update booking"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Check-in successful", "booking": updatedBooking})
}
