import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserDetails {
  email: string;
  // Add other fields as needed
}

interface UserContextType {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(() => {
    // Initialize state from localStorage
    const savedDetails = localStorage.getItem('userDetails');
    return savedDetails ? JSON.parse(savedDetails) : null;
  });

  useEffect(() => {
    // Update localStorage whenever userDetails changes
    if (userDetails) {
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
    } else {
      localStorage.removeItem('userDetails');
    }
  }, [userDetails]);

  const setUserDetailsWithLog = (details: UserDetails | null) => {
    console.log("Setting user details in context:", details);
    setUserDetails(details);
  };

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails: setUserDetailsWithLog }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};