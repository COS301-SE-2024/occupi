import axios from 'axios';
import { useEffect } from 'react';


const columns = [
  {name: "OCCUPI-ID", uid: "id", sortable: true},
  {name: "NAME", uid: "name", sortable: true},
  // {name: "AGE", uid: "age", sortable: true},
  {name: "ROLE", uid: "role", sortable: true},
  {name: "DEPARTMENT", uid: "team"},
  {name: "EMAIL", uid: "email"},
  {name: "STATUS", uid: "status", sortable: true},
  {name: "ACTIONS", uid: "actions"},
  {name:"BOOKINGS THIS WEEK", uid:"bookings", sortable: true},
];

const statusOptions = [
  {name: "ONSITE", uid: "ONSITE"},
  {name: "BOOKED", uid: "BOOKED"},
  {name: "OFFSITE", uid: "OFFSITE"},
];


interface ApiUser {
  _id: string;
  occupiId: string;
  details?: {
    name: string;
  };
  email: string;
  position?: string;
  departmentNo?: string;
  status?: string;
  onSite: boolean;
}

interface ApiResponse {
  data: ApiUser[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
  status: number;
}

interface User {
  id: string;
  name: string;
  role: string;
  team: string;
  status: string;
  email: string;
  bookings: number;
  avatar: string;
}




let users: User[] = [];

// useEffect(() => {
//   fetchUsers();
// }, []);


const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<ApiResponse>('/api/get-users');

    const fetchedUsers = response.data.data.map(user => ({
      id: user.occupiId,
      name: user.details?.name || 'N/A',
      role: user.position || 'N/A',
      team: user.departmentNo || 'N/A',
      status: user.onSite ? 'ONSITE' : (user.status || 'OFFSITE'),
      email: user.email,
      bookings: Math.floor(Math.random() * 5),
      avatar: `https://i.pravatar.cc/150?u=${user.occupiId}`, // Generate a random avatar
    }));

    users = fetchedUsers; // Update the users array
    return fetchedUsers;
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return [];
  }
};

// Function to initialize users
const initUsers = async () => {
  users = await fetchUsers();
};

// Call initUsers when your application starts
initUsers();

export { columns, statusOptions, users, fetchUsers };














