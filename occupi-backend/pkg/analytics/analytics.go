package analytics

import (
	"fmt"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
)

func CreateOfficeHoursMatchFilter(email string, filter models.AnalyticsFilterStruct) bson.D {
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
	if len(timeRangeFilter) > 0 && len(filter.Filter) > 0 {
		matchFilter = append(matchFilter, bson.E{Key: "entered", Value: timeRangeFilter})
	}

	return matchFilter
}

func CreateBookingMatchFilter(creatorEmail string, attendeesEmail []string, filter models.AnalyticsFilterStruct, dateFilter string) bson.D {
	// Create a match filter
	matchFilter := bson.D{}

	// Conditionally add the email filter if email is not empty
	if creatorEmail != "" {
		matchFilter = append(matchFilter, bson.E{Key: "creator", Value: bson.D{{Key: "$eq", Value: creatorEmail}}})
	}

	// Conditionally add the attendees filter if emails is not of length 0
	if len(attendeesEmail) > 0 {
		fmt.Println(attendeesEmail)
		// print len of attendeesEmail
		fmt.Println(len(attendeesEmail))
		matchFilter = append(matchFilter, bson.E{Key: "emails", Value: bson.D{{Key: "$in", Value: attendeesEmail}}})
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
	if len(timeRangeFilter) > 0 && len(filter.Filter) > 0 {
		matchFilter = append(matchFilter, bson.E{Key: dateFilter, Value: timeRangeFilter})
	}

	return matchFilter
}

// GroupOfficeHoursByDay function with total hours calculation
func GroupOfficeHoursByDay(email string, filter models.AnalyticsFilterStruct) bson.A {
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the date and calculate the duration
		bson.D{{Key: "$project", Value: bson.D{
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
		}}},
		// Stage 5: Group by the date and sum the durations
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$date"},
			{Key: "totalHours", Value: bson.D{
				{Key: "$sum", Value: "$duration"},
			}},
		}}},
		// Stage 6: Group to calculate the overall total and prepare the days array
		bson.D{{Key: "$group", Value: bson.D{
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
		}}},
		// Stage 7: Unwind the days array for individual results
		bson.D{{Key: "$unwind", Value: "$days"}},
		// Stage 8: Sort the results by date
		bson.D{{Key: "$sort", Value: bson.D{{Key: "days.date", Value: 1}}}},
		// Stage 9: Project the final result format
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "date", Value: "$days.date"},
			{Key: "totalHours", Value: "$days.totalHours"},
			{Key: "overallTotal", Value: "$overallTotal"},
		}}},
	}
}

func AverageOfficeHoursByWeekday(email string, filter models.AnalyticsFilterStruct) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the weekday and duration
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
			{Key: "duration", Value: bson.D{
				{Key: "$divide", Value: bson.A{
					bson.D{{Key: "$subtract", Value: bson.A{"$exited", "$entered"}}},
					1000 * 60 * 60,
				}},
			}},
		}}},
		// Stage 5: Group by the weekday and calculate the total hours and count
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$weekday"},
			{Key: "totalHours", Value: bson.D{{Key: "$sum", Value: "$duration"}}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		// Stage 6: Project the weekday name and average hours
		bson.D{{Key: "$project", Value: bson.D{
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
		}}},
		// Stage 7: Group all results together to calculate the overall totals
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "days", Value: bson.D{{Key: "$push", Value: bson.D{
				{Key: "weekday", Value: "$weekday"},
				{Key: "averageHours", Value: "$averageHours"},
			}}}},
			{Key: "overallTotal", Value: bson.D{{Key: "$sum", Value: "$totalHours"}}},
			{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: "$count"}}},
		}}},
		// Stage 8: Sort the results by weekday
		bson.D{{Key: "$sort", Value: bson.D{{Key: "days.weekday", Value: 1}}}},
		// Stage 9: Project final structure with overall average
		bson.D{{Key: "$project", Value: bson.D{
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
		}}},
	}
}

