import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getPeakOfficeHours } from 'WorkerStatsService';

const PeakOfficeHoursChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPeakOfficeHours({});
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
        <h2 className="text-xl font-bold">Peak Office Hours by Weekday</h2>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="weekday" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours[0]" name="1st Peak Hour" fill="#8884d8" />
            <Bar dataKey="hours[1]" name="2nd Peak Hour" fill="#82ca9d" />
            <Bar dataKey="hours[2]" name="3rd Peak Hour" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default PeakOfficeHoursChart;