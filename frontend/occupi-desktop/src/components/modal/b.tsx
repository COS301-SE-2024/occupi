import { useEffect, useState } from 'react';
import * as userStatsService from 'userStatsService';

const UserStatsComponent = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params = {
        email: email,
        timeFrom: '2024-01-01T00:00:00.000Z',
        timeTo: '2024-09-11T00:00:00.000Z',
      };

      try {
        const userHours = await userStatsService.getUserHours(params);
        console.log('User Hours:', userHours);

        // const userAverageHours = await userStatsService.getUserAverageHours(params);
        // console.log('User Average Hours:', userAverageHours);

        const userWorkRatio = await userStatsService.getUserWorkRatio(params);
        console.log('User Work Ratio:', userWorkRatio);

        const userPeakOfficeHours = await userStatsService.getUserPeakOfficeHours(params);
        console.log('User Peak Office Hours:', userPeakOfficeHours);

        const userArrivalDepartureAverage = await userStatsService.getUserArrivalDepartureAverage(params);
        console.log('User Arrival Departure Average:', userArrivalDepartureAverage);

        // const userInOfficeRate = await userStatsService.getUserInOfficeRate(params);
        // console.log('User In Office Rate:', userInOfficeRate);
      } catch (err) {
        setError('Failed to fetch user statistics');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Statistics</h1>
      <p className='text-white'>Check the console for the logged data.</p>
    </div>
  );
};

export default UserStatsComponent;