func RatioInOutOfficeByWeekday(email string, filter models.AnalyticsFilterStruct) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the weekday, entered and exited times
		bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
			{Key: "enteredHour", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
			{Key: "exitedHour", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
		}}},
		// Stage 5: Project the weekday, email, enteredHour, exitedHour and hoursInOffice
		bson.D{{Key: "$project", Value: bson.D{
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
		}}},
		// Stage 6: Group by the weekday and calculate the total hours in office and count
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$weekday"},
			{Key: "totalHoursInOffice", Value: bson.D{{Key: "$sum", Value: "$hoursInOffice"}}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		bson.D{{Key: "$addFields", Value: bson.D{
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
		}}},
		// Stage 7: Sort by weekday
		bson.D{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "days", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "weekday", Value: "$weekdayName"},
					{Key: "ratio", Value: "$ratio"},
				}},
			}},
			{Key: "overallRatio", Value: bson.D{{Key: "$avg", Value: "$ratio"}}},
			{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		// Stage 8: Sort by weekday
		bson.D{{Key: "$sort", Value: bson.D{{Key: "days.weekday", Value: 1}}}},
		// Stage 9: Project the final result format
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
			{Key: "days", Value: 1},
			{Key: "ratio", Value: "$overallRatio"},
			{Key: "overallWeekdayCount", Value: 1},
		}}},
	}
}

// BusiestHoursByWeekday function to return the 3 busiest hours per weekday
func BusiestHoursByWeekday(email string, filter models.AnalyticsFilterStruct) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the weekday, entered and exited times
		bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
			{Key: "enteredHour", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
			{Key: "exitedHour", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
		}}},
		// Stage 5: Project the weekday, enteredHour and exitedHour
		bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "hoursInOffice", Value: bson.D{
				{Key: "$map", Value: bson.D{
					{Key: "input", Value: bson.D{
						{Key: "$range", Value: bson.A{
							"$enteredHour",
							bson.D{{Key: "$add", Value: bson.A{"$exitedHour", 1}}},
						}},
					}},
					{Key: "as", Value: "hour"},
					{Key: "in", Value: "$$hour"},
				}},
			}},
		}}},
		// Stage 6: Unwind the hoursInOffice array
		bson.D{{Key: "$unwind", Value: "$hoursInOffice"}},
		// Stage 7: Group by the weekday and hour to count the occurrences
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: bson.D{
				{Key: "weekday", Value: "$weekday"},
				{Key: "hour", Value: "$hoursInOffice"},
			}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		// Stage 8: Group by the weekday to prepare the top 3 busiest hours
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$_id.weekday"},
			{Key: "hours", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "hour", Value: "$_id.hour"},
					{Key: "count", Value: "$count"},
				}},
			}},
		}}},
		// Stage 9: Add the weekday name and sort the hours by count
		bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "topHours", Value: bson.D{
				{Key: "$slice", Value: bson.A{
					bson.D{
						{Key: "$sortArray", Value: bson.D{
							{Key: "input", Value: "$hours"},
							{Key: "sortBy", Value: bson.D{{Key: "count", Value: -1}}},
						}},
					},
					3,
				}},
			}},
		}}},
		// Stage 10: Project the final result format
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
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
			{Key: "hours", Value: bson.D{
				{Key: "$map", Value: bson.D{
					{Key: "input", Value: "$topHours"},
					{Key: "as", Value: "topHour"},
					{Key: "in", Value: "$$topHour.hour"},
				}},
			}},
		}}},
		// Stage 11: Sort by weekday
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "days", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "weekday", Value: "$weekday"},
					{Key: "hours", Value: "$hours"},
				}},
			}},
			{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		// Stage 12: Project the final result format
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "days", Value: 1},
			{Key: "overallWeekdayCount", Value: 1},
		}}},
	}
}

// LeastMostInOfficeWorker function to calculate the least or most "in office" worker
func LeastMostInOfficeWorker(email string, filter models.AnalyticsFilterStruct, sort bool) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	var sortV int
	if sort {
		sortV = 1
	} else {
		sortV = -1
	}

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the weekday, entered and exited times
		bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
			{Key: "enteredHour", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
			{Key: "exitedHour", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
		}}},
		// Stage 5: Project the weekday, enteredHour, exitedHour and hoursWorked
		bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "hoursWorked", Value: bson.D{
				{Key: "$subtract", Value: bson.A{
					"$exitedHour",
					"$enteredHour",
				}},
			}},
		}}},
		// Stage 6: Group by the email and weekday to calculate the total hours and count
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: bson.D{
				{Key: "email", Value: "$email"},
				{Key: "weekday", Value: "$weekday"},
			}},
			{Key: "totalHours", Value: bson.D{{Key: "$sum", Value: "$hoursWorked"}}},
			{Key: "weekdayCount", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		// Stage 7: Group by the email to calculate the overall total hours and average hours
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$_id.email"},
			{Key: "days", Value: bson.D{
				{Key: "$push", Value: bson.D{
					{Key: "weekday", Value: bson.D{
						{Key: "$switch", Value: bson.D{
							{Key: "branches", Value: bson.A{
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 1}},
									}},
									{Key: "then", Value: "Sunday"},
								},
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 2}},
									}},
									{Key: "then", Value: "Monday"},
								},
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 3}},
									}},
									{Key: "then", Value: "Tuesday"},
								},
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 4}},
									}},
									{Key: "then", Value: "Wednesday"},
								},
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 5}},
									}},
									{Key: "then", Value: "Thursday"},
								},
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 6}},
									}},
									{Key: "then", Value: "Friday"},
								},
								bson.D{
									{Key: "case", Value: bson.D{
										{Key: "$eq", Value: bson.A{"$_id.weekday", 7}},
									}},
									{Key: "then", Value: "Saturday"},
								},
							}},
							{Key: "default", Value: "Unknown"},
						}},
					}},
					{Key: "totalHour", Value: "$totalHours"},
					{Key: "weekdayCount", Value: "$weekdayCount"},
				}},
			}},
			{Key: "totalHours", Value: bson.D{{Key: "$sum", Value: "$totalHours"}}},
			{Key: "averageHours", Value: bson.D{{Key: "$avg", Value: "$totalHours"}}},
		}}},
		// Stage 8: Sort by total hours and limit to 1 result
		bson.D{{Key: "$sort", Value: bson.D{{Key: "totalHours", Value: sortV}}}},
		bson.D{{Key: "$limit", Value: 1}},
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
			{Key: "email", Value: "$_id"},
			{Key: "days", Value: bson.D{
				{Key: "$map", Value: bson.D{
					{Key: "input", Value: "$days"},
					{Key: "as", Value: "day"},
					{Key: "in", Value: bson.D{
						{Key: "weekday", Value: "$$day.weekday"},
						{Key: "avgHour", Value: bson.D{
							{Key: "$divide", Value: bson.A{
								"$$day.totalHour",
								"$$day.weekdayCount",
							}},
						}},
						{Key: "totalHour", Value: "$$day.totalHour"},
					}},
				}},
			}},
			{Key: "averageHours", Value: "$averageHours"},
			{Key: "overallTotalHours", Value: "$totalHours"},
			{Key: "overallWeekdayCount", Value: bson.D{{Key: "$size", Value: "$days"}}},
		}}},
	}
}

// AverageArrivalAndDepartureTimesByWeekday function to calculate the average arrival and departure times for each weekday
func AverageArrivalAndDepartureTimesByWeekday(email string, filter models.AnalyticsFilterStruct) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the weekday, entered and exited times
		bson.D{{Key: "$addFields",
			Value: bson.D{
				{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
				{Key: "enteredHour", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
				{Key: "enteredMinute", Value: bson.D{{Key: "$minute", Value: "$entered"}}},
				{Key: "exitedHour", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
				{Key: "exitedMinute", Value: bson.D{{Key: "$minute", Value: "$exited"}}},
			},
		}},
		// Stage 5: Group by the weekday and calculate the average arrival and departure times
		bson.D{{Key: "$group",
			Value: bson.D{
				{Key: "_id", Value: "$weekday"},
				{Key: "avgArrivalHour", Value: bson.D{{Key: "$avg", Value: "$enteredHour"}}},
				{Key: "avgArrivalMinute", Value: bson.D{{Key: "$avg", Value: "$enteredMinute"}}},
				{Key: "avgDepartureHour", Value: bson.D{{Key: "$avg", Value: "$exitedHour"}}},
				{Key: "avgDepartureMinute", Value: bson.D{{Key: "$avg", Value: "$exitedMinute"}}},
				{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
			},
		}},
		// Stage 6: Project the final result format
		bson.D{{Key: "$project",
			Value: bson.D{
				{Key: "_id", Value: 0},
				{Key: "weekday",
					Value: bson.D{
						{Key: "$switch",
							Value: bson.D{
								{Key: "branches",
									Value: bson.A{
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 1}},
												},
											},
											{Key: "then", Value: "Sunday"},
										},
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 2}},
												},
											},
											{Key: "then", Value: "Monday"},
										},
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 3}},
												},
											},
											{Key: "then", Value: "Tuesday"},
										},
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 4}},
												},
											},
											{Key: "then", Value: "Wednesday"},
										},
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 5}},
												},
											},
											{Key: "then", Value: "Thursday"},
										},
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 6}},
												},
											},
											{Key: "then", Value: "Friday"},
										},
										bson.D{
											{Key: "case",
												Value: bson.D{
													{Key: "$eq", Value: bson.A{"$_id", 7}},
												},
											},
											{Key: "then", Value: "Saturday"},
										},
									},
								},
								{Key: "default", Value: "Unknown"},
							},
						},
					},
				},
				{Key: "avgArrival",
					Value: bson.D{
						{Key: "$concat",
							Value: bson.A{
								bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$avgArrivalHour"}}}},
								":",
								bson.D{
									{Key: "$cond",
										Value: bson.D{
											{Key: "if",
												Value: bson.D{
													{Key: "$lt", Value: bson.A{bson.D{{Key: "$floor", Value: "$avgArrivalMinute"}}, 10}},
												},
											},
											{Key: "then",
												Value: bson.D{
													{Key: "$concat", Value: bson.A{"0", bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$avgArrivalMinute"}}}}}},
												},
											},
											{Key: "else", Value: bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$avgArrivalMinute"}}}}},
										},
									},
								},
							},
						},
					},
				},
				{Key: "avgDeparture",
					Value: bson.D{
						{Key: "$concat",
							Value: bson.A{
								bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$avgDepartureHour"}}}},
								":",
								bson.D{
									{Key: "$cond",
										Value: bson.D{
											{Key: "if",
												Value: bson.D{
													{Key: "$lt", Value: bson.A{bson.D{{Key: "$floor", Value: "$avgDepartureMinute"}}, 10}},
												},
											},
											{Key: "then",
												Value: bson.D{
													{Key: "$concat", Value: bson.A{"0", bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$avgDepartureMinute"}}}}}},
												},
											},
											{Key: "else", Value: bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$avgDepartureMinute"}}}}},
										},
									},
								},
							},
						},
					},
				},
				{Key: "avgArrivalHour", Value: 1},
				{Key: "avgArrivalMinute", Value: 1},
				{Key: "avgDepartureHour", Value: 1},
				{Key: "avgDepartureMinute", Value: 1},
			},
		}},
		// Stage 7: Sort by weekday
		bson.D{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
		// Stage 8: Group all results together to calculate the overall totals
		bson.D{{Key: "$group",
			Value: bson.D{
				{Key: "_id", Value: nil},
				{Key: "days",
					Value: bson.D{
						{Key: "$push",
							Value: bson.D{
								{Key: "weekday", Value: "$weekday"},
								{Key: "avgArrival", Value: "$avgArrival"},
								{Key: "avgDeparture", Value: "$avgDeparture"},
							},
						},
					},
				},
				{Key: "overallAvgArrivalHour", Value: bson.D{{Key: "$avg", Value: "$avgArrivalHour"}}},
				{Key: "overallAvgArrivalMinute", Value: bson.D{{Key: "$avg", Value: "$avgArrivalMinute"}}},
				{Key: "overallAvgDepartureHour", Value: bson.D{{Key: "$avg", Value: "$avgDepartureHour"}}},
				{Key: "overallAvgDepartureMinute", Value: bson.D{{Key: "$avg", Value: "$avgDepartureMinute"}}},
				{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: 1}}},
			},
		}},
		// Stage 9: Project the final result format
		bson.D{{Key: "$project",
			Value: bson.D{
				{Key: "_id", Value: 0},
				{Key: "days", Value: 1},
				{Key: "overallavgArrival",
					Value: bson.D{
						{Key: "$concat",
							Value: bson.A{
								bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$overallAvgArrivalHour"}}}},
								":",
								bson.D{
									{Key: "$cond",
										Value: bson.D{
											{Key: "if",
												Value: bson.D{
													{Key: "$lt", Value: bson.A{bson.D{{Key: "$floor", Value: "$overallAvgArrivalMinute"}}, 10}},
												},
											},
											{Key: "then",
												Value: bson.D{
													{Key: "$concat", Value: bson.A{"0", bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$overallAvgArrivalMinute"}}}}}},
												},
											},
											{Key: "else", Value: bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$overallAvgArrivalMinute"}}}}},
										},
									},
								},
							},
						},
					},
				},
				{Key: "overallavgDeparture",
					Value: bson.D{
						{Key: "$concat",
							Value: bson.A{
								bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$overallAvgDepartureHour"}}}},
								":",
								bson.D{
									{Key: "$cond",
										Value: bson.D{
											{Key: "if",
												Value: bson.D{
													{Key: "$lt", Value: bson.A{bson.D{{Key: "$floor", Value: "$overallAvgDepartureMinute"}}, 10}},
												},
											},
											{Key: "then",
												Value: bson.D{
													{Key: "$concat", Value: bson.A{"0", bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$overallAvgDepartureMinute"}}}}}},
												},
											},
											{Key: "else", Value: bson.D{{Key: "$toString", Value: bson.D{{Key: "$floor", Value: "$overallAvgDepartureMinute"}}}}},
										},
									},
								},
							},
						},
					},
				},
			},
		}},
	}
}

// CalculateInOfficeRate function to calculate absenteeism rates
func CalculateInOfficeRate(email string, filter models.AnalyticsFilterStruct) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateOfficeHoursMatchFilter(email, filter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 3: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
		// Stage 4: Project the weekday, entered and exited times
		bson.D{
			{Key: "$addFields",
				Value: bson.D{
					{Key: "weekday", Value: bson.D{{Key: "$dayOfWeek", Value: "$entered"}}},
					{Key: "enteredHour", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
					{Key: "exitedHour", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
					{Key: "inOfficeStart",
						Value: bson.D{
							{Key: "$cond",
								Value: bson.D{
									{Key: "if",
										Value: bson.D{
											{Key: "$lt",
												Value: bson.A{
													bson.D{{Key: "$hour", Value: "$entered"}},
													7,
												},
											},
										},
									},
									{Key: "then", Value: 7},
									{Key: "else", Value: bson.D{{Key: "$hour", Value: "$entered"}}},
								},
							},
						},
					},
					{Key: "inOfficeEnd",
						Value: bson.D{
							{Key: "$cond",
								Value: bson.D{
									{Key: "if",
										Value: bson.D{
											{Key: "$gt",
												Value: bson.A{
													bson.D{{Key: "$hour", Value: "$exited"}},
													17,
												},
											},
										},
									},
									{Key: "then", Value: 17},
									{Key: "else", Value: bson.D{{Key: "$hour", Value: "$exited"}}},
								},
							},
						},
					},
				},
			},
		},
		// Stage 5: Filter the results to only include the hours between 7 and 17
		bson.D{
			{Key: "$match",
				Value: bson.D{
					{Key: "inOfficeEnd", Value: bson.D{{Key: "$gt", Value: 7}}},
					{Key: "inOfficeStart", Value: bson.D{{Key: "$lt", Value: 17}}},
				},
			},
		},
		// Stage 6: Calculate the total in office hours, total entries and total possible office hours
		bson.D{
			{Key: "$addFields",
				Value: bson.D{
					{Key: "inOfficeHours",
						Value: bson.D{
							{Key: "$subtract",
								Value: bson.A{
									"$inOfficeEnd",
									"$inOfficeStart",
								},
							},
						},
					},
				},
			},
		},
		// Stage 7: Group by the weekday to calculate the total in office hours, total entries and total possible office hours
		bson.D{
			{Key: "$group",
				Value: bson.D{
					{Key: "_id", Value: "$weekday"},
					{Key: "totalInOfficeHours", Value: bson.D{{Key: "$sum", Value: "$inOfficeHours"}}},
					{Key: "totalEntries", Value: bson.D{{Key: "$sum", Value: 1}}},
					{Key: "totalPossibleOfficeHours", Value: bson.D{{Key: "$sum", Value: 10}}},
				},
			},
		},
		// Stage 8: Project the final result format
		bson.D{
			{Key: "$project",
				Value: bson.D{
					{Key: "_id", Value: 0},
					{Key: "weekday",
						Value: bson.D{
							{Key: "$switch",
								Value: bson.D{
									{Key: "branches",
										Value: bson.A{
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																1,
															},
														},
													},
												},
												{Key: "then", Value: "Sunday"},
											},
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																2,
															},
														},
													},
												},
												{Key: "then", Value: "Monday"},
											},
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																3,
															},
														},
													},
												},
												{Key: "then", Value: "Tuesday"},
											},
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																4,
															},
														},
													},
												},
												{Key: "then", Value: "Wednesday"},
											},
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																5,
															},
														},
													},
												},
												{Key: "then", Value: "Thursday"},
											},
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																6,
															},
														},
													},
												},
												{Key: "then", Value: "Friday"},
											},
											bson.D{
												{Key: "case",
													Value: bson.D{
														{Key: "$eq",
															Value: bson.A{
																"$_id",
																7,
															},
														},
													},
												},
												{Key: "then", Value: "Saturday"},
											},
										},
									},
									{Key: "default", Value: "Unknown"},
								},
							},
						},
					},
					{Key: "rate",
						Value: bson.D{
							{Key: "$multiply",
								Value: bson.A{
									bson.D{
										{Key: "$divide",
											Value: bson.A{
												"$totalInOfficeHours",
												"$totalPossibleOfficeHours",
											},
										},
									},
									100,
								},
							},
						},
					},
				},
			},
		},
		// Stage 9: Sort by weekday
		bson.D{{Key: "$sort", Value: bson.D{{Key: "_id", Value: 1}}}},
		// Stage 10: Group all results together to calculate the overall totals
		bson.D{
			{Key: "$group",
				Value: bson.D{
					{Key: "_id", Value: nil},
					{Key: "days",
						Value: bson.D{
							{Key: "$push",
								Value: bson.D{
									{Key: "weekday", Value: "$weekday"},
									{Key: "rate", Value: "$rate"},
								},
							},
						},
					},
					{Key: "accumulatedRate", Value: bson.D{{Key: "$sum", Value: "$rate"}}},
					{Key: "overallWeekdayCount", Value: bson.D{{Key: "$sum", Value: 1}}},
				},
			},
		},
		// Stage 11: Project the final result format
		bson.D{
			{Key: "$project",
				Value: bson.D{
					{Key: "_id", Value: 0},
					{Key: "days", Value: 1},
					{Key: "overallRate",
						Value: bson.D{
							{Key: "$divide",
								Value: bson.A{
									"$accumulatedRate",
									"$overallWeekdayCount",
								},
							},
						},
					},
					{Key: "overallWeekdayCount", Value: 1},
				},
			},
		},
	}
}

