import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  const timeData = [
    { time: "9AM", probability: 0.7 },
    { time: "11AM", probability: 0.9 },
    { time: "1PM", probability: 0.5 },
    { time: "3PM", probability: 0.8 },
    { time: "5PM", probability: 0.6 },
  ];
  
  export default function OfficePresent() {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Probability of Office Presence</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="probability" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }