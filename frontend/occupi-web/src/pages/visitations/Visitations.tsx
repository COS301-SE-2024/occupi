import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiUser {
  _id: string;
  occupiId: string;
  details?: {
    name: string;
    contactNo?: string;
  };
  email: string;
  role: string;
  departmentNo?: string;
  status?: string;
  onSite: boolean;
  position?: string;
}

interface FormattedUser extends ApiUser {
  bookings: number;
}

interface ApiResponse {
  data: ApiUser[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
}

const Visitations: React.FC = () => {
  const [users, setUsers] = useState<FormattedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>('/api/get-users');
  
      const fetchedUsers = response.data.data.map(user => ({
        ...user,
        bookings: Math.floor(Math.random() * 5), // Random number for bookings as it's not in the API
      }));
  
      setUsers(fetchedUsers);
      setTotalPages(response.data.meta.totalPages);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>OCCUPI-ID</th>
            <th>NAME</th>
            <th>ROLE</th>
            <th>DEPARTMENT</th>
            <th>EMAIL</th>
            <th>STATUS</th>
            <th>POSITION</th>
            <th>CONTACT NO</th>
            <th>BOOKINGS THIS WEEK</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.occupiId}</td>
              <td>{user.details?.name || 'N/A'}</td>
              <td>{user.role}</td>
              <td>{user.departmentNo || 'N/A'}</td>
              <td>{user.email}</td>
              <td>{user.onSite ? 'ONSITE' : (user.status || 'OFFSITE')}</td>
              <td>{user.position || 'N/A'}</td>
              <td>{user.details?.contactNo || 'N/A'}</td>
              <td>{user.bookings}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>Total Pages: {totalPages}</div>
    </div>
  );
};

export default Visitations;

//import React from 'react';
// import React, { useState } from 'react';
// import { NextUIProvider, Card, CardBody, CardHeader } from "@nextui-org/react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { FaChartLine, FaChartPie, FaUsers, FaChartBar } from 'react-icons/fa';
// import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const Visitations: React.FC = () => {
//   const weeklyOccupancyData = [
//     { day: 'Mon', occupancy: 65 },
//     { day: 'Tue', occupancy: 75 },
//     { day: 'Wed', occupancy: 85 },
//     { day: 'Thu', occupancy: 80 },
//     { day: 'Fri', occupancy: 70 },
//   ];

//   const departmentOccupancyData = [
//     { name: 'Engineering', value: 40 },
//     { name: 'Marketing', value: 25 },
//     { name: 'Sales', value: 20 },
//     { name: 'HR', value: 15 },
//   ];

//   const averageOccupancy = weeklyOccupancyData.reduce((sum, day) => sum + day.occupancy, 0) / weeklyOccupancyData.length;
//   const peakOccupancy = Math.max(...weeklyOccupancyData.map(day => day.occupancy));

//   const [graphOrder, setGraphOrder] = useState(['weekly', 'department']);

//   const onDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const items = Array.from(graphOrder);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);
//     setGraphOrder(items);
//   };

//   const renderGraph = (graph: string) => {
//     if (graph === 'weekly') {
//       return (
//         <LineChart data={weeklyOccupancyData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="day" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="occupancy" stroke="#8884d8" />
//         </LineChart>
//       );
//     } else {
//       return (
//         <PieChart>
//           <Pie
//             data={departmentOccupancyData}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//           >
//             {departmentOccupancyData.map((_entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip />
//         </PieChart>
//       );
//     }
//   };

//   return (
//     <NextUIProvider>
//       <div className="container mx-auto px-4">
//         <h1 className="text-center mt-8 text-2xl font-bold">Office Occupancy Dashboard</h1>
        
//         {/* Card Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
//           <Card>
//             <CardBody>
//               <div className="flex items-center mb-2">
//                 <FaUsers className="text-2xl mr-2 text-primary" />
//                 <h4 className="text-lg font-semibold">Average Occupancy</h4>
//               </div>
//               <p className="text-2xl font-bold text-primary">{averageOccupancy.toFixed(1)}%</p>
//             </CardBody>
//           </Card>
//           <Card>
//             <CardBody>
//               <div className="flex items-center mb-2">
//                 <FaChartBar className="text-2xl mr-2 text-success" />
//                 <h4 className="text-lg font-semibold">Peak Occupancy</h4>
//               </div>
//               <p className="text-2xl font-bold text-success">{peakOccupancy}%</p>
//             </CardBody>
//           </Card>
//         </div>

//         {/* Graph Section */}
//         <DragDropContext onDragEnd={onDragEnd}>
//           <Droppable droppableId="graphs">
//             {(provided: DroppableProvided) => (
//               <div {...provided.droppableProps} ref={provided.innerRef} className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 {graphOrder.map((graph, index) => (
//                   <Draggable key={graph} draggableId={graph} index={index}>
//                     {(provided: DraggableProvided) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         className="mb-4"
//                       >
//                         <Card>
//                           <CardHeader className="flex justify-between items-center" {...provided.dragHandleProps}>
//                             <h3 className="text-xl font-semibold">
//                               {graph === 'weekly' ? 'Weekly Occupancy Trend' : 'Department Occupancy Distribution'}
//                             </h3>
//                             {graph === 'weekly' ? <FaChartLine className="text-xl" /> : <FaChartPie className="text-xl" />}
//                           </CardHeader>
//                           <CardBody>
//                             <ResponsiveContainer width="100%" height={300}>
//                               {renderGraph(graph)}
//                             </ResponsiveContainer>
//                           </CardBody>
//                         </Card>
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </div>
//     </NextUIProvider>
//   );
// };

// export default Visitations;