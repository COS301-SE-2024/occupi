import React from 'react';
import { Card, CardBody, Chip, Tooltip, Skeleton } from "@nextui-org/react";
import { Info } from 'lucide-react';
import { getPeakOfficeHours } from 'WorkerStatsService';

interface PeakOfficeHoursResponse {
  data: {
    days: { weekday: string; hours: number[] }[];
  }[];
}

// Define a type for the color options
type ColorOption = "default" | "success" | "warning" | "danger" | "default" | "secondary";

const PeakOfficeHoursCard = () => {
  const [data, setData] = React.useState<{ weekday: string; hours: number[] }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPeakOfficeHours({});
        const typedResponse = response as PeakOfficeHoursResponse;
        setData(typedResponse.data[0].days);
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
  if (error) return <div className="text-danger">{error}</div>;

  const sortedData = [...data].sort((a, b) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(a.weekday) - days.indexOf(b.weekday);
  });

  const getColorForHour = (hour: number): ColorOption => {
    if (hour < 9) return "default";
    if (hour < 12) return "success";
    if (hour < 15) return "warning";
    return "danger";
  };

  const colorLegend: { color: ColorOption; label: string }[] = [
    { color: "default", label: "Early Morning (12 AM - 8 AM)" },
    { color: "success", label: "Morning (9 AM - 11 AM)" },
    { color: "warning", label: "Afternoon (12 PM - 2 PM)" },
    { color: "danger", label: "Late Afternoon & Evening (3 PM - 11 PM)" },
  ];

  return (
    <Card className="max-h-[550px] w-full max-w-[800px] p-4">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Peak Office Hours</h2>
          <Tooltip content="The Top 3 busiest hours per day of this week">
            <Info className="text-default-400 cursor-pointer" />
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {sortedData.map((day) => (
            <Card key={day.weekday} className="w-full shadow-md">
              <CardBody className="p-4">
                <h3 className="text-xl font-semibold mb-3">{day.weekday}</h3>
                <div className="flex flex-wrap gap-2">
                  {day.hours.map((hour, index) => (
                    <Chip
                      key={index}
                      color={getColorForHour(hour)}
                      variant="flat"
                      className="text-sm"
                    >
                      {hour}:00
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Color Legend</h3>
          <div className="flex flex-wrap gap-2">
            {colorLegend.map(({ color, label }) => (
              <div key={color} className="flex items-center">
                <Chip color={color} className="mr-2" />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PeakOfficeHoursCard;