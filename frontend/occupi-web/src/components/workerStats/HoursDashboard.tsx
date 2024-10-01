import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Skeleton, Input } from "@nextui-org/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHours } from 'WorkerStatsService';

interface HourData {
  date: string;
  totalHours: number;
}

const HoursDashboard = () => {
  const [data, setData] = useState<HourData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHours({});
        setData(response.data as HourData[]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    if (!startDate && !endDate) return true;
    const itemDate = new Date(item.date);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return itemDate >= start && itemDate <= end;
  });

  if (loading) {
    return (
      <div className="w-[500px] h-[600px]">
        <Card key={1} className="w-full">
          <CardBody className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Skeleton key={1} className="w-full h-full rounded-lg">
                <div className="h-[600px] w-full rounded-lg bg-default-200"></div>
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <CardBody>
          <p className="text-danger">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[500px]">
      <CardHeader>
        <h2 className="text-xl font-bold">Daily Hours Worked</h2>
      </CardHeader>
      <CardBody>
        <div className="flex gap-4 mb-4">
          <Input
            type="date"
            label="Start Date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalHours" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default HoursDashboard;