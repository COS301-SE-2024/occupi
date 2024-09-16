import { useEffect, useState } from "react";
import * as userStatsService from "userStatsService";
import BarChartComponent from "./BarChartComponent";

interface UserHoursChartProps {
  email: string;
}

const UserHoursCharts = ({ email }: UserHoursChartProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userHoursData, setUserHoursData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userHours = await userStatsService.getUserHours({ email });
        setUserHoursData(userHours);
      } catch (err) {
        setError("Failed to fetch user hours");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const chartData = userHoursData?.data.map((entry: any, index: number) => ({
    name: `Day ${index + 1}`,
    hours: entry.totalHours,
  }));

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div>
        <h2>User Hours</h2>
        {chartData && <BarChartComponent data={chartData} />}
      </div>
      <div style={{ maxWidth: "300px" }}>
        <h1 className="font-bold">User Hours Overview</h1>
        <p className="text-text_col_secondary_alt">
          This chart visualizes the total hours spent by the user over a series
          of days. It helps track activity patterns and workload distribution,
          making it easy to analyze productivity trends and identify peak
          activity periods.
        </p>
      </div>
    </div>
  );
};

export default UserHoursCharts;
