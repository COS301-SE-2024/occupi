package analytics

import (
	"fmt"
	"sort"
	"time"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
)

// Helper function to get the minimum of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Helper function to get the maximum of two integers
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// Helper function to get the maximum of two time values
func MaxTime(t1, t2 time.Time) time.Time {
	if t1.After(t2) {
		return t1
	}
	return t2
}

// Helper function to get the minimum of two time values
func MinTime(t1, t2 time.Time) time.Time {
	if t1.Before(t2) {
		return t1
	}
	return t2
}

// GroupOfficeHoursByDay function with total hours calculation
func GroupOfficeHoursByDay(officeHours []models.OfficeHours) []bson.M {
	grouped := make(map[string]float64)

	for _, oh := range officeHours {
		// Extract date without time as the key
		dateKey := oh.Entered.Format("2006-01-02")

		// Calculate the duration in hours for this office hour
		duration := oh.Exited.Sub(oh.Entered).Hours()

		// Sum the duration to the corresponding date's total
		grouped[dateKey] += duration
	}

	// Convert the map to a slice of bson.M
	var result []bson.M
	var overallTotal float64
	for date, totalHours := range grouped {
		dayData := bson.M{
			"date":       date,
			"totalHours": totalHours,
		}
		result = append(result, dayData)
		overallTotal += totalHours
	}
	result = append(result, bson.M{"overallTotal": overallTotal})

	return result
}

// AverageOfficeHoursByWeekday function
func AverageOfficeHoursByWeekday(officeHours []models.OfficeHours) []bson.M {
	// Initialize the maps for storing total hours and count of entries for each weekday
	weekdayHours := make(map[time.Weekday]float64)
	weekdayCount := make(map[time.Weekday]int)

	// Initialize Monday to Friday in the map with zero values
	for _, weekday := range []time.Weekday{time.Monday, time.Tuesday, time.Wednesday, time.Thursday, time.Friday} {
		weekdayHours[weekday] = 0
		weekdayCount[weekday] = 0
	}

	// Iterate over each office hour entry
	for _, oh := range officeHours {
		// Get the weekday (Monday = 1, ..., Friday = 5)
		weekday := oh.Entered.Weekday()

		// Skip Saturday and Sunday
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}

		// Calculate the duration in hours for this office hour
		duration := oh.Exited.Sub(oh.Entered).Hours()

		// Accumulate the duration and increment the count for the weekday
		weekdayHours[weekday] += duration
		weekdayCount[weekday]++
	}

	// Prepare the result as a slice of bson.M
	var result []bson.M
	overallTotal := 0.0
	overallWeekdayCount := 0

	for _, weekday := range []time.Weekday{time.Monday, time.Tuesday, time.Wednesday, time.Thursday, time.Friday} {
		var averageHours float64

		if weekdayCount[weekday] > 0 {
			averageHours = weekdayHours[weekday] / float64(weekdayCount[weekday])
		} else {
			averageHours = 0
		}

		dayData := bson.M{
			"weekday":      weekday.String(),
			"averageHours": averageHours,
		}
		result = append(result, dayData)

		overallTotal += weekdayHours[weekday]
		overallWeekdayCount += weekdayCount[weekday]
	}

	// Calculate the overall average if there are any entries, otherwise set to 0
	if overallWeekdayCount == 0 {
		result = append(result, bson.M{"overallAverage": 0, "overallTotal": 0, "overallWeekdayCount": 0})
	} else {
		result = append(result, bson.M{"overallAverage": overallTotal / float64(overallWeekdayCount), "overallTotal": overallTotal, "overallWeekdayCount": overallWeekdayCount})
	}

	return result
}

// RatioInOutOfficeByWeekday function
func RatioInOutOfficeByWeekday(officeHours []models.OfficeHours) []bson.M {
	weekdayInHours := make(map[time.Weekday]float64)
	totalWeekdayOfficeHours := make(map[time.Weekday]float64)
	totalOfficeHours := 10.0 // 7 AM to 5 PM is 10 hours

	// Initialize Monday to Friday in the map with zero values
	for _, weekday := range []time.Weekday{time.Monday, time.Tuesday, time.Wednesday, time.Thursday, time.Friday} {
		weekdayInHours[weekday] = 0
		totalWeekdayOfficeHours[weekday] = totalOfficeHours
	}

	// Iterate over each office hour entry
	for _, oh := range officeHours {
		// Get the weekday (Monday = 1, ..., Friday = 5)
		weekday := oh.Entered.Weekday()

		// Skip Saturday and Sunday
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}

		// Define the office hours for the day
		officeStart := time.Date(oh.Entered.Year(), oh.Entered.Month(), oh.Entered.Day(), 7, 0, 0, 0, oh.Entered.Location())
		officeEnd := time.Date(oh.Entered.Year(), oh.Entered.Month(), oh.Entered.Day(), 17, 0, 0, 0, oh.Entered.Location())

		// Calculate the overlap between actual office hours and standard office hours
		actualStart := MaxTime(oh.Entered, officeStart)
		actualEnd := MinTime(oh.Exited, officeEnd)

		// Calculate the duration in hours for the overlap (in-office time)
		if actualStart.Before(actualEnd) {
			inOfficeDuration := actualEnd.Sub(actualStart).Hours()
			weekdayInHours[weekday] += inOfficeDuration
			totalWeekdayOfficeHours[weekday] += totalOfficeHours
		}
	}

	// Prepare the result as a slice of bson.M
	var result []bson.M
	overallOutHours := 0.0
	overallInHours := 0.0

	for _, weekday := range []time.Weekday{time.Monday, time.Tuesday, time.Wednesday, time.Thursday, time.Friday} {
		inHours := weekdayInHours[weekday]
		outHours := totalWeekdayOfficeHours[weekday] - inHours

		// Calculate ratio, ensuring no division by zero
		var ratio float64
		if outHours > 0 {
			ratio = inHours / outHours
		} else {
			ratio = 0
		}

		dayData := bson.M{
			"weekday":        weekday.String(),
			"inOfficeHours":  inHours,
			"outOfficeHours": outHours,
			"ratio":          ratio,
		}
		result = append(result, dayData)

		overallInHours += inHours
		overallOutHours += outHours
	}

	// Calculate the overall ratio if there are any entries, otherwise set to 0
	if overallOutHours == 0 {
		result = append(result, bson.M{"overallRatio": 0, "overallInHours": 0, "overallOutHours": 0})
	} else {
		result = append(result, bson.M{"overallRatio": overallInHours / overallOutHours, "overallInHours": overallInHours, "overallOutHours": overallOutHours})
	}

	return result
}

// BusiestHoursByWeekday function to return the 3 busiest hours per weekday
func BusiestHoursByWeekday(officeHours []models.OfficeHours) []bson.M {
	// Map to store the total overlaps for each weekday and hour
	hourlyActivity := make(map[time.Weekday]map[int]int)
	overallActivity := make(map[int]int)

	// Initialize the map
	for _, weekday := range []time.Weekday{time.Monday, time.Tuesday, time.Wednesday, time.Thursday, time.Friday} {
		hourlyActivity[weekday] = make(map[int]int)
	}

	// Iterate over office hours entries
	for _, oh := range officeHours {
		// Get the weekday (Monday = 1, ..., Friday = 5)
		weekday := oh.Entered.Weekday()

		// Skip Saturday and Sunday
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}

		// Calculate the hours between Entered and Exited, ensuring they are within 07:00 and 17:00
		for hour := max(7, oh.Entered.Hour()); hour < min(17, oh.Exited.Hour()); hour++ {
			hourlyActivity[weekday][hour]++
			overallActivity[hour]++
		}
	}

	// Determine the top 3 busiest hours for each weekday
	var result []bson.M
	for weekday, hours := range hourlyActivity {
		// Create a slice to store the hours and their activity counts
		type hourActivity struct {
			Hour     int
			Activity int
		}
		var activities []hourActivity

		// Collect the hourly activity for the current weekday
		for hour, activity := range hours {
			activities = append(activities, hourActivity{Hour: hour, Activity: activity})
		}

		// Sort the activities by activity count in descending order
		sort.Slice(activities, func(i, j int) bool {
			return activities[i].Activity > activities[j].Activity
		})

		// Get the top 3 busiest hours
		busiestHours := make([]int, 0, 3)
		for i := 0; i < min(3, len(activities)); i++ {
			busiestHours = append(busiestHours, activities[i].Hour)
		}

		// Store the result for the current weekday
		peakData := bson.M{
			"weekday":      weekday.String(),
			"busiestHours": busiestHours,
		}
		result = append(result, peakData)
	}

	// Determine the overall top 3 busiest hours across the entire week
	type overallHourActivity struct {
		Hour     int
		Activity int
	}
	var overallActivities []overallHourActivity
	for hour, activity := range overallActivity {
		overallActivities = append(overallActivities, overallHourActivity{Hour: hour, Activity: activity})
	}

	// Sort the overall activities by activity count in descending order
	sort.Slice(overallActivities, func(i, j int) bool {
		return overallActivities[i].Activity > overallActivities[j].Activity
	})

	// Get the top 3 busiest hours overall
	overallBusiestHours := make([]int, 0, 3)
	for i := 0; i < min(3, len(overallActivities)); i++ {
		overallBusiestHours = append(overallBusiestHours, overallActivities[i].Hour)
	}

	// Append the overall busiest hours to the result
	result = append(result, bson.M{"overallBusiestHours": overallBusiestHours})

	return result
}

// LeastInOfficeWorker function to calculate the least "in office" worker
func LeastInOfficeWorker(officeHours []models.OfficeHours) []bson.M {
	// Map to store total hours worked per email
	hoursWorked := make(map[string]float64)
	// Map to store number of days worked per email
	daysWorked := make(map[string]int)

	// Iterate over the office hours entries
	for _, oh := range officeHours {
		weekday := oh.Entered.Weekday()

		// Skip Saturday and Sunday
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}

		// Calculate hours worked in the office
		startTime := MaxTime(oh.Entered, time.Date(oh.Entered.Year(), oh.Entered.Month(), oh.Entered.Day(), 7, 0, 0, 0, oh.Entered.Location()))
		endTime := MinTime(oh.Exited, time.Date(oh.Exited.Year(), oh.Exited.Month(), oh.Exited.Day(), 17, 0, 0, 0, oh.Exited.Location()))

		hours := endTime.Sub(startTime).Hours()

		// Accumulate hours worked for the email
		hoursWorked[oh.Email] += hours

		// Track the number of days worked (only count unique weekdays)
		if _, exists := daysWorked[oh.Email]; !exists {
			daysWorked[oh.Email] = 0
		}
		daysWorked[oh.Email]++
	}

	// Determine the least "in office" worker
	leastEmail := ""
	leastHours := float64(1<<63 - 1) // Set to a large value initially

	for email, hours := range hoursWorked {
		if hours < leastHours {
			leastEmail = email
			leastHours = hours
		}
	}

	// Calculate average hours for the least "in office" worker
	totalDays := float64(daysWorked[leastEmail])
	var averageHours float64
	if totalDays > 0 {
		averageHours = leastHours / totalDays
	}

	var result []bson.M
	result = append(result, bson.M{"email": leastEmail, "totalHours": leastHours, "averageHours": averageHours})

	return result
}

// MostInOfficeWorker function to calculate the most "in office" worker
func MostInOfficeWorker(officeHours []models.OfficeHours) []bson.M {
	// Map to store total hours worked per email
	hoursWorked := make(map[string]float64)
	// Map to store number of days worked per email
	daysWorked := make(map[string]int)

	// Iterate over the office hours entries
	for _, oh := range officeHours {
		weekday := oh.Entered.Weekday()

		// Skip Saturday and Sunday
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}

		// Calculate hours worked in the office
		startTime := MaxTime(oh.Entered, time.Date(oh.Entered.Year(), oh.Entered.Month(), oh.Entered.Day(), 7, 0, 0, 0, oh.Entered.Location()))
		endTime := MinTime(oh.Exited, time.Date(oh.Exited.Year(), oh.Exited.Month(), oh.Exited.Day(), 17, 0, 0, 0, oh.Exited.Location()))

		hours := endTime.Sub(startTime).Hours()

		// Accumulate hours worked for the email
		hoursWorked[oh.Email] += hours

		// Track the number of days worked (only count unique weekdays)
		if _, exists := daysWorked[oh.Email]; !exists {
			daysWorked[oh.Email] = 0
		}
		daysWorked[oh.Email]++
	}

	// Determine the most "in office" worker
	mostEmail := ""
	mostHours := float64(0)

	for email, hours := range hoursWorked {
		if hours > mostHours {
			mostEmail = email
			mostHours = hours
		}
	}

	// Calculate average hours for the most "in office" worker
	totalDays := float64(daysWorked[mostEmail])
	var averageHours float64
	if totalDays > 0 {
		averageHours = mostHours / totalDays
	}

	var result []bson.M

	result = append(result, bson.M{"email": mostEmail, "totalHours": mostHours, "averageHours": averageHours})

	return result
}

