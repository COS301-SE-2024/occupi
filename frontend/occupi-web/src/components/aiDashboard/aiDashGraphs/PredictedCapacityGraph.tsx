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

// Define the interface for the data
interface CapacityData {
  day: string;
  level: number;
}

interface ResponseItem {
  Day_of_Week: number;
  Predicted_Class: number;
}

const PredictedCapacityGraph = () => {
  const [predictedCapacityData, setPredictedCapacityData] = useState<
    CapacityData[]
  >([]);
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

  const capacityLevels = {
    1: "0-300",
    2: "300-600",
    3: "601-900",
    4: "901-1200",
    5: "1201-1500",
    6: "1501-1800",
    7: "1800+",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ResponseItem[]>(
          "https://ai.occupi.tech/predict_week"
        );
        const formattedData = response.data.map((item) => ({
          day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
            item.Day_of_Week
          ],
          level: item.Predicted_Class + 1,
        }));
        setPredictedCapacityData(formattedData);
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
      <h3 className="text-lg font-semibold mb-4">Predicted Capacity Levels</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={predictedCapacityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} />
          <Tooltip />
          <Bar dataKey="level" fill="#8884d8">
            {predictedCapacityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={levelColors[entry.level]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-4">
        {Object.entries(capacityLevels).map(([level, range]) => (
          <div key={level} className="flex items-center mx-2">
            <div
              className="w-4 h-4 mr-1"
              style={{ backgroundColor: levelColors[Number(level)] }}></div>
            <span className="text-xs">{range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictedCapacityGraph;
