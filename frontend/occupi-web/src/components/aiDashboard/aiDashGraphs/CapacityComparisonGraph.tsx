import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import axios from "axios";

// Define the interface for the data
interface CapacityData {
  day: string;
  predicted: number;
}
interface ResponseItem {
  Day_of_Week: number;
  Predicted_Attendance_Level: string;
  Predicted_Class: number;
}

const CapacityComparisonGraph = () => {
  const [capacityComparisonData, setCapacityComparisonData] = useState<
    CapacityData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const convertRangeToNumber = (range: string) => {
    if (!range) return 0; // Return a default value if range is undefined
    const [min, max] = range.split("-").map(Number);
    return (min + max) / 2;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ResponseItem[]>(
          "https://ai.occupi.tech/predict_week"
        );
        const formattedData = response.data.map((item: ResponseItem) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
            item.Day_of_Week
          ],
          predicted: convertRangeToNumber(item.Predicted_Attendance_Level),
          // Add additional data processing here if needed
        }));
        setCapacityComparisonData(formattedData);
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

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4">AI Predicted Capacity</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={capacityComparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8884d8"
            name="Predicted"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapacityComparisonGraph;
