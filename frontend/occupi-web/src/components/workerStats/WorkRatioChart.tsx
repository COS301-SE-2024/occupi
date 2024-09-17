import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getWorkRatio } from 'WorkerStatsService';

const WorkRatioChart = () => {
  const [data, setData] = useState([]);
  const [overallRatio, setOverallRatio] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWorkRatio({});
        if (response.data && response.data.length > 0) {
          setData(response.data[0].days);
          setOverallRatio(response.data[0].ratio);
        } else {
          throw new Error('No data received');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch work ratio data');
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
        <h2 className="text-xl font-bold">Work Ratio by Weekday</h2>
        {overallRatio && <p className="text-sm">Overall Ratio: {overallRatio.toFixed(2)}</p>}
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="weekday" />
            <PolarRadiusAxis />
            <Radar name="Work Ratio" dataKey="ratio" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default WorkRatioChart;