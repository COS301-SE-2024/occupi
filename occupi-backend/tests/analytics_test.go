package tests

import (
	"reflect"
	"testing"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/analytics"
	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"go.mongodb.org/mongo-driver/bson"
)

func TestCreateMatchFilter(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		filter   models.AnalyticsFilterStruct
		expected bson.D
	}{
		{
			name:     "empty filter with no email",
			email:    "",
			filter:   models.AnalyticsFilterStruct{Filter: bson.M{}},
			expected: bson.D{},
		},
		{
			name:     "empty filter with email",
			email:    "test@example.com",
			filter:   models.AnalyticsFilterStruct{Filter: bson.M{}},
			expected: bson.D{{Key: "email", Value: bson.D{{Key: "$eq", Value: "test@example.com"}}}},
		},
		{
			name:     "filter with no email",
			email:    "",
			filter:   models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "", "timeTo": ""}},
			expected: bson.D{},
		},
		{
			name:     "filter with no email and timeFrom",
			email:    "",
			filter:   models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "09:00", "timeTo": ""}},
			expected: bson.D{{Key: "entered", Value: bson.D{{Key: "$gte", Value: "09:00"}}}},
		},
		{
			name:     "filter with no email and timeTo",
			email:    "",
			filter:   models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "", "timeTo": "17:00"}},
			expected: bson.D{{Key: "entered", Value: bson.D{{Key: "$lte", Value: "17:00"}}}},
		},
		{
			name:     "filter with no email and timeFrom and timeTo",
			email:    "",
			filter:   models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "09:00", "timeTo": "17:00"}},
			expected: bson.D{{Key: "entered", Value: bson.D{{Key: "$gte", Value: "09:00"}, {Key: "$lte", Value: "17:00"}}}},
		},
		{
			name:   "filter with email and timeFrom and timeTo",
			email:  "test@example.com",
			filter: models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "09:00", "timeTo": "17:00"}},
			expected: bson.D{
				{Key: "email", Value: bson.D{{Key: "$eq", Value: "test@example.com"}}},
				{Key: "entered", Value: bson.D{{Key: "$gte", Value: "09:00"}, {Key: "$lte", Value: "17:00"}}},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := analytics.CreateOfficeHoursMatchFilter(tt.email, tt.filter)
			if !equalBsonD(result, tt.expected) {
				t.Errorf("%s for CreateOfficeHoursMatchFilter() = %v, want %v", tt.name, result, tt.expected)
			}
		})
	}
}

// Helper function to compare bson.D objects
func equalBsonD(a, b bson.D) bool {
	return len(a) == len(b) && reflect.DeepEqual(a, b)
}

func TestGroupOfficeHoursByDay(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.GroupOfficeHoursByDay(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GroupOfficeHoursByDay() = %v, want greater than 0", res)
	}
}

func TestAverageOfficeHoursByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.AverageOfficeHoursByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("AverageOfficeHoursByWeekday() = %v, want greater than 0", res)
	}
}

func TestRatioInOutOfficeByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.RatioInOutOfficeByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("RatioInOutOfficeByWeekday() = %v, want greater than 0", res)
	}
}

func TestBusiestHoursByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.BusiestHoursByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("BusiestHoursByWeekday() = %v, want greater than 0", res)
	}
}

func TestLeastInOfficeWorker(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.LeastMostInOfficeWorker(email, filter, true)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("LeastMostInOfficeWorker() = %v, want greater than 0", res)
	}
}

func TestMostInOfficeWorker(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.LeastMostInOfficeWorker(email, filter, false)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("LeastMostInOfficeWorker() = %v, want greater than 0", res)
	}
}

func TestAverageArrivalAndDepartureTimesByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.AverageArrivalAndDepartureTimesByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("AverageArrivalAndDepartureTimesByWeekday() = %v, want greater than 0", res)
	}
}

func TestCalculateInOfficeRate(t *testing.T) {
	email := "test@example.com"
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.CalculateInOfficeRate(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("CalculateInOfficeRate() = %v, want greater than 0", res)
	}
}

func TestCreateBookingMatchFilter(t *testing.T) {
	tests := []struct {
		name           string
		creatorEmail   string
		attendeesEmail []string
		filter         models.AnalyticsFilterStruct
		dateFilter     string
		expectedFilter bson.D
	}{
		{
			name:           "Empty filter",
			creatorEmail:   "",
			attendeesEmail: []string{},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{}},
			dateFilter:     "date",
			expectedFilter: bson.D{},
		},
		{
			name:           "Filter by creatorEmail",
			creatorEmail:   "creator@example.com",
			attendeesEmail: []string{},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{}},
			dateFilter:     "date",
			expectedFilter: bson.D{
				{Key: "creator", Value: bson.D{{Key: "$eq", Value: "creator@example.com"}}},
			},
		},
		{
			name:           "Filter by attendeesEmail",
			creatorEmail:   "",
			attendeesEmail: []string{"attendee1@example.com", "attendee2@example.com"},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{}},
			dateFilter:     "date",
			expectedFilter: bson.D{
				{Key: "emails", Value: bson.D{{Key: "$in", Value: []string{"attendee1@example.com", "attendee2@example.com"}}}},
			},
		},
		{
			name:           "Filter by time range (timeFrom and timeTo)",
			creatorEmail:   "",
			attendeesEmail: []string{},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "2023-01-01", "timeTo": "2023-01-31"}},
			dateFilter:     "date",
			expectedFilter: bson.D{
				{Key: "date", Value: bson.D{
					{Key: "$gte", Value: "2023-01-01"},
					{Key: "$lte", Value: "2023-01-31"},
				}},
			},
		},
		{
			name:           "Filter by creatorEmail, attendeesEmail, and time range",
			creatorEmail:   "creator@example.com",
			attendeesEmail: []string{"attendee1@example.com"},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "2023-01-01", "timeTo": "2023-01-31"}},
			dateFilter:     "date",
			expectedFilter: bson.D{
				{Key: "creator", Value: bson.D{{Key: "$eq", Value: "creator@example.com"}}},
				{Key: "emails", Value: bson.D{{Key: "$in", Value: []string{"attendee1@example.com"}}}},
				{Key: "date", Value: bson.D{
					{Key: "$gte", Value: "2023-01-01"},
					{Key: "$lte", Value: "2023-01-31"},
				}},
			},
		},
		{
			name:           "Filter by timeFrom only",
			creatorEmail:   "",
			attendeesEmail: []string{},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{"timeFrom": "2023-01-01", "timeTo": ""}},
			dateFilter:     "date",
			expectedFilter: bson.D{
				{Key: "date", Value: bson.D{
					{Key: "$gte", Value: "2023-01-01"},
				}},
			},
		},
		{
			name:           "Filter by timeTo only",
			creatorEmail:   "",
			attendeesEmail: []string{},
			filter:         models.AnalyticsFilterStruct{Filter: bson.M{"timeTo": "2023-01-31", "timeFrom": ""}},
			dateFilter:     "date",
			expectedFilter: bson.D{
				{Key: "date", Value: bson.D{
					{Key: "$lte", Value: "2023-01-31"},
				}},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := analytics.CreateBookingMatchFilter(tt.creatorEmail, tt.attendeesEmail, tt.filter, tt.dateFilter)
			if !reflect.DeepEqual(result, tt.expectedFilter) {
				t.Errorf("expected %v, got %v", tt.expectedFilter, result)
			}
		})
	}
}

func TestGetTop3MostBookedRooms(t *testing.T) {
	creatorEmail := "test@example.com"
	attendeeEmails := []string{"test@example.com"}
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.GetTop3MostBookedRooms(creatorEmail, attendeeEmails, filter, "date")

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GetTop3MostBookedRooms() = %v, want greater than 0", res)
	}
}

func TestAggregateBookings(t *testing.T) {
	creatorEmail := "test@example.com"
	attendeeEmails := []string{"test@example.com"}
	filter := models.AnalyticsFilterStruct{Filter: bson.M{}}

	res := analytics.AggregateBookings(creatorEmail, attendeeEmails, filter, "date")

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("AggregateBookings() = %v, want greater than 0", res)
	}
}

func TestGetUsersLocationsPipeLineAsc(t *testing.T) {
	res := analytics.GetUsersLocationsPipeLine(0, 0, "asc", "test@example.com")

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GetUsersLocationsPipeLine() = %v, want greater than 0", res)
	}
}

func TestGetUsersLocationsPipeLineDesc(t *testing.T) {
	res := analytics.GetUsersLocationsPipeLine(0, 0, "desc", "test@example.com")

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GetUsersLocationsPipeLine() = %v, want greater than 0", res)
	}
}

func TestGetBlacklistPipeLineAsc(t *testing.T) {
	res := analytics.GetBlacklistPipeLine(0, 0, "asc", "test@example.com")

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GetBlacklistPipeLine() = %v, want greater than 0", res)
	}
}

func TestGetBlacklistPipeLineDesc(t *testing.T) {
	res := analytics.GetBlacklistPipeLine(0, 0, "desc", "test@example.com")

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GetBlacklistPipeLine() = %v, want greater than 0", res)
	}
}