// const users = [
//   {
//     id: 1,
//     name: "Tony Reichert",
//     role: "CEO",
//     team: "Management",
//     status: "ONSITE",
//     age: "29",
//     avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
//     email: "tony.reichert@example.com",
//     bookings: 3,
//   },
//   {
//     id: 2,
//     name: "Zoey Lang",
//     role: "Tech Lead",
//     team: "Development",
//     status: "BOOKED",
//     age: "25",
//     avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
//     email: "zoey.lang@example.com",
//     bookings: 2,
//   },
//   {
//     id: 3,
//     name: "Jane Fisher",
//     role: "Sr. Dev",
//     team: "Development",
//     status: "ONSITE",
//     age: "22",
//     avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
//     email: "jane.fisher@example.com",
//     bookings: 1,
//   },
//   {
//     id: 4,
//     name: "William Howard",
//     role: "C.M.",
//     team: "Marketing",
//     status: "OFFSITE",
//     age: "28",
//     avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
//     email: "william.howard@example.com",
//     bookings: 0,
//   },
//   {
//     id: 5,
//     name: "Kristen Copper",
//     role: "S. Manager",
//     team: "Sales",
//     status: "ONSITE",
//     age: "24",
//     avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
//     email: "kristen.cooper@example.com",
//     bookings: 2,
//   },
//   {
//     id: 6,
//     name: "Brian Kim",
//     role: "P. Manager",
//     team: "Management",
//     age: "29",
//     avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
//     email: "brian.kim@example.com",
//     status: "ONSITE",
//     bookings: 3,
//   },
//   {
//     id: 7,
//     name: "Michael Hunt",
//     role: "Designer",
//     team: "Design",
//     status: "BOOKED",
//     age: "27",
//     avatar: "https://i.pravatar.cc/150?u=a042581f4e29027007d",
//     email: "michael.hunt@example.com",
//     bookings: 1,
//   },
//   {
//     id: 8,
//     name: "Samantha Brooks",
//     role: "HR Manager",
//     team: "HR",
//     status: "ONSITE",
//     age: "31",
//     avatar: "https://i.pravatar.cc/150?u=a042581f4e27027008d",
//     email: "samantha.brooks@example.com",
//     bookings: 4,
//   },
//   {
//     id: 9,
//     name: "Frank Harrison",
//     role: "F. Manager",
//     team: "Finance",
//     status: "OFFSITE",
//     age: "33",
//     avatar: "https://i.pravatar.cc/150?img=4",
//     email: "frank.harrison@example.com",
//     bookings: 0,
//   },
//   {
//     id: 10,
//     name: "Emma Adams",
//     role: "Ops Manager",
//     team: "Operations",
//     status: "ONSITE",
//     age: "35",
//     avatar: "https://i.pravatar.cc/150?img=5",
//     email: "emma.adams@example.com",
//     bookings: 2,
//   },
//   {
//     id: 11,
//     name: "Brandon Stevens",
//     role: "Jr. Dev",
//     team: "Development",
//     status: "ONSITE",
//     age: "22",
//     avatar: "https://i.pravatar.cc/150?img=8",
//     email: "brandon.stevens@example.com",
//     bookings: 1,
//   },
//   {
//     id: 12,
//     name: "Megan Richards",
//     role: "P. Manager",
//     team: "Product",
//     status: "BOOKED",
//     age: "28",
//     avatar: "https://i.pravatar.cc/150?img=10",
//     email: "megan.richards@example.com",
//     bookings: 1,
//   },
//   {
//     id: 13,
//     name: "Oliver Scott",
//     role: "S. Manager",
//     team: "Security",
//     status: "ONSITE",
//     age: "37",
//     avatar: "https://i.pravatar.cc/150?img=12",
//     email: "oliver.scott@example.com",
//     bookings: 3,
//   },
//   {
//     id: 14,
//     name: "Grace Allen",
//     role: "M. Specialist",
//     team: "Marketing",
//     status: "ONSITE",
//     age: "30",
//     avatar: "https://i.pravatar.cc/150?img=16",
//     email: "grace.allen@example.com",
//     bookings: 2,
//   },
//   {
//     id: 15,
//     name: "Noah Carter",
//     role: "IT Specialist",
//     team: "I. Technology",
//     status: "BOOKED",
//     age: "31",
//     avatar: "https://i.pravatar.cc/150?img=15",
//     email: "noah.carter@example.com",
//     bookings: 1,
//   },
//   {
//     id: 16,
//     name: "Ava Perez",
//     role: "Manager",
//     team: "Sales",
//     status: "ONSITE",
//     age: "29",
//     avatar: "https://i.pravatar.cc/150?img=20",
//     email: "ava.perez@example.com",
//     bookings: 3,
//   },
//   {
//     id: 17,
//     name: "Liam Johnson",
//     role: "Data Analyst",
//     team: "Analysis",
//     status: "ONSITE",
//     age: "28",
//     avatar: "https://i.pravatar.cc/150?img=33",
//     email: "liam.johnson@example.com",
//     bookings: 1,
//   },
//   {
//     id: 18,
//     name: "Sophia Taylor",
//     role: "QA Analyst",
//     team: "Testing",
//     status: "ONSITE",
//     age: "27",
//     avatar: "https://i.pravatar.cc/150?img=29",
//     email: "sophia.taylor@example.com",
//     bookings: 2,
//   },
//   {
//     id: 19,
//     name: "Lucas Harris",
//     role: "Administrator",
//     team: "Information Technology",
//     status: "BOOKED",
//     age: "32",
//     avatar: "https://i.pravatar.cc/150?img=50",
//     email: "lucas.harris@example.com",
//     bookings: 1,
//   },
//   {
//     id: 20,
//     name: "Mia Robinson",
//     role: "Coordinator",
//     team: "Operations",
//     status: "ONSITE",
//     age: "26",
//     avatar: "https://i.pravatar.cc/150?img=45",
//     email: "mia.robinson@example.com",
//     bookings: 3,
//   },
// ];

// export {columns, users, statusOptions};


// import React, { useEffect, useState } from 'react';
// import DataService, { User } from '../../DataService';

// // Your component

//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const fetchedUsers = await DataService.fetchUsers();
//       setUsers(fetchedUsers);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch users');
//       setLoading(false);
//     }
//   };

//   // Keep the columns and statusOptions as they are
//   const columns = [
//     {name: "OCCUPI-ID", uid: "id", sortable: true},
//     {name: "NAME", uid: "name", sortable: true},
//     {name: "ROLE", uid: "role", sortable: true},
//     {name: "DEPARTMENT", uid: "team"},
//     {name: "EMAIL", uid: "email"},
//     {name: "STATUS", uid: "status", sortable: true},
//     {name: "ACTIONS", uid: "actions"},
//     {name:"BOOKINGS THIS WEEK", uid:"bookings", sortable: true},
//   ];

//   const statusOptions = [
//     {name: "ONSITE", uid: "ONSITE"},
//     {name: "BOOKED", uid: "BOOKED"},
//     {name: "OFFSITE", uid: "OFFSITE"},
//   ];

 
// export {columns, users, statusOptions};

