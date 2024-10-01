import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define types
type OccupancyData = {
  Date: string;
  Day_of_Week: number;
  Day_of_month: number;
  Is_Weekend: boolean;
  Month: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
  Special_Event: number;
};

type Recommendation = {
  type: "warning" | "success" | "error" | "info";
  title: string;
  description: string;
};

const fetchOccupancyData = async (date: string): Promise<OccupancyData> => {
  const response = await axios.get(`https://ai.occupi.tech/predict_date?date=${date}`);
  return response.data;
};

const OccupancyRecommendationEngine: React.FC = () => {
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setIsLoading(true);
    const data: OccupancyData[] = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const formattedDate = currentDate.toISOString().split('T')[0];
      const dayData = await fetchOccupancyData(formattedDate);
      data.push(dayData);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setOccupancyData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (occupancyData.length > 0) {
      analyzeOccupancy();
    }
  }, [occupancyData]);

  const analyzeOccupancy = () => {
    const newRecommendations: Recommendation[] = [];

    const avgAttendance = occupancyData.reduce((sum, day) => {
      const [min, max] = day.Predicted_Attendance_Level.split('-').map(Number);
      return sum + (min + max) / 2;
    }, 0) / occupancyData.length;

    if (avgAttendance < 300) {
      newRecommendations.push({
        type: "warning",
        title: "Low Average Attendance",
        description: `Your average predicted attendance (${avgAttendance.toFixed(0)}) is low. Consider implementing strategies to increase office attendance or optimize space usage.`,
      });
    } else if (avgAttendance > 600) {
      newRecommendations.push({
        type: "success",
        title: "High Average Attendance",
        description: `Your average predicted attendance (${avgAttendance.toFixed(0)}) is high. Ensure that the office space can comfortably accommodate this level of occupancy.`,
      });
    }

    const attendanceTrend = parseInt(occupancyData[occupancyData.length - 1].Predicted_Attendance_Level.split('-')[1]) -
                            parseInt(occupancyData[0].Predicted_Attendance_Level.split('-')[0]);

    if (attendanceTrend > 100) {
      newRecommendations.push({
        type: "info",
        title: "Increasing Attendance Trend",
        description: "Attendance is predicted to increase over the selected period. Prepare for higher occupancy and consider adjusting resources accordingly.",
      });
    } else if (attendanceTrend < -100) {
      newRecommendations.push({
        type: "warning",
        title: "Decreasing Attendance Trend",
        description: "Attendance is predicted to decrease over the selected period. Investigate potential causes and consider strategies to encourage office attendance.",
      });
    }

    const specialEvents = occupancyData.filter(day => day.Special_Event === 1).length;
    if (specialEvents > 0) {
      newRecommendations.push({
        type: "info",
        title: "Special Events",
        description: `There are ${specialEvents} special events scheduled in the selected period. Ensure appropriate preparations are made for these events.`,
      });
    }

    // Seasonal analysis
    const seasonalPatterns = analyzeSeasonalPatterns(occupancyData);
    if (seasonalPatterns) {
      newRecommendations.push(seasonalPatterns);
    }

    setRecommendations(newRecommendations);
  };

  const analyzeSeasonalPatterns = (data: OccupancyData[]): Recommendation | null => {
    const monthlyAverages = new Array(12).fill(0).map(() => ({ sum: 0, count: 0 }));
    
    data.forEach(day => {
      const [min, max] = day.Predicted_Attendance_Level.split('-').map(Number);
      const avg = (min + max) / 2;
      monthlyAverages[day.Month - 1].sum += avg;
      monthlyAverages[day.Month - 1].count += 1;
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let highestMonth = { month: "", avg: 0 };
    let lowestMonth = { month: "", avg: Infinity };

    monthlyAverages.forEach((month, index) => {
      if (month.count > 0) {
        const avg = month.sum / month.count;
        if (avg > highestMonth.avg) {
          highestMonth = { month: monthNames[index], avg };
        }
        if (avg < lowestMonth.avg) {
          lowestMonth = { month: monthNames[index], avg };
        }
      }
    });

    if (highestMonth.avg > 0 && lowestMonth.avg < Infinity) {
      return {
        type: "info",
        title: "Seasonal Attendance Patterns",
        description: `Based on predictions, attendance is highest in ${highestMonth.month} (avg: ${highestMonth.avg.toFixed(0)}) and lowest in ${lowestMonth.month} (avg: ${lowestMonth.avg.toFixed(0)}). Plan resources and space utilization accordingly.`
      };
    }

    return null;
  };

  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "warning":
        return <FaExclamationTriangle className="text-yellow-800" />;
      case "success":
        return <FaCheckCircle className="text-green-800" />;
      case "error":
        return <FaTimesCircle className="text-red-800" />;
      case "info":
        return <FaInfoCircle className="text-blue-800" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4 text-text_col_secondary_alt">
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">
            Occupancy Prediction and Recommendations
          </h4>
        </CardHeader>
        <CardBody>
          <div className="flex space-x-4 mb-4">
            <div>
              <label className="block mb-2">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => {
                  if (date) setStartDate(date);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div>
              <label className="block mb-2">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => {
                  if (date) setEndDate(date);
                }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate())}
              />
            </div>
          </div>
          {isLoading ? (
            <p className="text-text_col">Loading predictions...</p>
          ) : (
            <>
              {recommendations.map((rec, index) => (
                <Card key={index} className={`mb-2 ${getCardColor(rec.type)}`}>
                  <CardBody className="flex items-center">
                    <div className="ml-2">
                      <div className="flex items-center gap-3">
                        {getIcon(rec.type)}
                        <h5 className="font-semibold">{rec.title}</h5>
                      </div>
                      <p className="text-text_col_alt">{rec.description}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
              {recommendations.length === 0 && (
                <p className="text-text_col_secondary_alt">
                  No specific recommendations for the selected period. Occupancy levels appear to be within normal ranges.
                </p>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// Helper function to get card color based on recommendation type
const getCardColor = (type: Recommendation["type"]): string => {
  switch (type) {
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "error":
      return "bg-red-100 text-red-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default OccupancyRecommendationEngine;