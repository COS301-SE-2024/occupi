import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as userStatsService from "userStatsService";

const AvgArrDep = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState([]);

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
        const response = await userStatsService.getUserArrivalDepartureAverage(params);
        if (response.data && response.data.length > 0 && response.data[0].days) {
          const formattedData = response.data[0].days.map((day: { weekday: any; avgArrival: any; avgDeparture: any; }) => ({
            weekday: day.weekday,
            arrival: convertTimeToDecimal(day.avgArrival),
            departure: convertTimeToDecimal(day.avgDeparture)
          }));
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

  const convertTimeToDecimal = (time: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any]; new(): any; }; }; }) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full h-96">
      <h2 className="text-xl font-bold mb-4">Average Arrival and Departure Times</h2>
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
            label={{ value: 'Time (24-hour format)', angle: -90, position: 'insideLeft' }}
            domain={[6, 18]}
            ticks={[6, 9, 12, 15, 18]}
            tickFormatter={(value) => `${Math.floor(value)}:${(value % 1 * 60).toFixed(0).padStart(2, '0')}`}
          />
          <Tooltip
            formatter={(value) => {
              const hours = Math.floor(Number(value));
              const minutes = Math.round((Number(value) - hours) * 60);
              return `${hours}:${minutes.toString().padStart(2, '0')}`;
            }}
          />
          <Legend />
          <Bar dataKey="arrival" fill="#8884d8" name="Arrival" />
          <Bar dataKey="departure" fill="#82ca9d" name="Departure" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AvgArrDep;