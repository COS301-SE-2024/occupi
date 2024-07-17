import React, { createContext, useContext, useState } from 'react';

const NavBarContext = createContext();

export const NavBarProvider = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('');

  return (
    <NavBarContext.Provider value={{ currentTab, setCurrentTab }}>
      {children}
    </NavBarContext.Provider>
  );
};

export const useNavBar = () => useContext(NavBarContext);
