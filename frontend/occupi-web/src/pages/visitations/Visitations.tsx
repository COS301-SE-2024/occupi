// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// import { Visitation } from '..';

// const data = [
//   { date: "2024-08-05", day: "Sun", predicted: "300-600", isWeekend: false, specialEvent: true },
//   { date: "2024-08-06", day: "Mon", predicted: "300-600", isWeekend: false, specialEvent: false },
//   { date: "2024-08-07", day: "Tue", predicted: "300-600", isWeekend: false, specialEvent: false },
//   { date: "2024-08-08", day: "Wed", predicted: "1200-1500", isWeekend: false, specialEvent: false },
//   { date: "2024-08-09", day: "Thu", predicted: "300-600", isWeekend: false, specialEvent: false },
//   { date: "2024-08-10", day: "Fri", predicted: "0-300", isWeekend: true, specialEvent: false },
//   { date: "2024-08-11", day: "Sat", predicted: "0-300", isWeekend: true, specialEvent: false },
// ];

// // Line Chart for Attendance Predictions
// const AttendanceLineChart = () => (
//   <LineChart width={600} height={300} data={data}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis dataKey="date" />
//     <YAxis />
//     <Tooltip />
//     <Legend />
//     <Line type="monotone" dataKey="predicted" stroke="#8884d8" />
//   </LineChart>
// );

// // Bar Chart for Predicted Class Levels
// const ClassBarChart = () => (
//   <BarChart width={600} height={300} data={data}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis dataKey="date" />
//     <YAxis />
//     <Tooltip />
//     <Legend />
//     <Bar dataKey="Predicted_Class" fill="#82ca9d" />
//   </BarChart>
// );

// // Pie Chart for Special Events
// const SpecialEventPieChart = () => {
//   const eventCount = data.reduce(
//     (acc, item) => {
//       if (item.specialEvent) acc.yes++;
//       else acc.no++;
//       return acc;
//     },
//     { yes: 0, no: 0 }
//   );
  
//   const pieData = [
//     { name: 'Special Event', value: eventCount.yes },
//     { name: 'No Special Event', value: eventCount.no },
//   ];

//   return (
//     <PieChart width={400} height={400}>
//       <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={150} fill="#8884d8" label>
//         {pieData.map((entry, index) => (
//           <Cell key={`cell-${index}`} fill={index === 0 ? "#00C49F" : "#FF8042"} />
//         ))}
//       </Pie>
//       <Tooltip />
//     </PieChart>
//   );
// };

// // Bar Chart for Attendance Levels by Day of the Week
// const DayOfWeekBarChart = () => {
//   const attendanceByDay = data.reduce((acc, item) => {
//     acc[item.day] = (acc[item.day] || 0) + Number(item.predicted.split('-')[0]); // Simplified average
//     return acc;
//   }, {});
  
//   const dayOfWeekData = Object.keys(attendanceByDay).map(day => ({
//     day,
//     averageAttendance: attendanceByDay[day] / data.filter(d => d.day === day).length
//   }));

//   return (
//     <BarChart width={600} height={300} data={dayOfWeekData}>
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis dataKey="day" />
//       <YAxis />
//       <Tooltip />
//       <Legend />
//       <Bar dataKey="averageAttendance" fill="#8884d8" />
//     </BarChart>
//   );
// };

// const Visitations = () => (
//   <div>
//     <h2>Attendance Line Chart</h2>
//     <AttendanceLineChart />
//     <h2>Predicted Class Bar Chart</h2>
//     <ClassBarChart />
//     <h2>Special Event Pie Chart</h2>
//     <SpecialEventPieChart />
//     <h2>Attendance by Day of the Week Bar Chart</h2>
//     <DayOfWeekBarChart />
//   </div>
// );

// export default Visitations;


import React from 'react'

const Visitations = () => {
  return (
    <div>Visitations</div>
  )
}

export default Visitations