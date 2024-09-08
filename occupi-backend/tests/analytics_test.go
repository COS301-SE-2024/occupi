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
		filter   models.OfficeHoursFilterStruct
		expected bson.D
	}{
		{
			name:     "empty filter with no email",
			email:    "",
			filter:   models.OfficeHoursFilterStruct{Filter: bson.M{}},
			expected: bson.D{},
		},
		{
			name:     "empty filter with email",
			email:    "test@example.com",
			filter:   models.OfficeHoursFilterStruct{Filter: bson.M{}},
			expected: bson.D{{Key: "email", Value: bson.D{{Key: "$eq", Value: "test@example.com"}}}},
		},
		{
			name:     "filter with no email",
			email:    "",
			filter:   models.OfficeHoursFilterStruct{Filter: bson.M{"timeFrom": "", "timeTo": ""}},
			expected: bson.D{},
		},
		{
			name:     "filter with no email and timeFrom",
			email:    "",
			filter:   models.OfficeHoursFilterStruct{Filter: bson.M{"timeFrom": "09:00", "timeTo": ""}},
			expected: bson.D{{Key: "entered", Value: bson.D{{Key: "$gte", Value: "09:00"}}}},
		},
		{
			name:     "filter with no email and timeTo",
			email:    "",
			filter:   models.OfficeHoursFilterStruct{Filter: bson.M{"timeFrom": "", "timeTo": "17:00"}},
			expected: bson.D{{Key: "entered", Value: bson.D{{Key: "$lte", Value: "17:00"}}}},
		},
		{
			name:     "filter with no email and timeFrom and timeTo",
			email:    "",
			filter:   models.OfficeHoursFilterStruct{Filter: bson.M{"timeFrom": "09:00", "timeTo": "17:00"}},
			expected: bson.D{{Key: "entered", Value: bson.D{{Key: "$gte", Value: "09:00"}, {Key: "$lte", Value: "17:00"}}}},
		},
		{
			name:   "filter with email and timeFrom and timeTo",
			email:  "test@example.com",
			filter: models.OfficeHoursFilterStruct{Filter: bson.M{"timeFrom": "09:00", "timeTo": "17:00"}},
			expected: bson.D{
				{Key: "email", Value: bson.D{{Key: "$eq", Value: "test@example.com"}}},
				{Key: "entered", Value: bson.D{{Key: "$gte", Value: "09:00"}, {Key: "$lte", Value: "17:00"}}},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := analytics.CreateMatchFilter(tt.email, tt.filter)
			if !equalBsonD(result, tt.expected) {
				t.Errorf("%s for CreateMatchFilter() = %v, want %v", tt.name, result, tt.expected)
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
	filter := models.OfficeHoursFilterStruct{Filter: bson.M{}}

	res := analytics.GroupOfficeHoursByDay(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("GroupOfficeHoursByDay() = %v, want greater than 0", res)
	}
}

func TestAverageOfficeHoursByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.OfficeHoursFilterStruct{Filter: bson.M{}}

	res := analytics.AverageOfficeHoursByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("AverageOfficeHoursByWeekday() = %v, want greater than 0", res)
	}
}

func TestRatioInOutOfficeByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.OfficeHoursFilterStruct{Filter: bson.M{}}

	res := analytics.RatioInOutOfficeByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("RatioInOutOfficeByWeekday() = %v, want greater than 0", res)
	}
}

func TestBusiestHoursByWeekday(t *testing.T) {
	email := "test@example.com"
	filter := models.OfficeHoursFilterStruct{Filter: bson.M{}}

	res := analytics.BusiestHoursByWeekday(email, filter)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("BusiestHoursByWeekday() = %v, want greater than 0", res)
	}
}

func TestLeastInOfficeWorker(t *testing.T) {
	email := "test@example.com"
	filter := models.OfficeHoursFilterStruct{Filter: bson.M{}}

	res := analytics.LeastMostInOfficeWorker(email, filter, true)

	// check len is greater than 0
	if len(res) == 0 {
		t.Errorf("LeastMostInOfficeWorker() = %v, want greater than 0", res)
	}
}
