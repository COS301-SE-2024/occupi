import { useEffect, useState } from "react";
import * as userStatsService from "userStatsService";
import PieChartComponent from "./PieChartComponent";
import { UserWorkRatioData, WorkRatioEntry } from './UserStatsTypes';
import { Card, CardBody, CardHeader } from "@nextui-org/react";

interface UserWorkRatioChartProps {
  email: string;
}

const UserWorkRatioChart = ({ email }: UserWorkRatioChartProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userWorkRatioData, setUserWorkRatioData] = useState<UserWorkRatioData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userWorkRatio = await userStatsService.getUserWorkRatio({ email });
        if (userWorkRatio.data && userWorkRatio.data.length > 0) {
          setUserWorkRatioData(userWorkRatio);
        } else {
          setError("No data found for user. User should make bookings.");
        }
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
  if (error) return <div className="text-red-500">{error}</div>;

    const chartData = userWorkRatioData?.data.map((entry: WorkRatioEntry) => ({
    name: `In office %`,
    value: Math.round(entry.ratio * 10)
  }));
  
  if (chartData && userWorkRatioData) {
    chartData.push({
      name: `Out of Office %`,
      value: Math.round(100 - userWorkRatioData.data[0].ratio * 10)
    });
  }

  return (
    <div className="flex">
      <h2>User In Office Rate</h2>
      {chartData && <PieChartComponent data={chartData} />}

      <Card className="md:w-1/3">
              <CardHeader>
                <h1 className="text-xl font-bold">In Office Rate Overview</h1>
              </CardHeader>
              <CardBody>
                <p className="text-text_col_secondary_alt">
                An in-office-rate typically represents the proportion of time or 
                effort that a user is in office vs Out of Office.It
                helps monitor how frequently employees work remotely versus in the office, identifying trends 
                that may necessitate shifts in policy.
                </p>
              </CardBody>
            </Card>
    </div>
  );
};

export default UserWorkRatioChart;