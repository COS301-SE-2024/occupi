import { OccupiLogo, CloseDrawer, OpenDrawer, Grid, Logout, Bell, ColorSwatch, Home, PieChart, SettingsIcon, UserProfileGroup } from "@assets/index";
import {SideNavBarButton} from "@components/index";

import { motion } from "framer-motion";
import { useState } from "react";

const sidenavvariants = {
  open: {
    width: "16.5vw",
  },
  closed: {
    width: "5vw",
  }
}

const sidebarcontent = [
  {
    icon: Grid,
    text: "Dashboard",
  },
  {
    icon: PieChart,
    text: "Analysis",
  },
  {
    icon: ColorSwatch,
    text: "AI model",
  },
  {
    icon: Home,
    text: "Buildings",
  },
  {
    icon: UserProfileGroup,
    text: "Teams",
  },
  {
    icon: Bell,
    text: "Notifications",
  },
  {
    icon: SettingsIcon,
    text: "Settings",
  },
  {
    icon: Logout,
    text: "Logout",
  },
]

const SideNav = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState("Dashboard");

  function setSelectedPanelF(arg: string){
      setSelectedPanel(arg);
  }

  function toggleSideNav() {
    setIsMinimized(!isMinimized);
  }

  return (
    <motion.div className="overflow-hidden border-r-[2px] border-r-gray_900 flex flex-col items-center"
      animate={isMinimized ? "closed" : "open"}
      variants={sidenavvariants}>
      <div className={"flex flex-wrap items-center h-[65px] mb-[30px] " + (isMinimized ? "w-min mt-4" : "mt-4")}>
          <div className={"w-[40px] h-[40px] " + (isMinimized ? "ml-2 mr-2" : "mr-2")}>
            <OccupiLogo />
          </div>
          {!isMinimized && (<h2 className="text-text_col h-[24px] mt-[-10px] font-semibold text-2xl mr-2">Occupi</h2>)}
          <motion.div className={"hover_buttons w-[40px] h-[40px] cursor-pointer flex justify-center items-center rounded-[8px] hover:bg-primary_alt " + (isMinimized ? "ml-2 mr-2 mt-2" : "")} 
            onClick={toggleSideNav} whileTap={{scale: 0.97}}>
              {!isMinimized && <CloseDrawer />}
              {isMinimized && <OpenDrawer />}
          </motion.div>
      </div>

      {sidebarcontent.map((button_content) =>
        <SideNavBarButton 
        icon={button_content.icon} 
        text={button_content.text} 
        isMinimized={isMinimized} 
        selected_panel={selectedPanel} 
        setSelectedPanelF={setSelectedPanelF} />
      )}

    </motion.div>
  );
};
export default SideNav;