// AverageArrivalAndDepartureTimesByWeekday function to calculate the average arrival and departure times for each weekday
func AverageArrivalAndDepartureTimesByWeekday(officeHours []models.OfficeHours) []bson.M {
	weekdayArrivalTimes := make(map[time.Weekday]time.Duration)
	weekdayDepartureTimes := make(map[time.Weekday]time.Duration)
	weekdayCount := make(map[time.Weekday]int)

	for _, oh := range officeHours {
		weekday := oh.Entered.Weekday()
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}
		arrivalTime := time.Duration(oh.Entered.Hour())*time.Hour + time.Duration(oh.Entered.Minute())*time.Minute
		departureTime := time.Duration(oh.Exited.Hour())*time.Hour + time.Duration(oh.Exited.Minute())*time.Minute

		weekdayArrivalTimes[weekday] += arrivalTime
		weekdayDepartureTimes[weekday] += departureTime
		weekdayCount[weekday]++
	}

	var result []bson.M
	var totalArrivalTime, totalDepartureTime time.Duration
	var totalCount int

	for weekday := time.Monday; weekday <= time.Friday; weekday++ {
		averageArrivalTime := time.Duration(0)
		averageDepartureTime := time.Duration(0)

		if weekdayCount[weekday] > 0 {
			averageArrivalTime = weekdayArrivalTimes[weekday] / time.Duration(weekdayCount[weekday])
			averageDepartureTime = weekdayDepartureTimes[weekday] / time.Duration(weekdayCount[weekday])
		}

		arrivalHours := averageArrivalTime / time.Hour
		arrivalMinutes := (averageArrivalTime % time.Hour) / time.Minute

		departureHours := averageDepartureTime / time.Hour
		departureMinutes := (averageDepartureTime % time.Hour) / time.Minute

		dayData := bson.M{
			"weekday":              weekday.String(),
			"averageArrivalTime":   fmt.Sprintf("%02d:%02d", arrivalHours, arrivalMinutes),
			"averageDepartureTime": fmt.Sprintf("%02d:%02d", departureHours, departureMinutes),
		}
		result = append(result, dayData)

		totalArrivalTime += weekdayArrivalTimes[weekday]
		totalDepartureTime += weekdayDepartureTimes[weekday]
		totalCount += weekdayCount[weekday]
	}

	overallAverageArrivalTime := time.Duration(0)
	overallAverageDepartureTime := time.Duration(0)

	if totalCount > 0 {
		overallAverageArrivalTime = totalArrivalTime / time.Duration(totalCount)
		overallAverageDepartureTime = totalDepartureTime / time.Duration(totalCount)
	}

	overallArrivalHours := overallAverageArrivalTime / time.Hour
	overallArrivalMinutes := (overallAverageArrivalTime % time.Hour) / time.Minute

	overallDepartureHours := overallAverageDepartureTime / time.Hour
	overallDepartureMinutes := (overallAverageDepartureTime % time.Hour) / time.Minute

	result = append(result, bson.M{
		"overallAverageArrivalTime":   fmt.Sprintf("%02d:%02d", overallArrivalHours, overallArrivalMinutes),
		"overallAverageDepartureTime": fmt.Sprintf("%02d:%02d", overallDepartureHours, overallDepartureMinutes),
	})

	return result
}

// CalculateInOfficeRate function to calculate absenteeism rates
func CalculateInOfficeRate(officeHours []models.OfficeHours) []bson.M {
	expectedDailyHours := 10.0 // 7 AM to 5 PM
	weekdayInHours := make(map[time.Weekday]float64)
	weekdayAbsenteeism := make(map[time.Weekday]float64)
	weekdayCount := make(map[time.Weekday]int)

	// Iterate over office hours entries
	for _, oh := range officeHours {
		weekday := oh.Entered.Weekday()
		if weekday == time.Saturday || weekday == time.Sunday {
			continue
		}

		// Define the office hours for the day
		officeStart := time.Date(oh.Entered.Year(), oh.Entered.Month(), oh.Entered.Day(), 7, 0, 0, 0, oh.Entered.Location())
		officeEnd := time.Date(oh.Entered.Year(), oh.Entered.Month(), oh.Entered.Day(), 17, 0, 0, 0, oh.Entered.Location())

		// Calculate the overlap between actual office hours and standard office hours
		actualStart := MaxTime(oh.Entered, officeStart)
		actualEnd := MinTime(oh.Exited, officeEnd)

		// Calculate the duration in hours for the overlap (in-office time)
		inOfficeDuration := 0.0
		if actualStart.Before(actualEnd) {
			inOfficeDuration = actualEnd.Sub(actualStart).Hours()
		}

		weekdayInHours[weekday] += inOfficeDuration
		weekdayAbsenteeism[weekday] += expectedDailyHours - inOfficeDuration
		weekdayCount[weekday]++
	}

	// Prepare the result as a slice of bson.M
	var result []bson.M
	var overallAbsenteeism float64
	var overallInHours float64
	var totalCount int

	for weekday := time.Monday; weekday <= time.Friday; weekday++ {
		absenteeismRate := 0.0
		if weekdayCount[weekday] > 0 {
			absenteeismRate = (weekdayAbsenteeism[weekday] / (float64(weekdayCount[weekday]) * expectedDailyHours)) * 100
		}

		dayData := bson.M{
			"weekday":      weekday.String(),
			"inOfficeRate": 100.0 - absenteeismRate,
		}
		result = append(result, dayData)

		overallAbsenteeism += weekdayAbsenteeism[weekday]
		overallInHours += weekdayInHours[weekday]
		totalCount += weekdayCount[weekday]
	}

	// Calculate overall absenteeism rate
	overallAbsenteeismRate := 0.0
	if totalCount > 0 {
		overallAbsenteeismRate = (overallAbsenteeism / (float64(totalCount) * expectedDailyHours)) * 100
	}

	result = append(result, bson.M{
		"overallInOfficeRate": 100.0 - overallAbsenteeismRate,
	})

	return result
}
