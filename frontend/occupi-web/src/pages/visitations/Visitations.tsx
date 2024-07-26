// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';

// // interface ApiUser {
// //   _id: string;
// //   occupiId: string;
// //   details?: {
// //     name: string;
// //     contactNo?: string;
// //   };
// //   email: string;
// //   role: string;
// //   departmentNo?: string;
// //   status?: string;
// //   onSite: boolean;
// //   position?: string;
// // }

// // interface FormattedUser extends ApiUser {
// //   bookings: number;
// // }

// // interface ApiResponse {
// //   data: ApiUser[];
// //   meta: {
// //     currentPage: number;
// //     totalPages: number;
// //     totalResults: number;
// //   };
// // }

// // const UserTable: React.FC = () => {
// //   const [users, setUsers] = useState<FormattedUser[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [totalPages, setTotalPages] = useState(0);

// //   useEffect(() => {
// //     fetchUsers();
// //   }, []);

// //   const fetchUsers = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await axios.get<ApiResponse>('/api/filter-users');
  
// //       const fetchedUsers = response.data.data.map(user => ({
// //         ...user,
// //         bookings: Math.floor(Math.random() * 5), // Random number for bookings as it's not in the API
// //       }));
  
// //       setUsers(fetchedUsers);
// //       setTotalPages(response.data.meta.totalPages);
// //       setLoading(false);
// //     } catch (err) {
// //       if (axios.isAxiosError(err)) {
// //         setError(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
// //       } else {
// //         setError('An unknown error occurred');
// //       }
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) return <div>Loading...</div>;
// //   if (error) return <div>Error: {error}</div>;

// //   return (
// //     <div>
// //       <table>
// //         <thead>
// //           <tr>
// //             <th>OCCUPI-ID</th>
// //             <th>NAME</th>
// //             <th>ROLE</th>
// //             <th>DEPARTMENT</th>
// //             <th>EMAIL</th>
// //             <th>STATUS</th>
// //             <th>POSITION</th>
// //             <th>CONTACT NO</th>
// //             <th>BOOKINGS THIS WEEK</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {users.map((user) => (
// //             <tr key={user._id}>
// //               <td>{user.occupiId}</td>
// //               <td>{user.details?.name || 'N/A'}</td>
// //               <td>{user.role}</td>
// //               <td>{user.departmentNo || 'N/A'}</td>
// //               <td>{user.email}</td>
// //               <td>{user.onSite ? 'ONSITE' : (user.status || 'OFFSITE')}</td>
// //               <td>{user.position || 'N/A'}</td>
// //               <td>{user.details?.contactNo || 'N/A'}</td>
// //               <td>{user.bookings}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>
// //       <div>Total Pages: {totalPages}</div>
// //     </div>
// //   );
// // };

// //import React from 'react';
// // 


// import { useState, useEffect } from 'react';
// import { Card, Button, Input, Modal, Image, ModalBody, ModalFooter, ModalHeader, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { FaRegBuilding, FaRegUser, FaRegComments, FaFilter } from 'react-icons/fa';
// interface Room {
//   description: string;
//   floorNo: string;
//   maxOccupancy: number;
//   minOccupancy: number;
//   roomId: string;
//   roomName: string;
//   roomNo: string;
//   imageUrl?: string;
// }

// interface ApiResponse {
//   data: Room[];
//   message: string;
//   meta: {
//     currentPage: number;
//     totalPages: number;
//     totalResults: number;
//   };
//   status: number;
// }

