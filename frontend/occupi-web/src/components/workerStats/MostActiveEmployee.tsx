import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Avatar, Button, Spinner, Progress } from "@nextui-org/react";
import { ChevronDown, ChevronUp, Clock, Calendar, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMostActiveEmployee, MostActiveEmployeeData } from 'WorkerStatsService';

const MostActiveEmployeeCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [employeeData, setEmployeeData] = useState<MostActiveEmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getMostActiveEmployee({});
        if (response.data && response.data.length > 0) {
          setEmployeeData(response.data[0]);
        } else {
          throw new Error('No data returned for least active employee');
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch employee data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (isLoading) {
    return (
      <Card className="max-w-[400px] h-[300px] flex items-center justify-center">
        <Spinner label="Loading..." color="primary" labelColor="primary" />
      </Card>
    );
  }

  if (error || !employeeData) {
    return (
      <Card className="max-w-[400px] bg-gradient-to-br from-red-400 to-pink-600">
        <CardBody>
          <p className="text-center text-white font-semibold">{error || 'No data available'}</p>
        </CardBody>
      </Card>
    );
  }

  const { email, averageHours, overallTotalHours, overallWeekdayCount, days } = employeeData;

  return (
    <Card className="max-w-[400px] bg-gradient-to-br from-orange-300 to-rose-300 text-text_col_secondary_alt">
      <CardHeader className="flex-col items-start px-4 pt-6">
        <div className="flex w-full justify-between items-center mb-4">
          <Avatar isBordered radius="full" size="lg" src="/placeholder-avatar.jpg" className="border-text_col_secondary_alt" />
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onPress={toggleExpand}
            className="text-text_col_secondary_alt"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
        <h4 className="text-large font-bold">Least Active Employee</h4>
        <h5 className="text-small opacity-80">{email}</h5>
      </CardHeader>
      <CardBody className="py-0 px-4 text-small">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-tiny opacity-80">Average Hours</span>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-bold">{averageHours.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-tiny opacity-80">Total Hours</span>
            <div className="flex items-center">
              <TrendingDown className="w-4 h-4 mr-2" />
              <span className="font-bold">{overallTotalHours}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-tiny opacity-80">Days Worked</span>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-bold">{overallWeekdayCount}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-tiny opacity-80">Activity Level</span>
            <Progress 
              size="sm" 
              radius="sm" 
              color="warning"
              classNames={{
                base: "max-w-md",
                track: "drop-shadow-md border border-default",
                indicator: "bg-gradient-to-r from-yellow-500 to-red-500",
                label: "tracking-wider font-medium text-default-600",
                value: "text-foreground/60",
              }}
              value={Math.min((averageHours / 8) * 100, 100)}
            />
          </div>
        </div>
      </CardBody>
      {isExpanded && (
        <CardBody className="py-4 px-4">
          <h6 className="text-small font-semibold mb-2">Weekly Hours Distribution</h6>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="weekday" tick={{fill: 'rgba(0,0,0,0.7)'}} />
              <YAxis tick={{fill: 'rgba(0,0,0,0.7)'}} />
              <Tooltip 
                contentStyle={{backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '4px'}}
                labelStyle={{color: 'black'}}
                itemStyle={{color: 'black'}}
              />
              <Bar dataKey="avgHour" fill="rgba(220,38,38,0.8)" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      )}
    </Card>
  );
};

export default MostActiveEmployeeCard;