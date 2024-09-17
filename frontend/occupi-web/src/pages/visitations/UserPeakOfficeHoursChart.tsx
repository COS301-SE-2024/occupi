import { AI_loader } from "@assets/index";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as userStatsService from "userStatsService";

const UserPeakOfficeHoursChart = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params = {
        email: email,
        // timeFrom: '2024-01-01T00:00:00.000Z',
        // timeTo: '2024-09-11T00:00:00.000Z',
      };

      try {
        const userPeakOfficeHours =
          await userStatsService.getUserPeakOfficeHours(params);
        if (
          userPeakOfficeHours.data &&
          userPeakOfficeHours.data.length > 0 &&
          userPeakOfficeHours.data[0].days
        ) {
          const formattedData = userPeakOfficeHours.data[0].days.map(
            (day: any) => ({
              weekday: day.weekday,
              peak1: day.hours[0],
              peak2: day.hours[1],
              peak3: day.hours[2],
            })
          );
          setChartData(formattedData);
        } else {
          setError("No data available");
        }
      } catch (err) {
        setError("Failed to fetch user statistics");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading)
    return (
      <div className="font-bold ">
        Loading...
        <img className=" h-96 w-62 ml-80" src={AI_loader} alt="" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full h-96">
      <h2 className="text-xl font-bold mb-4">User Peak Office Hours</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="weekday" />
          <YAxis
            label={{ value: "Hour of Day", angle: -90, position: "insideLeft" }}
            domain={[0, 24]}
            ticks={[0, 6, 12, 18, 24]}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="peak1" fill="#8884d8" name="Peak Hour 1" />
          <Bar dataKey="peak2" fill="#82ca9d" name="Peak Hour 2" />
          <Bar dataKey="peak3" fill="#ffc658" name="Peak Hour 3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserPeakOfficeHoursChart;