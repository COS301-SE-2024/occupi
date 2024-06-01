import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNav from "./Components/sideNavComponent//SideNav";

const Layout = () => {
  return (
    <div className="fixed w-full flex">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div className="ml-60 w-full p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;