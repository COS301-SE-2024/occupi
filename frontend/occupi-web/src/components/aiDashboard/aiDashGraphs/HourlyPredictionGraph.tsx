import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from "recharts";
import axios from "axios";

// Define the interface for the hourly prediction data
interface HourlyPrediction {
  Hour: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
}

interface ResponseData {
  Date: string;
  Day_of_Week: number;
  Hourly_Predictions: HourlyPrediction[];
  Is_Weekend: boolean;
  Special_Event: boolean;
}

// Define attendance levels for each day of the week
const attendance_levels_by_day: { [key: string]: string[] } = {
  Monday: [
    "0-50",
    "50-100",
    "100-150",
    "150-200",
    "200-250",
    "250-300",
    "300+",
  ],
  Tuesday: [
    "0-300",
    "300-600",
    "600-900",
    "900-1200",
    "1200-1500",
    "1500-1800",
    "1800+",
  ],
  Wednesday: [
    "0-50",
    "50-100",
    "100-150",
    "150-200",
    "200-250",
    "250-300",
    "300+",
  ],
  Thursday: [
    "0-300",
    "300-600",
    "600-900",
    "900-1200",
    "1200-1500",
    "1500-1800",
    "1800+",
  ],
  Friday: [
    "0-50",
    "50-100",
    "100-150",
    "150-200",
    "200-250",
    "250-300",
    "300+",
  ],
  Saturday: ["0-25", "25-50", "50-75", "75-100", "100-125", "125-150", "150+"],
  Sunday: ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"],
};

// Mapping of day numbers to day names
const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const HourlyPredictionGraph: React.FC = () => {
  const [predictedData, setPredictedData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const levelColors: { [key: number]: string } = {
    1: "#4CAF50", // Green
    2: "#8BC34A", // Light Green
    3: "#CDDC39", // Yellow Green
    4: "#FFC107", // Yellow
    5: "#FF9800", // Orange
    6: "#FF5722", // Deep Orange
    7: "#F44336", // Red
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ResponseData>(
          "https://ai.occupi.tech/predict_day?date=2024-09-26&start_hour=6&end_hour=17"
        );
        setPredictedData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!predictedData) {
    return <div>No data available</div>;
  }

  // Get the correct day of the week and corresponding attendance levels
  const dayOfWeek = dayNames[predictedData.Day_of_Week]; // Get day name
  const attendanceLevels = attendance_levels_by_day[dayOfWeek] || [];

  // Format the data for the BarChart (map hourly predictions to required format)
  const formattedData = predictedData.Hourly_Predictions.map((prediction) => ({
    hour: `${prediction.Hour}:00`, // Label the hour with a string
    level: prediction.Predicted_Class, // Class number for the y-axis
  }));

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4">
        Hourly Predicted Capacity Levels for {dayOfWeek}
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 25, left: 15, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            label={{ value: "Hour", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            dataKey="level"
            label={{
              value: "Level", // Text for the label
              angle: -90, // Rotate the label to be vertical
              position: "insideLeft", // Position inside and to the left of the Y-axis
              offset: 10, // Adjust the label closer/further from the axis
              style: { textAnchor: "middle" }, // Align the label in the middle
            }}
            domain={[0, attendanceLevels.length]} // Set Y axis range based on attendance levels
            ticks={Array.from({ length: attendanceLevels.length }, (_, i) => i)} // Dynamically set ticks for levels
            tickFormatter={(tick) => tick} // Display the level numbers instead of attendance ranges
          />
          <Tooltip />
          <Bar dataKey="level" fill="#8884d8">
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={levelColors[entry.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-4">
        {attendanceLevels.map((range, index) => (
          <div key={index} className="flex items-center mx-2">
            <div
              className="w-4 h-4 mr-1"
              style={{
                backgroundColor: levelColors[index + 1],
                borderRadius: "50%", // Turn the div into a circle
                width: "16px", // Control circle size (width)
                height: "16px", // Control circle size (height)
              }}></div>
            <span className="text-xs">{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyPredictionGraph;
