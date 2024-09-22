import { useState, useEffect } from 'react';
import { Card, Grid, Text, Loading } from '@nextui-org/react';
import { getMostActiveEmployee, getLeastActiveEmployee, AnalyticsParams, MostActiveEmployeeData, LeastActiveEmployeeData } from '../path-to-your-api-functions'; // update this path

const EmployeeSummaryCard = () => {
  const [mostActive, setMostActive] = useState<MostActiveEmployeeData | null>(null);
  const [leastActive, setLeastActive] = useState<LeastActiveEmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const params: AnalyticsParams = {
          limit: 1,
        };
        const [mostActiveData, leastActiveData] = await Promise.all([
          getMostActiveEmployee(params),
          getLeastActiveEmployee(params),
        ]);
        setMostActive(mostActiveData);
        setLeastActive(leastActiveData);
      } catch (err) {
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (loading) {
    return (
      <Grid.Container justify="center" alignItems="center" css={{ height: '100vh' }}>
        <Loading>Loading data...</Loading>
      </Grid.Container>
    );
  }

  if (error) {
    return (
      <Grid.Container justify="center" alignItems="center" css={{ height: '100vh' }}>
        <Text h3 color="error">
          {error}
        </Text>
      </Grid.Container>
    );
  }

  return (
    <Grid.Container gap={2} justify="center">
      {/* Most Active Employee Card */}
      <Grid xs={12} sm={6}>
        <Card>
          <Card.Header>
            <Text h3>Most Active Employee</Text>
          </Card.Header>
          <Card.Body>
            <Text>Email: {mostActive?.email}</Text>
            <Text>Average Hours: {mostActive?.averageHours}</Text>
            <Text>Total Hours: {mostActive?.overallTotalHours}</Text>
            <Text>Weekdays Active: {mostActive?.overallWeekdayCount}</Text>
            <Text h5>Hours by Day:</Text>
            <ul>
              {mostActive?.days.map((day, index) => (
                <li key={index}>
                  {day.weekday}: {day.totalHour} hours (avg {day.avgHour} hours)
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </Grid>

      {/* Least Active Employee Card */}
      <Grid xs={12} sm={6}>
        <Card>
          <Card.Header>
            <Text h3>Least Active Employee</Text>
          </Card.Header>
          <Card.Body>
            <Text>Email: {leastActive?.email}</Text>
            <Text>Average Hours: {leastActive?.averageHours}</Text>
            <Text>Total Hours: {leastActive?.overallTotalHours}</Text>
            <Text>Weekdays Active: {leastActive?.overallWeekdayCount}</Text>
            <Text h5>Hours by Day:</Text>
            <ul>
              {leastActive?.days.map((day, index) => (
                <li key={index}>
                  {day.weekday}: {day.totalHour} hours (avg {day.avgHour} hours)
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </Grid>
    </Grid.Container>
  );
};

export default EmployeeSummaryCard;
