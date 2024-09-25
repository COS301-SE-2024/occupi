import axios from 'axios';

const BASE_URL = '/analytics';

interface AnalyticsParams {
  email?: string;
  timeFrom?: string;
  timeTo?: string;
  limit?: number;
  page?: number;
}

interface AnalyticsResponse<T> {
  response: string;
  data: T[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  status: number;
}

interface UserHours {
  overallTotal: number;
  date: string;
  totalHours: number;
}

interface UserWorkRatio {
  ratio: number;
  days: { weekday: string; ratio: number }[];
}

interface UserArrivalDeparture {
  overallavgArrival: string;
  overallavgDeparture: string;
  days: { weekday: string; avgArrival: string; avgDeparture: string }[];
}

interface UserPeakOfficeHours {
  days: { weekday: string; hours: string[] }[];
}

interface UserInOfficeRate {
  rate: number;
}

const fetchWithRetry = async <T>(
  url: string,
  params: AnalyticsParams,
  retries = 3,
  delay = 1000
): Promise<AnalyticsResponse<T>> => {
  try {
    const response = await axios.get<AnalyticsResponse<T>>(url, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429 && retries > 0) {
      console.warn(`Rate limit hit, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry<T>(url, params, retries - 1, delay * 2);
    }
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

const fetchAnalytics = <T>(endpoint: string, params: AnalyticsParams): Promise<AnalyticsResponse<T>> =>
  fetchWithRetry<T>(`${BASE_URL}${endpoint}`, params);

export const getUserHours = (params: AnalyticsParams) =>
  fetchAnalytics<UserHours>('/user-hours', params);

export const getUserAverageHours = (params: AnalyticsParams) =>
  fetchAnalytics<UserHours>('/user-average-hours', params);

export const getUserWorkRatio = (params: AnalyticsParams) =>
  fetchAnalytics<UserWorkRatio>('/user-work-ratio', params);

export const getUserPeakOfficeHours = (params: AnalyticsParams) =>
  fetchAnalytics<UserPeakOfficeHours>('/user-peak-office-hours', params);

export const getUserArrivalDepartureAverage = (params: AnalyticsParams) =>
  fetchAnalytics<UserArrivalDeparture>('/user-arrival-departure-average', params);

export const getUserInOfficeRate = (params: AnalyticsParams) =>
  fetchAnalytics<UserInOfficeRate>('/user-in-office-rate', params);