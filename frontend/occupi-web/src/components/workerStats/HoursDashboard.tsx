import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Skeleton } from "@nextui-org/react";
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
    <Card className="w-full h-[400px]">
      <CardHeader>
        <h2 className="text-xl font-bold">Daily Hours Worked</h2>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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