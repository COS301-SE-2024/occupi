// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Card, CardHeader, CardBody, Button, Input } from '@nextui-org/react';

// interface UserHoursChartProps {
//   email: string;
// }

// interface UserHoursData {
//   date: string;
//   hours: number;
// }

// interface WorkRatioData {
//   weekday: string;
//   inOfficeHours: number;
//   outOfficeHours: number;
//   ratio: number;
// }

// interface OverallRatioData {
//   overallInHours: number;
//   overallOutHours: number;
//   overallRatio: number;
// }

// const UserHoursChart: React.FC<UserHoursChartProps> = ({ email }) => {
//   const [userData, setUserData] = useState<UserHoursData[]>([]);
//   const [workRatioData, setWorkRatioData] = useState<WorkRatioData[]>([]);
//   const [overallRatioData, setOverallRatioData] = useState<OverallRatioData | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [dateRange, setDateRange] = useState({
//     timeFrom: '',
//     timeTo: ''
//   });

//   const fetchUserHours = async () => {
//     setLoading(true);
//     setError(null);

//     const params = {
//       email,
//       timeFrom: dateRange.timeFrom || undefined,
//       timeTo: dateRange.timeTo || undefined
//     };

//     try {
//       const [hoursResponse, ratioResponse] = await Promise.all([
//         axios.get('/analytics/user-hours', { params }),
//         axios.get('/analytics/user-work-ratio', { params })
//       ]);

//       console.log('Hours API Response:', hoursResponse.data);
//       console.log('Ratio API Response:', ratioResponse.data);

//       if (hoursResponse.data && hoursResponse.data.data) {
//         const transformedHoursData = hoursResponse.data.data.map((item: any) => ({
//           date: item.date || 'N/A',
//           hours: item.overallTotal || 0
//         }));
//         setUserData(transformedHoursData);
//       } else {
//         setUserData([]);
//       }

//       if (ratioResponse.data && ratioResponse.data.data) {
//         const weekdayData = ratioResponse.data.data.slice(0, 5);
//         setWorkRatioData(weekdayData);
//         setOverallRatioData(ratioResponse.data.data[5]);
//       } else {
//         setWorkRatioData([]);
//         setOverallRatioData(null);
//       }
//     } catch (err) {
//       console.error('Error details:', err);
//       if (axios.isAxiosError(err)) {
//         if (err.response) {
//           if (err.response.status === 500) {
//             setError('An internal server error occurred. Please try again later or contact support if the problem persists.');
//           } else {
//             setError(`Failed to fetch user analytics: ${err.response.data.error?.message || err.message}`);
//           }
//         } else if (err.request) {
//           setError('No response received from the server. Please check your internet connection and try again.');
//         } else {
//           setError('An error occurred while setting up the request. Please try again.');
//         }
//       } else {
//         setError('An unknown error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (email) {
//       fetchUserHours();
//     }
//   }, [email]);

//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setDateRange({
//       ...dateRange,
//       [e.target.name]: e.target.value
//     });
//   };

//   const COLORS = ['#0088FE', '#00C49F'];

//   return (
//     <Card className="w-full max-w-5xl mx-auto">
//       <CardHeader>
//         <h2 className="text-2xl font-bold">User Hours and Work Ratio for {email}</h2>
//       </CardHeader>
//       <CardBody>
//         <div className="flex space-x-4 mb-4">
//           <Input
//             type="date"
//             name="timeFrom"
//             value={dateRange.timeFrom}
//             onChange={handleDateChange}
//             fullWidth
//           />
//           <Input
//             type="date"
//             name="timeTo"
//             value={dateRange.timeTo}
//             onChange={handleDateChange}
//             fullWidth
//           />
//           <Button color="primary" onClick={fetchUserHours}>
//             Update
//           </Button>
//         </div>
//         {loading && <p>Loading...</p>}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//             <strong className="font-bold">Error:</strong>
//             <span className="block sm:inline"> {error}</span>
//           </div>
//         )}
//         {!loading && !error && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {userData.length > 0 && (
//               <div>
//                 <h3 className="text-xl font-semibold mb-2">User Hours</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={userData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="date" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="hours" stroke="#8884d8" activeDot={{ r: 8 }} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//             {workRatioData.length > 0 && (
//               <div>
//                 <h3 className="text-xl font-semibold mb-2">Weekly Work Ratio</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={workRatioData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="weekday" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="inOfficeHours" stackId="a" fill="#8884d8" name="In Office" />
//                     <Bar dataKey="outOfficeHours" stackId="a" fill="#82ca9d" name="Out of Office" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//             {overallRatioData && (
//               <div className="md:col-span-2">
//                 <h3 className="text-xl font-semibold mb-2">Overall Work Ratio</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={[
//                         { name: 'In Office', value: overallRatioData.overallInHours },
//                         { name: 'Out of Office', value: overallRatioData.overallOutHours }
//                       ]}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {
//                         [0, 1].map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))
//                       }
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <p className="text-center mt-2">
//                   Overall Ratio: {(overallRatioData.overallRatio * 100).toFixed(2)}% In Office
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//         {!loading && !error && userData.length === 0 && workRatioData.length === 0 && (
//           <p className='text-yellow-600'>No data available for the selected date range.</p>
//         )}
//       </CardBody>
//     </Card>
//   );
// };

// export default UserHoursChart;