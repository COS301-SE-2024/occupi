import React from "react";
import TopNav from "../components/topNav/TopNav";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

const LayoutTopNav = (props: Props) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div className="w-screen h-screen overflow-x-hidden overflow-y-hidden flex">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Settings
            <span className="block text-sm text-text_col_tertiary">
              Manage your profile, appearance, and what data is shared with us
            </span>
          </div>
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      {props.children}
    </div>
  );
};

export default LayoutTopNav;