func GetTop3MostBookedRooms(creatorEmail string, attendeeEmails []string, filter models.AnalyticsFilterStruct, dateFilter string) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateBookingMatchFilter(creatorEmail, attendeeEmails, filter, dateFilter)

	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Group by the room ID to calculate the total bookings
		bson.D{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$roomId"},
			{Key: "roomId", Value: bson.D{{Key: "$first", Value: "$roomId"}}},
			{Key: "roomName", Value: bson.D{{Key: "$first", Value: "$roomName"}}},
			{Key: "floorNo", Value: bson.D{{Key: "$first", Value: "$floorNo"}}},
			{Key: "creators", Value: bson.D{{Key: "$push", Value: "$creator"}}},
			{Key: "emails", Value: bson.D{{Key: "$push", Value: "$emails"}}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		// Stage 3: Sort by count
		bson.D{{Key: "$sort", Value: bson.D{{Key: "count", Value: -1}}}},
		// Stage 4: Limit to the top 3 results
		bson.D{{Key: "$limit", Value: 3}},
	}
}

func AggregateBookings(creatorEmail string, attendeeEmails []string, filter models.AnalyticsFilterStruct, dateFilter string) bson.A {
	// Create the match filter using the reusable function
	matchFilter := CreateBookingMatchFilter(creatorEmail, attendeeEmails, filter, dateFilter)
	return bson.A{
		// Stage 1: Match filter conditions (email and time range)
		bson.D{{Key: "$match", Value: matchFilter}},
		// Stage 2: Get all bookings without grouping
		bson.D{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
			{Key: "occupiID", Value: "$occupiId"},
			{Key: "roomName", Value: "$roomName"},
			{Key: "roomId", Value: "$roomId"},
			{Key: "emails", Value: "$emails"},
			{Key: "checkedIn", Value: "$checkedIn"},
			{Key: "creators", Value: "$creator"},
			{Key: "floorNo", Value: "$floorNo"},
			{Key: "date", Value: "$date"},
			{Key: "start", Value: "$start"},
			{Key: "end", Value: "$end"},
		}}},
		// Stage 3: Sort by date
		bson.D{{Key: "$sort", Value: bson.D{{Key: "date", Value: 1}}}},
		// Stage 4: Apply skip for pagination
		bson.D{{Key: "$skip", Value: filter.Skip}},
		// Stage 5: Apply limit for pagination
		bson.D{{Key: "$limit", Value: filter.Limit}},
	}
}

