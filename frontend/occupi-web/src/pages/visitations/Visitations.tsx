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

const UserTable: React.FC = () => {
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
      const response = await axios.get<ApiResponse>('/api/filter-users');
  
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

export default UserTable;