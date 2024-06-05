import React from 'react';
import SideNav from "../components/sideNavComponent/SideNav";

type Props = {
  children: React.ReactNode
}

const Layout = (props: Props) => {
  return (
      <div className="w-screen h-screen overflow-x-hidden overflow-y-hidden flex">
        <SideNav />
        {props.children}
      </div>
  );
};

export default Layout;