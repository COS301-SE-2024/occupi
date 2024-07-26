import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';


const capacityComparisonData = [
  { day: 'Mon', predicted: 65, actual: 70 },
  { day: 'Tue', predicted: 70, actual: 68 },
  { day: 'Wed', predicted: 80, actual: 82 },
  { day: 'Thu', predicted: 75, actual: 73 },
  { day: 'Fri', predicted: 85, actual: 88 },
];

const CapacityComparisonGraph= () => {
  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4">AI Predicted vs Actual Capacity</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={capacityComparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predicted" stroke="#8884d8" name="Predicted" />
          <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapacityComparisonGraph;