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
import { getCapacityComparisonData, CapacityData } from "CapacityService";

const CapacityComparisonGraph = () => {
  const [capacityComparisonData, setCapacityComparisonData] = useState<Pick<CapacityData, 'day' | 'predicted'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCapacityComparisonData();
        setCapacityComparisonData(data);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadData();
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