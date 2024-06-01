import React from "react";
import SideNav from "../../components/sideNavComponent/SideNav";
import TopNav from "../../components/topNav/TopNav";
import TabComponent from "../../components/tabComponent/TabComponent";
import SearchBar from "../../components/searchBarComponent/SearchBar";
import DrawerComponent from "../../components/drawerComponent/DrawerComponent";
const Settings = () => {
  return (
    <div>
      {/* Top Navigation */}
      <div className="relative w-full h-7 border-b-2 border-#EBEBEB">
        {/* GraphContainer (Right side with space) */}

        {/* TabComponent (Left of Sidebar on large screens, below on small screens) */}
        <div className="fixed left-72 top- -top-8">
          <span className="flex w-[165px] h-[36px] justify-start items-center font-['Inter'] text-[24px] font-semibold leading-[14px] text-[#0a0a0a] tracking-[-0.5px] absolute top-[30px] left-[38px] text-left z-[4]">
            Settings
          </span>
          <span className="flex w-[744px] h-[36px] justify-start items-center text-[16px] font-normal leading-[14px] text-[#bfbfbf] tracking-[-0.5px] absolute top-[60px] left-[38px] text-left z-[5]">
            Manage your profile, appearance, and what data is shared with us
          </span>
        </div>
        <div className="fixed top-2 right-9">
          <SearchBar />
        </div>
        <input className="w-[430px] h-[50px] bg-transparent border-none absolute top-0 left-0 z-[3]" />

        {/* SearchBar (Top Right Corner) */}
      </div>
    </div>
  );
};

export default Settings;
