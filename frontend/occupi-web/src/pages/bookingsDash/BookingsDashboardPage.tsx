import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { TopNav, TabComponent, BookingsDashboard } from '@components/index';

const BookingsDashboardPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate('/bookings' + path);
  };

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/bookings') {
      handleClick('/top');
    }
  }, []);

 


  return (
    <div data-testid="bookings-dashboard" className="w-full overflow-auto">
      <TopNav
        mainComponent={<TabComponent setSelectedTab={handleClick} />}
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      <div className="flex flex-col w-auto ml-5">
        
        <BookingsDashboard></BookingsDashboard>
      </div>
      <Outlet />
    </div>
  );
};

export default BookingsDashboardPage;