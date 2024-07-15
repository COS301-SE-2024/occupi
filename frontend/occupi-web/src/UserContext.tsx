import React, { createContext, useState, useContext,ReactNode } from 'react';

interface UserDetails {
  // Define the structure of your user details here
  email: string;
  // Add other fields as needed
}

interface UserContextType {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const setUserDetailsWithLog = (details: UserDetails | null) => {
    console.log("Setting user details in context:", details);
    setUserDetails(details);
  };

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails:setUserDetailsWithLog }}>
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