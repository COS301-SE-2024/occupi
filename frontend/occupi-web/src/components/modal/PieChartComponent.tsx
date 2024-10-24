// components/PieChartComponent.tsx
import { PieChart, Pie, Tooltip, Cell } from "recharts";

interface PieChartComponentProps {
  data: { name: string; value: number }[];
  colors?: string[];
}

const PieChartComponent = ({ data, colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] }: PieChartComponentProps) => {
  console.log(data);
  return (
    <PieChart width={400} height={400}>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d" label>
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default PieChartComponent;
