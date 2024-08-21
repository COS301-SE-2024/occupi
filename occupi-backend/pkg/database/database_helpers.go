package database

import (
	"strconv"
	"strings"

	"github.com/COS301-SE-2024/occupi/occupi-backend/pkg/models"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/umahmood/haversine"
)

func IsLocationInRange(locations []models.Location, unrecognizedLogger *ipinfo.Core) bool {
	// Return true if there are no locations
	if len(locations) == 0 {
		return true
	}

	for _, loc := range locations {
		coords1 := strings.Split(loc.Location, ",")
		lat1, _ := strconv.ParseFloat(coords1[0], 64)
		lon1, _ := strconv.ParseFloat(coords1[1], 64)

		coords2 := strings.Split(unrecognizedLogger.Location, ",")
		lat2, _ := strconv.ParseFloat(coords2[0], 64)
		lon2, _ := strconv.ParseFloat(coords2[1], 64)

		loc1 := haversine.Coord{Lat: lat1, Lon: lon1}
		loc2 := haversine.Coord{Lat: lat2, Lon: lon2}

		_, km := haversine.Distance(loc1, loc2)

		if km < 1000 {
			return true
		}
	}

	return false
}
