import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Spinner } from '@nextui-org/react';
import {
  getHours,
  getAverageHours,
  getWorkRatio,
  getPeakOfficeHours,
  getArrivalDepartureAverage,
  getInOfficeRate
} from 'WorkerStatsService'; // Assuming the previous code is in this file

const AnalyticsConsole = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    const params = {
      // timeFrom: '2024-01-01',
      // timeTo: '2024-12-31',
      // limit: 10,
      // page: 1
    };

    try {
      const hours = await getHours(params);
      console.log('Hours:', hours);

      const averageHours = await getAverageHours(params);
      console.log('Average Hours:', averageHours);

      const workRatio = await getWorkRatio(params);
      console.log('Work Ratio:', workRatio);

      const peakOfficeHours = await getPeakOfficeHours(params);
      console.log('Peak Office Hours:', peakOfficeHours);

      const arrivalDepartureAverage = await getArrivalDepartureAverage(params);
      console.log('Arrival Departure Average:', arrivalDepartureAverage);

      // const inOfficeRate = await getInOfficeRate(params);
      // console.log('In Office Rate:', inOfficeRate);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex justify-center">
        <h4 className="text-2xl font-bold">Analytics Console</h4>
      </CardHeader>
      <CardBody className="items-center">
        <p className="mb-4">Check the console for analytics data.</p>
        <Button 
          color="primary" 
          onClick={fetchAllAnalytics} 
          disabled={loading}
        >
          {loading ? (
            <Spinner color="current" size="sm" />
          ) : (
            'Refresh Analytics'
          )}
        </Button>
      </CardBody>
    </Card>
  );
};

export default AnalyticsConsole;