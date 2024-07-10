import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  const occupancyData = [
    { name: "In Office", value: 70 },
    { name: "Remote", value: 30 },
  ];
  
  const COLORS = ["#0088FE", "#00C49F"];
  
  export default function OccupancyRatingChart() {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Occupancy Rating</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={occupancyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {occupancyData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }