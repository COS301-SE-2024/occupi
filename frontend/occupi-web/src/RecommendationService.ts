// RecommendationService.ts
import axios from "axios";

// Interfaces for response types
export interface Recommendation {
  Hour: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Recommendation: string;
}

export interface RecommendationsResponse {
  Best_Times: Recommendation[];
  Date: string;
  Day_of_Week: number;
}

export interface RecommendedDay {
  Date: string;
  Day_of_Week: number;
  Day_of_month: number;
  Is_Weekend: boolean;
  Month: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Special_Event: number;
}

export interface Next7DaysResponse {
  Recommendation: string;
  Recommended_Days: RecommendedDay[];
}

// In-memory cache object to store API responses
const cache: {
  todayRecommendations: RecommendationsResponse | null;
  next7DaysRecommendations: Next7DaysResponse | null;
} = {
  todayRecommendations: null,
  next7DaysRecommendations: null,
};

// Function to fetch office times for today with caching
export const fetchTodayRecommendations =
  async (): Promise<RecommendationsResponse> => {
    // Check if the data is already cached
    if (cache.todayRecommendations) {
      console.log("Fetching from cache (todayRecommendations)");
      return cache.todayRecommendations;
    }

    // If not cached, make the API call
    const response = await axios.get<RecommendationsResponse>(
      "https://ai.occupi.tech/recommend_office_times"
    );
    console.log("Fetching from API (todayRecommendations)", response.data);

    // Cache the result
    cache.todayRecommendations = response.data;

    return response.data;
  };

// Function to fetch recommendations for the next 7 days with caching
export const fetchNext7DaysRecommendations =
  async (): Promise<Next7DaysResponse> => {
    // Check if the data is already cached
    if (cache.next7DaysRecommendations) {
      console.log("Fetching from cache (next7DaysRecommendations)");
      return cache.next7DaysRecommendations;
    }

    // If not cached, make the API call
    const response = await axios.get<Next7DaysResponse>(
      "https://ai.occupi.tech/recommend"
    );
    console.log("Fetching from API (next7DaysRecommendations)", response.data);

    // Cache the result
    cache.next7DaysRecommendations = response.data;

    return response.data;
  };
