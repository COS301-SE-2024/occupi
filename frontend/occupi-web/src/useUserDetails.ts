// useUserDetails.ts
import { useState, useEffect } from 'react';
import AuthService from './AuthService';

export interface UserDetails {
  email: string;
  // Add other fields as needed
}

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    // Try to load user details from localStorage on initial render
    const storedUser = localStorage.getItem('userDetails');
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser));
    }
  }, []);

  const fetchAndSetUserDetails = async (email: string) => {
    try {
      const details = await AuthService.getUserDetails(email);
      setUserDetails(details);
      localStorage.setItem('userDetails', JSON.stringify(details));
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      // Handle error (e.g., show error message)
    }
  };

  const clearUserDetails = () => {
    setUserDetails(null);
    localStorage.removeItem('userDetails');
  };

  return { userDetails, fetchAndSetUserDetails, clearUserDetails };
};