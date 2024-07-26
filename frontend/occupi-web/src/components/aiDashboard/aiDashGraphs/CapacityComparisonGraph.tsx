import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

interface CapacityComparisonGraphProps {
  data: { day: string; predicted: number; actual: number }[];
}

const CapacityComparisonGraph: React.FC<CapacityComparisonGraphProps> = ({ data }) => {
  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4">AI Predicted vs Actual Capacity</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
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