import { useEffect, useState } from "react";
import * as userStatsService from "userStatsService";
import { BarChartComponent } from "@components/index";
import { UserHoursData, UserHoursEntry } from './UserStatsTypes';
import { Input, Button, Card, CardBody, CardHeader } from "@nextui-org/react";

interface UserHoursChartProps {
  email: string;
}

const UserHoursCharts = ({ email }: UserHoursChartProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userHoursData, setUserHoursData] = useState<UserHoursData | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filteredData, setFilteredData] = useState<UserHoursEntry[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userHours = await userStatsService.getUserHours({ email });
        if (userHours.data && userHours.data.length > 0) {
          setUserHoursData(userHours);
          setFilteredData(userHours.data);
        } else {
          setError("No data found for user. User should make bookings.");
        }
      } catch (err) {
        setError("Failed to fetch user hours");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  const filterDataByDateRange = () => {
    if (!startDate || !endDate || !userHoursData) {
      setError("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredEntries = userHoursData.data.filter((entry: UserHoursEntry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    if (filteredEntries.length === 0) {
      setError("No data exists for the selected date range");
      setFilteredData(null);
    } else {
      setError(null);
      setFilteredData(filteredEntries);
    }
  };

  if (loading) return <div>Loading...</div>;

  const chartData = filteredData?.map((entry: UserHoursEntry) => ({
    name: new Date(entry.date).toLocaleDateString(),
    hours: entry.totalHours,
  }));

  return (
    <Card >
      <CardBody>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-end">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button color="primary" className=" text-text_col_alt bg-text_col_secondary_alt" onClick={filterDataByDateRange}>
              Apply Filter
            </Button>
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-grow">
              <CardHeader>
                <h2 className="text-xl font-bold">User Hours</h2>
              </CardHeader>
              <CardBody>
                {chartData && chartData.length > 0 ? (
                  <BarChartComponent data={chartData} />
                ) : (
                  <p className="text-red-500">No data to display for the selected range</p>
                )}
              </CardBody>
            </Card>

            <Card className="md:w-1/3">
              <CardHeader>
                <h1 className="text-xl font-bold">User Hours Overview</h1>
              </CardHeader>
              <CardBody>
                <p className="text-text_col_secondary_alt">
                  This chart visualizes the total hours spent by the user over the selected date range. 
                  It helps track activity patterns and workload distribution, making it easy to analyze 
                  productivity trends and identify peak activity periods.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserHoursCharts;