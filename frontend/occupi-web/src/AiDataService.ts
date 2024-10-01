import axios from 'axios';

const BASE_URL = 'https://ai.occupi.tech';

interface PredictionData {
  Day_of_Week: number;
  Day_of_month: number;
  Is_Weekend: boolean;
  Month: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Special_Event: number;
}

const AIDataService = {
  checkStatus: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Error checking API status:', error);
      throw error;
    }
  },

  getPredictionForToday: async (): Promise<PredictionData> => {
    try {
      const response = await axios.get<PredictionData>(`${BASE_URL}/predict`);
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s prediction:', error);
      throw error;
    }
  },

  getPredictionForWeek: async (): Promise<PredictionData[]> => {
    try {
      const response = await axios.get<PredictionData[]>(`${BASE_URL}/predict_week`);
      return response.data;
    } catch (error) {
      console.error('Error fetching week prediction:', error);
      throw error;
    }
  },

  getPredictionForDate: async (date: string): Promise<PredictionData> => {
    try {
      const response = await axios.get<PredictionData>(`${BASE_URL}/predict_date`, { params: { date } });
      return response.data;
    } catch (error) {
      console.error('Error fetching prediction for date:', error);
      throw error;
    }
  },

  getPredictionForWeekFromDate: async (date: string): Promise<PredictionData[]> => {
    try {
      const response = await axios.get<PredictionData[]>(`${BASE_URL}/predict_week_from_date`, { params: { date } });
      return response.data;
    } catch (error) {
      console.error('Error fetching week prediction from date:', error);
      throw error;
    }
  },
};

export default AIDataService;