func GetUsersLocationsPipeLine(limit int64, skip int64, order string, email string) bson.A {
	// Create a match filter
	matchFilter := bson.D{}

	// Conditionally add the email filter if email is not empty
	if email != "" {
		matchFilter = append(matchFilter, bson.E{Key: "email", Value: bson.D{{Key: "$eq", Value: email}}})
	}

	var sort int64
	if order == "asc" {
		sort = 1
	} else {
		sort = -1
	}

	return bson.A{
		bson.D{{Key: "$match", Value: matchFilter}},
		bson.D{{Key: "$unwind", Value: "$knownLocations"}},
		bson.D{
			{Key: "$project",
				Value: bson.D{
					{Key: "_id", Value: 0},
					{Key: "email", Value: 1},
					{Key: "city", Value: "$knownLocations.city"},
					{Key: "region", Value: "$knownLocations.region"},
					{Key: "country", Value: "$knownLocations.country"},
					{Key: "location", Value: "$knownLocations.location"},
					{Key: "ipAddress", Value: "$knownLocations.ipAddress"},
				},
			},
		},
		bson.D{{Key: "$sort", Value: bson.D{{Key: "email", Value: sort}}}},
		bson.D{{Key: "$skip", Value: skip}},
		bson.D{{Key: "$limit", Value: limit}},
	}
}
