import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react";
import * as userStatsService from 'userStatsService';

export default function KeyStats({ email }: { email: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    averageWeeklyHours: 0,
    mostLikelyOfficeTime: '',
    occupancyRating: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params = {
        email: 'kamogelomoeketse@gmail.com',
        timeFrom: '2024-01-01T00:00:00.000Z',
        timeTo: '2024-09-11T00:00:00.000Z',
      };

      try {
        const [userAverageHours, userPeakOfficeHours, userInOfficeRate] = await Promise.all([
          userStatsService.getUserAverageHours(params),
          userStatsService.getUserPeakOfficeHours(params),
          userStatsService.getUserInOfficeRate(params)
        ]);

        setStats({
          averageWeeklyHours: userAverageHours.data[0]?.averageHours || 0,
          mostLikelyOfficeTime: userPeakOfficeHours.data[0]?.peakHour || 'N/A',
          occupancyRating: userInOfficeRate.data[0]?.rate || 0
        });

        console.log('User Average Hours:', userAverageHours);
        console.log('User Peak Office Hours:', userPeakOfficeHours);
        console.log('User In Office Rate:', userInOfficeRate);
      } catch (err) {
        setError('Failed to fetch user statistics');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchData();
    }
  }, [email]);

  if (loading) return <Spinner label="Loading..." />;
  if (error) return <Card><CardBody >Error: {error}</CardBody></Card>;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Key Stats</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          <p>Average Weekly Hours: {stats.averageWeeklyHours.toFixed(1)}</p>
          <p>Most Likely Office Time: {stats.mostLikelyOfficeTime}</p>
          <p>Occupancy Rating: {(stats.occupancyRating * 100).toFixed(0)}%</p>
        </div>
      </CardBody>
    </Card>
  );
}