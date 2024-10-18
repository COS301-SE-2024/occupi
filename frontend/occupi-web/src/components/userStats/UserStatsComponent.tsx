import { AI_loader } from "@assets/index";
import { useEffect, useState } from "react";
import * as userStatsService from "userStatsService";
// import WorkerStatsComponent from "WorkerStatsService";

interface UserStats {
  averageHours: number;
  workRatio: number;
  averageArrival: string;
  averageDeparture: string;
}

const UserStatsComponent = ({ email }: { email: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const params = {
        email: email,
        timeFrom: "2024-01-01T00:00:00.000Z",
        timeTo: "2024-09-11T00:00:00.000Z",
      };

      try {
        const userHours = await userStatsService.getUserHours(params);
        const userWorkRatio = await userStatsService.getUserWorkRatio(params);
        const userArrivalDepartureAverage =
          await userStatsService.getUserArrivalDepartureAverage(params);

        setStats({
          averageHours: userHours.data[0].overallTotal / userHours.data.length,
          workRatio: userWorkRatio.data[0].ratio,
          averageArrival: userArrivalDepartureAverage.data[0].overallavgArrival,
          averageDeparture:
            userArrivalDepartureAverage.data[0].overallavgDeparture,
        });
      } catch (err) {
        setError("Failed to fetch user statistics");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  if (loading)
    return (
      <div className="font-bold ">
        Loading...
        <img className=" h-36 w-auto" src={AI_loader} alt="" />
      </div>
    );
  if (error) return <div className="text-text_col_red_salmon">Error: {error}</div>;

  return (
    <div className="p-4 text-text_col_secondary_alt rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Occubot User Statistics</h1>
      {stats && (
        <div className="space-y-2 text-white">
          <p className="text-text_col_secondary_alt">
            <strong>Average Daily Hours:</strong>{" "}
            {stats.averageHours.toFixed(2)} hours
          </p>
          <p className="text-text_col_secondary_alt">
            <strong>Work Ratio:</strong> {stats.workRatio.toFixed(2)}
          </p>
          <p className="text-text_col_secondary_alt">
            <strong>Average Arrival Time:</strong> {stats.averageArrival}
          </p>
          <p className="text-text_col_secondary_alt">
            <strong>Average Departure Time:</strong> {stats.averageDeparture}
          </p>
          {/* <WorkerService /> */}
        </div>
      )}
    </div>
  );
};

export default UserStatsComponent;