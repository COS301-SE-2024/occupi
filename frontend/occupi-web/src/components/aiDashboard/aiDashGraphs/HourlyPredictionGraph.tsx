import { useEffect, useState } from "react";
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
          "https://ai.occupi.tech/predict_day"
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

  return (
    <div className="p-4 border rounded-md shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        Predictions for {predictedData.Date}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {predictedData.Hourly_Predictions.map((prediction, index) => (
          <div key={index} className="p-2 border rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Hour: {prediction.Hour}:00</span>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: levelColors[prediction.Predicted_Class] }}
              ></div>
            </div>
            <div className="text-sm">
              Predicted Attendance: {prediction.Predicted_Attendance_Level}
            </div>
            <div className="text-sm">Level: {prediction.Predicted_Class}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyPredictionGraph;
