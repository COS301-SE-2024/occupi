import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  const weeklyData = [
    { day: "Mon", hours: 8 },
    { day: "Tue", hours: 7 },
    { day: "Wed", hours: 9 },
    { day: "Thu", hours: 8 },
    { day: "Fri", hours: 6 },
  ];
  
  export default function WeeklyAttendanceChart() {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Weekly Attendance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }