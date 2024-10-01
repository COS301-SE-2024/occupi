import { useEffect, useState } from "react";
import {
  HourlyCapacityData,
  getHourlyPredictionGraphData,
} from "CapacityService";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
} from "recharts";

const HourlyComparisonGraph: React.FC = () => {
  const [hourlyData, setHourlyData] = useState<
    Pick<HourlyCapacityData, "hour" | "predicted">[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHourlyPredictionGraphData();
        setHourlyData(data);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
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
        <LineChart data={hourlyData} margin={{ top: 20, right: 25, left: 15, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottom", offset: -5 }} />
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

export default HourlyComparisonGraph;
