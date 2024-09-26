// components/PieChartPeakHoursComponent.tsx
import { PieChart, Pie, Tooltip, Cell } from "recharts";

interface PieChartPeakHoursComponentProps {
  data: { name: string; peak: number }[];
}

const PieChartPeakHoursComponent = ({ data }: PieChartPeakHoursComponentProps) => {
  return (
    <PieChart width={400} height={400}>
      <Pie data={data} dataKey="peak" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default PieChartPeakHoursComponent;
