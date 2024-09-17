import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getAverageHours } from 'WorkerStatsService';

const AverageHoursChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAverageHours({});
        setData(response.data[0].days);
        setLoading(false);
      } catch (err) {
        setError(null);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <h2 className="text-xl font-bold">Average Hours by Weekday</h2>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekday" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="averageHours" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default AverageHoursChart;