// const Visitations: React.FC = () => {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [filterCriteria, setFilterCriteria] = useState<string>('all');

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   useEffect(() => {
//     applyFilter();
//   }, [rooms, filterCriteria]);

//   const fetchRooms = async () => {
//     try {
//       const response = await axios.get<ApiResponse>('/api/view-rooms?filter={}');
//       setRooms(response.data.data);
//     } catch (error) {
//       console.error('Error fetching rooms:', error);
//     }
//   };

//   const applyFilter = () => {
//     if (filterCriteria === 'all') {
//       setFilteredRooms(rooms);
//     } else {
//       const filtered = rooms.filter(room => room.floorNo === filterCriteria);
//       setFilteredRooms(filtered);
//     }
//   };

//   const uploadImage = async () => {
//     if (!imageFile || !selectedRoom) return;

//     const formData = new FormData();
//     formData.append('image', imageFile);
//     formData.append('roomId', selectedRoom.roomId);

//     try {
//       await axios.post('/api/upload-room-image', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       setIsUploadModalOpen(false);
//       setSelectedRoom(null);
//       setImageFile(null);
//       fetchRooms();
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-text_col text-2xl font-bold">Visitations</h2>
//         <Dropdown>
//           <DropdownTrigger>
//             <Button className='text-text_col_alt bg-secondary_alt'>
//               <FaFilter className="mr-2" />
//               Filter by Floor
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu>
//             <DropdownItem onPress={() => setFilterCriteria('all')}>All</DropdownItem>
//             <DropdownItem onPress={() => setFilterCriteria('1')}>Floor 1</DropdownItem>
//             <DropdownItem onPress={() => setFilterCriteria('2')}>Floor 2</DropdownItem>
//             <DropdownItem onPress={() => setFilterCriteria('3')}>Floor 3</DropdownItem>
//           </DropdownMenu>
//         </Dropdown>
//       </div>
//       <motion.div
//         className="space-y-4"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         {filteredRooms.map((room) => (
//           <motion.div
//             key={room.roomId}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             <Card className="w-full">
//               <div className="p-4 flex flex-col md:flex-row">
//                 <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
//                   {room.imageUrl ? (
//                     <Image
//                       src={room.imageUrl}
//                       alt={room.roomName}
//                       className="w-full h-48 object-cover rounded-lg"
//                     />
//                   ) : (
//                     <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
//                       <span className="text-gray-400">No image available</span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="w-full md:w-2/3 flex flex-col">
//                   <h4 className="text-text_col text-xl font-bold mb-2">{room.roomName}</h4>
//                   <p className="text-text_col mb-2 flex-grow">{room.description}</p>
//                   <div className="flex items-center mb-1">
//                     <FaRegBuilding className="mr-2" />
//                     <p className="text-text_col">Floor: {room.floorNo}</p>
//                   </div>
//                   <div className="flex items-center mb-1">
//                     <FaRegUser className="mr-2" />
//                     <p className="text-text_col">Capacity: {room.minOccupancy} - {room.maxOccupancy}</p>
//                   </div>
//                   <div className="flex items-center mb-4">
//                     <FaRegComments className="mr-2" />
//                     <p className="text-text_col">Room No: {room.roomNo}</p>
//                   </div>
//                   <Button
//                     className='text-text_col_alt bg-secondary_alt'
//                     onPress={() => {
//                       setSelectedRoom(room);
//                       setIsUploadModalOpen(true);
//                     }}
//                   >
//                     Upload Image
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           </motion.div>
//         ))}
//       </motion.div>

//       <Modal
//         isOpen={isUploadModalOpen}
//         onClose={() => setIsUploadModalOpen(false)}
//         motionProps={{
//           initial: { opacity: 0, scale: 0.9 },
//           animate: { opacity: 1, scale: 1 },
//           exit: { opacity: 0, scale: 0.9 },
//         }}
//         className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm"
//       >
//         <ModalHeader>
//           <h3 className="text-text_col text-lg font-bold">Upload Room Image</h3>
//         </ModalHeader>
//         <ModalBody>
//           <Input
//             type="file"
//             onChange={(e) => {
//               const files = e.target.files;
//               if (files && files.length > 0) {
//                 setImageFile(files[0]);
//               }
//             }}
//             accept="image/*"
//           />
//         </ModalBody>
//         <ModalFooter>
//           <Button color="primary" onPress={uploadImage}>Upload Image</Button>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// };

// export default Visitations;


import React from 'react'

const Visitations = () => {
  return (
    <div>Visitations</div>
  )
}

export default Visitations