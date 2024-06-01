import React from 'react';
import SideNav from "./Components/sideNavComponent//SideNav";

type Props = {
  children: React.ReactNode
}

const Layout = (props: Props) => {
  return (
      <div className="fixed w-full flex">
        <SideNav />
        {props.children}
      </div>
  );
};

export default Layout;