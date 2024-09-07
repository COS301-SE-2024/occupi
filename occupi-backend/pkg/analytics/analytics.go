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

func createMatchFilter(email string, filter models.OfficeHoursFilterStruct) bson.D {
	// Create a match filter
	matchFilter := bson.D{}

	// Conditionally add the email filter if email is not empty
	if email != "" {
		matchFilter = append(matchFilter, bson.E{Key: "email", Value: bson.D{{Key: "$eq", Value: email}}})
	}

	// Conditionally add the time range filter if provided
	timeRangeFilter := bson.D{}
	if filter.Filter["timeFrom"] != "" {
		timeRangeFilter = append(timeRangeFilter, bson.E{Key: "$gte", Value: filter.Filter["timeFrom"]})
	}
	if filter.Filter["timeTo"] != "" {
		timeRangeFilter = append(timeRangeFilter, bson.E{Key: "$lte", Value: filter.Filter["timeTo"]})
	}

	// If there are time range filters, append them to the match filter
	if len(timeRangeFilter) > 0 {
		matchFilter = append(matchFilter, bson.E{Key: "entered", Value: timeRangeFilter})
	}

	return matchFilter
}

// GroupOfficeHoursByDay function with total hours calculation
func GroupOfficeHoursByDay(email string, filter models.OfficeHoursFilterStruct) bson.D {
	return bson.D{
		// Stage 1: Match filter conditions (email and time range)
		{Key: "$match", Value: createMatchFilter(email, filter)},
		// Stage 2: Apply skip for pagination
		{Key: "$skip", Value: filter.Skip},
		// Stage 3: Apply limit for pagination
		{Key: "$limit", Value: filter.Limit},
		// Stage 4: Project the date and calculate the duration
		{Key: "$project", Value: bson.D{
			{Key: "email", Value: 1},
			{Key: "date", Value: bson.D{
				{Key: "$dateToString", Value: bson.D{
					{Key: "format", Value: "%Y-%m-%d"},
					{Key: "date", Value: "$entered"},
				}},
			}},
			{Key: "duration", Value: bson.D{
				{Key: "$divide", Value: bson.A{
					bson.D{{Key: "$subtract", Value: bson.A{"$exited", "$entered"}}},
					1000 * 60 * 60, // Convert milliseconds to hours
				}},
			}},
		}},
		// Stage 5: Group by the date and sum the durations
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$date"},
			{Key: "totalHours", Value: bson.D{
				{Key: "$sum", Value: "$duration"},
			}},
		}},
		// Stage 6: Group to calculate the overall total and prepare the days array
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "days", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "date", Value: "$_id"},
					{Key: "totalHours", Value: "$totalHours"},
				}},
			}},
			{Key: "overallTotal", Value: bson.D{
				{Key: "$sum", Value: "$totalHours"},
			}},
		}},
		// Stage 7: Unwind the days array for individual results
		{Key: "$unwind", Value: "$days"},
		// Stage 8: Project the final result format
		{Key: "$project", Value: bson.D{
			{Key: "date", Value: "$days.date"},
			{Key: "totalHours", Value: "$days.totalHours"},
			{Key: "overallTotal", Value: "$overallTotal"},
		}},
	}
}

func AverageOfficeHoursByWeekday(email string, filter models.OfficeHoursFilterStruct) bson.D {
	// Create the match filter using the reusable function
	matchFilter := createMatchFilter(email, filter)

	return bson.D{
		// Stage 1: Match filter conditions (email and time range)
		{Key: "$match", Value: matchFilter},
		// Stage 2: Apply skip for pagination
		{Key: "$skip", Value: filter.Skip},
		// Stage 3: Apply limit for pagination
		{Key: "$limit", Value: filter.Limit},
		// Stage 4: Project the weekday and duration
		{Key: "$project", Value: bson.D{
			{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
			{Key: "duration", Value: bson.D{
				{Key: "$divide", Value: bson.A{
					bson.D{{Key: "$subtract", Value: bson.A{"$exited", "$entered"}}},
					1000 * 60 * 60,
				}},
			}},
		}},
		// Stage 5: Group by the weekday and calculate the total hours and count
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$weekday"},
			{Key: "totalHours", Value: bson.D{{Key: "$sum", Value: "$duration"}}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}},
		// Stage 6: Project the weekday name and average hours
		{Key: "$project", Value: bson.D{
			{Key: "weekday", Value: bson.D{
				{Key: "$switch", Value: bson.D{
					{Key: "branches", Value: bson.A{
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 1}}}}, {Key: "then", Value: "Sunday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 2}}}}, {Key: "then", Value: "Monday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 3}}}}, {Key: "then", Value: "Tuesday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 4}}}}, {Key: "then", Value: "Wednesday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 5}}}}, {Key: "then", Value: "Thursday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 6}}}}, {Key: "then", Value: "Friday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 7}}}}, {Key: "then", Value: "Saturday"}},
					}},
					{Key: "default", Value: "Unknown"},
				}},
			}},
			{Key: "averageHours", Value: bson.D{
				{Key: "$cond", Value: bson.D{
					{Key: "if", Value: bson.D{{Key: "$gt", Value: bson.A{"$count", 0}}}},
					{Key: "then", Value: bson.D{{Key: "$divide", Value: bson.A{"$totalHours", "$count"}}}},
					{Key: "else", Value: 0},
				}},
			}},
			{Key: "totalHours", Value: "$totalHours"},
			{Key: "count", Value: "$count"},
		}},
		// Stage 7: Group all results together to calculate the overall totals
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "days", Value: bson.D{{Key: "$push", Value: bson.D{
				{Key: "weekday", Value: "$weekday"},
				{Key: "averageHours", Value: "$averageHours"},
			}}}},
			{Key: "overallTotal", Value: bson.D{{Key: "$sum", Value: "$totalHours"}}},
			{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: "$count"}}},
		}},
		// Stage 8: Project final structure with overall average
		{Key: "$project", Value: bson.D{
			{Key: "days", Value: 1},
			{Key: "overallAverage", Value: bson.D{
				{Key: "$cond", Value: bson.D{
					{Key: "if", Value: bson.D{{Key: "$gt", Value: bson.A{"$overallWeekdayCount", 0}}}},
					{Key: "then", Value: bson.D{{Key: "$divide", Value: bson.A{"$overallTotal", "$overallWeekdayCount"}}}},
					{Key: "else", Value: 0},
				}},
			}},
			{Key: "overallTotal", Value: 1},
			{Key: "overallWeekdayCount", Value: 1},
		}},
	}
}

