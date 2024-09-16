// userStatsService.ts
import axios, { AxiosError } from 'axios';

const BASE_URL = '/analytics';

interface AnalyticsParams {
  email?: string;
  timeFrom?: string;
  timeTo?: string;
  limit?: number;
  page?: number;
}

interface AnalyticsResponse {
  response: string;
  data: any[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  status: number;
}

// Helper function to add retry logic with exponential backoff
const fetchWithRetry = async (
  url: string,
  params: AnalyticsParams,
  retries = 3,
  delay = 1000
): Promise<AnalyticsResponse> => {
  try {
    const response = await axios.get<AnalyticsResponse>(url, { params });
    return response.data;
  } catch (error: AxiosError | any) {
    if (axios.isAxiosError(error) && error.response?.status === 429 && retries > 0) {
      console.warn(`Rate limit hit, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, params, retries - 1, delay * 2); // Exponential backoff
    }
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

// Updated fetchAnalytics to use fetchWithRetry
const fetchAnalytics = (endpoint: string, params: AnalyticsParams): Promise<AnalyticsResponse> =>
  fetchWithRetry(`${BASE_URL}${endpoint}`, params);

export const getUserHours = (params: AnalyticsParams) =>
  fetchAnalytics('/user-hours', params);

export const getUserAverageHours = (params: AnalyticsParams) =>
  fetchAnalytics('/user-average-hours', params);

export const getUserWorkRatio = (params: AnalyticsParams) =>
  fetchAnalytics('/user-work-ratio', params);

export const getUserPeakOfficeHours = (params: AnalyticsParams) =>
  fetchAnalytics('/user-peak-office-hours', params);

export const getUserArrivalDepartureAverage = (params: AnalyticsParams) =>
  fetchAnalytics('/user-arrival-departure-average', params);

export const getUserInOfficeRate = (params: AnalyticsParams) =>
  fetchAnalytics('/user-in-office-rate', params);
