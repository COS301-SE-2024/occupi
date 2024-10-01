import axios from 'axios';

const BASE_URL = '/analytics';

interface AnalyticsParams {
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
            return fetchWithRetry(url, params, retries - 1, delay * 2); // Exponential backoff
        }
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};

// Updated fetchAnalytics to use fetchWithRetry
const fetchAnalytics = <T>(endpoint: string, params: AnalyticsParams): Promise<AnalyticsResponse<T>> =>
    fetchWithRetry<T>(`${BASE_URL}${endpoint}`, params);

export const getHours = (params: AnalyticsParams) =>
    fetchAnalytics<unknown>('/hours', params);

export const getAverageHours = (params: AnalyticsParams) =>
    fetchAnalytics<unknown>('/average-hours', params);

export const getWorkRatio = (params: AnalyticsParams) =>
    fetchAnalytics<unknown>('/work-ratio', params);

export const getPeakOfficeHours = (params: AnalyticsParams) =>
    fetchAnalytics<unknown>('/peak-office-hours', params);

export const getArrivalDepartureAverage = (params: AnalyticsParams) =>
    fetchAnalytics<unknown>('/arrival-departure-average', params);

export const getInOfficeRate = (params: AnalyticsParams) =>
    fetchAnalytics<unknown>('/in-office', params);

// New function to get the most active employee data
export const getMostActiveEmployee = (params: AnalyticsParams) =>
    fetchAnalytics<MostActiveEmployeeData>('/most-active-employee', params);

export const getLeastActiveEmployee = (params: AnalyticsParams) =>
  fetchAnalytics<LeastActiveEmployeeData>('/least-active-employee', params);

// Define the shape of the most active employee data
export interface MostActiveEmployeeData {
    email: string;
    averageHours: number;
    overallTotalHours: number;
    overallWeekdayCount: number;
    days: {
        avgHour: number;
        totalHour: number;
        weekday: string;
    }[];
}

export interface LeastActiveEmployeeData {
  email: string;
  averageHours: number;
  overallTotalHours: number;
  overallWeekdayCount: number;
  days: {
      avgHour: number;
      totalHour: number;
      weekday: string;
  }[];
}