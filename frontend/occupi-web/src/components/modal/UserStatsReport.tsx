import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as userStatsService from 'userStatsService';
import { UserStats, DayStats } from './UserStatsTypes';

const UserStatsReport = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

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
        const [userHours, userWorkRatio, userArrivalDepartureAverage, userPeakOfficeHours] = await Promise.all([
          userStatsService.getUserHours(params),
          userStatsService.getUserWorkRatio(params),
          userStatsService.getUserArrivalDepartureAverage(params),
          userStatsService.getUserPeakOfficeHours(params),
        ]);

        setStats({
          dailyHours: userHours.data,
          workRatio: userWorkRatio.data[0],
          arrivalDeparture: userArrivalDepartureAverage.data[0],
          peakHours: userPeakOfficeHours.data[0],
        });
      } catch (err) {
        setError('Failed to fetch user statistics');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Statistics Report</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-lg font-medium">Average Daily Hours</p>
            <p className="text-2xl font-bold">{stats.workRatio.ratio.toFixed(2)} hours</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <p className="text-lg font-medium">Work Ratio</p>
            <p className="text-2xl font-bold">{stats.workRatio.ratio.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <p className="text-lg font-medium">Average Arrival Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.arrivalDeparture.overallavgArrival)}</p>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <p className="text-lg font-medium">Average Departure Time</p>
            <p className="text-2xl font-bold">{formatTime(stats.arrivalDeparture.overallavgDeparture)}</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Daily Hours</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.dailyHours}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalHours" fill="#8884d8" name="Hours Worked" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Weekly Patterns</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Work Ratio by Day</h3>
            <ul className="list-disc list-inside">
              {stats.workRatio.days.map((day: DayStats) => (
                <li key={day.weekday}>{day.weekday}: {day.ratio.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2">Peak Office Hours</h3>
            <ul className="list-disc list-inside">
              {stats.peakHours.days.map((day: DayStats) => (
                <li key={day.weekday}>{day.weekday}: {day.hours.join(', ')}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Arrival and Departure Times</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Day</th>
              <th className="border p-2">Average Arrival</th>
              <th className="border p-2">Average Departure</th>
            </tr>
          </thead>
          <tbody>
            {stats.arrivalDeparture.days.map((day: DayStats) => (
              <tr key={day.weekday}>
                <td className="border p-2">{day.weekday}</td>
                <td className="border p-2">{formatTime(day.avgArrival)}</td>
                <td className="border p-2">{formatTime(day.avgDeparture)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default UserStatsReport;