import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Skeleton, Tooltip } from "@nextui-org/react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { getWorkRatio } from 'WorkerStatsService';
import { Info } from 'lucide-react';

interface WorkRatioData {
  days: { weekday: string; ratio: number }[];
  ratio: number;
}

const WorkRatioChart = () => {
  const [data, setData] = useState<{ weekday: string; ratio: number }[]>([]);
  const [, setOverallRatio] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getWorkRatio({});
        const responseData = response.data as WorkRatioData[];
        if (responseData && responseData.length > 0) {
          setData(responseData[0].days);
          setOverallRatio(responseData[0].ratio);
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

  if (loading) {
    return (
      <Card className="max-w-[400px] h-[300px] p-4">
        <Skeleton className="w-full h-full rounded-lg">
            <div className="h-3 w-2/5 rounded-lg bg-default-200"></div>
        </Skeleton>
      </Card>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full h-[400px]">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Work Ratio by Weekday</h2>
          <Tooltip content="This chart shows the work ratio for each day of the week. A higher ratio indicates more productive work time relative to total time tracked.">
            <Info size={20} className="text-gray-500 cursor-pointer" />
          </Tooltip>
        </div>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="weekday" />
            <PolarRadiusAxis />
            <Radar name="Work Ratio" dataKey="ratio" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <RechartsTooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default WorkRatioChart;