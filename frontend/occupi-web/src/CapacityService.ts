// src/services/capacityService.ts

import axios from "axios";

interface ResponseItem {
  Date: string;
  Day_of_Week: number;
  Day_of_month: number;
  Is_Weekend: boolean;
  Month: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Special_Event: number;
}

export interface CapacityData {
  day: string;
  predicted: number;
  date: string;
  dayOfMonth: number;
  isWeekend: boolean;
  month: number;
  predictedClass: number;
  specialEvent: boolean;
}

const API_URL = "https://ai.occupi.tech/predict_week";

const convertRangeToNumber = (range: string) => {
  if (!range) return 0;
  const [min, max] = range.split("-").map(Number);
  return (min + max) / 2;
};

const getDayName = (dayOfWeek: number): string => {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dayOfWeek];
};

export const fetchCapacityData = async (): Promise<CapacityData[]> => {
  try {
    const response = await axios.get<ResponseItem[]>(API_URL);
    return response.data.map((item: ResponseItem) => ({
      day: getDayName(item.Day_of_Week),
      predicted: convertRangeToNumber(item.Predicted_Attendance_Level),
      date: item.Date,
      dayOfMonth: item.Day_of_month,
      isWeekend: item.Is_Weekend,
      month: item.Month,
      predictedClass: item.Predicted_Class,
      specialEvent: item.Special_Event === 1,
    }));
  } catch (error) {
    console.error("Error fetching capacity data:", error);
    throw error;
  }
};

// Additional function to get only the data needed for the CapacityComparisonGraph
export const getCapacityComparisonData = async (): Promise<
  Pick<CapacityData, "day" | "predicted">[]
> => {
  const fullData = await fetchCapacityData();
  return fullData.map(({ day, predicted }) => ({ day, predicted }));
};
