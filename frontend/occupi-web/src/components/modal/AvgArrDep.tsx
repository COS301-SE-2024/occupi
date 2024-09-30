import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as userStatsService from "userStatsService";

interface DayData {
  weekday: string;
  avgArrival: string;
  avgDeparture: string;
}

interface ChartData {
  weekday: string;
  arrival: number;
  departure: number;
}

interface AvgArrDepProps {
  email: string;
}

const AvgArrDep: React.FC<AvgArrDepProps> = ({ email }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params = {
        email: email,
      };

      try {
        const response = await userStatsService.getUserArrivalDepartureAverage(params);
        if (response.data && response.data.length > 0 && response.data[0].days) {
          const formattedData: ChartData[] = response.data[0].days.map((day: DayData) => ({
            weekday: day.weekday,
            arrival: convertTimeToDecimal(day.avgArrival),
            departure: convertTimeToDecimal(day.avgDeparture)
          }));
          setChartData(formattedData);
        } else {
          setError("No data found for user. User should make bookings.");
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

  const convertTimeToDecimal = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="weekday" />
        <YAxis
          tickFormatter={(value: number) => 
            `${Math.floor(value)}:${(value % 1 * 60).toFixed(0).padStart(2, '0')}`
          }
        />
        <Tooltip
          formatter={(value: number) => {
            const hours = Math.floor(value);
            const minutes = Math.round((value - hours) * 60);
            return `${hours}:${minutes.toString().padStart(2, '0')}`;
          }}
        />
        <Legend />
        <Bar dataKey="arrival" fill="#8884d8" name="Arrival" />
        <Bar dataKey="departure" fill="#82ca9d" name="Departure" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AvgArrDep;