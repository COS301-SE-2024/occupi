// components/BarChartComponent.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface BarChartComponentProps1 {
  data: { name: string; hours: number }[];
}

const BarChartComponent = ({ data }: BarChartComponentProps1) => {
  return (
    <BarChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="hours" fill="#8884d8" />
    </BarChart>
  );
};

export default BarChartComponent;