func RatioInOutOfficeByWeekday(email string, filter models.OfficeHoursFilterStruct) bson.D {
	// Create the match filter using the reusable function
	matchFilter := createMatchFilter(email, filter)

	return bson.D{
		// Stage 1: Match filter conditions (email and time range)
		{Key: "$match", Value: matchFilter},
		// Stage 2: Apply skip for pagination
		{Key: "$skip", Value: filter.Skip},
		// Stage 3: Apply limit for pagination
		{Key: "$limit", Value: filter.Limit},
		// Stage 4: Project the weekday, entered and exited times
		{Key: "$addFields", Value: bson.D{
			{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
			{Key: "enteredHour", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
			{Key: "exitedHour", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
		}},
		// Stage 5: Project the weekday, email, enteredHour, exitedHour and hoursInOffice
		{Key: "$project", Value: bson.D{
			{Key: "weekday", Value: 1},
			{Key: "email", Value: 1},
			{Key: "enteredHour", Value: bson.D{
				{Key: "$cond", Value: bson.A{
					bson.D{{Key: "$lt", Value: bson.A{"$enteredHour", 7}}},
					7,
					"$enteredHour",
				}},
			}},
			{Key: "exitedHour", Value: bson.D{
				{Key: "$cond", Value: bson.A{
					bson.D{{Key: "$gt", Value: bson.A{"$exitedHour", 17}}},
					17,
					"$exitedHour",
				}},
			}},
			{Key: "hoursInOffice", Value: bson.D{
				{Key: "$subtract", Value: bson.A{"$exitedHour", "$enteredHour"}},
			}},
		}},
		// Stage 6: Group by the weekday and calculate the total hours in office and count
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$weekday"},
			{Key: "totalHoursInOffice", Value: bson.D{{Key: "$sum", Value: "$hoursInOffice"}}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}},
		{Key: "$addFields", Value: bson.D{
			{Key: "ratio", Value: bson.D{
				{Key: "$divide", Value: bson.A{"$totalHoursInOffice", "$count"}},
			}},
			{Key: "weekdayName", Value: bson.D{
				{Key: "$switch", Value: bson.D{
					{Key: "branches", Value: bson.A{
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 1}}}}, {Key: "then", Value: "Sunday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 2}}}}, {Key: "then", Value: "Monday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 3}}}}, {Key: "then", Value: "Tuesday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 4}}}}, {Key: "then", Value: "Wednesday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 5}}}}, {Key: "then", Value: "Thursday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 6}}}}, {Key: "then", Value: "Friday"}},
						bson.D{{Key: "case", Value: bson.D{{Key: "$eq", Value: bson.A{"$_id", 7}}}}, {Key: "then", Value: "Saturday"}},
					}},
					{Key: "default", Value: "Unknown"},
				}},
			}},
		}},
		// Stage 7: Sort by weekday
		{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}},
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "days", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "weekday", Value: "$weekdayName"},
					{Key: "ratio", Value: "$ratio"},
				}},
			}},
			{Key: "overallRatio", Value: bson.D{{Key: "$avg", Value: "$ratio"}}},
			{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: 1}}},
		}},
		// Stage 8: Project the final result format
		{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
			{Key: "days", Value: 1},
			{Key: "ratio", Value: "$overallRatio"},
			{Key: "overallWeekdayCount", Value: 1},
		}},
	}
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
	// prealloc
	result := make([]bson.M, 0, 6)
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
	// prealloc
	overallActivities := make([]overallHourActivity, 0, len(overallActivity))

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
