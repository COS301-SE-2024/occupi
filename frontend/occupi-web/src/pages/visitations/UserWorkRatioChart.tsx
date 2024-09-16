import React, { useEffect, useState } from "react";
import * as userStatsService from "userStatsService";
import PieChartComponent from "./PieChartComponent";

interface UserWorkRatioChartProps {
  email: string;
}

const UserWorkRatioChart = ({ email }: UserWorkRatioChartProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userWorkRatioData, setUserWorkRatioData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userWorkRatio = await userStatsService.getUserWorkRatio({ email });
        setUserWorkRatioData(userWorkRatio);
      } catch (err) {
        setError("Failed to fetch user work ratio");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const chartData = userWorkRatioData?.data.map((entry: any, index: number) => ({
    name: `Entry ${index + 1}`,
    value: entry.ratio,
  }));

  return (
    <div>
      <h2>User Work Ratio</h2>
      {chartData && <PieChartComponent data={chartData} />}
    </div>
  );
};

export default UserWorkRatioChart;