import {
    ActiveEmployeeCard,
    AverageHoursChart,
    LeastActiveEmployeeCard,
    WorkRatioChart,
    HoursDashboard,
    MostActiveEmployeeCard,
    PeakOfficeHoursChart
} from 'components/index';

const WorkerDashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Worker Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <MostActiveEmployeeCard />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <ActiveEmployeeCard />
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <LeastActiveEmployeeCard />
          </div>
          <div className="col-span-2 row-span-2 bg-white rounded-lg shadow-md p-4">
            <AverageHoursChart />
          </div>
          <div className="row-span-2 bg-white rounded-lg shadow-md p-4">
            <WorkRatioChart />
          </div>
          <div className="col-span-3 bg-white rounded-lg shadow-md p-4">
            <PeakOfficeHoursChart />
          </div>
        </div>
        <div className="bg-secondary rounded-lg shadow-md p-4">
          <HoursDashboard />
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;