import { ChevronDown, ChevronLeft, ChevronRight,
   Grid, Logout, Bell, ColorSwatch, Home, PieChart, SettingsIcon, UserProfileGroup,OccupiLogo } from "@assets/index";
import {SideNavBarButton} from "@components/index";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState("Dashboard");

  function setSelectedPanelF(arg: string){
      setSelectedPanel(arg);
      if (arg === "Dashboard") {
        navigate('/dashboard');
      }
      else if (arg === "Analysis") {
        navigate('/analysis');
      }
      else if (arg === "AI model") {
        navigate('/ai-model');
      }
      else if (arg === "Buildings") {
        navigate('/buildings');
      }
      else if (arg === "Teams") {
        navigate('/teams');
      }
      else if (arg === "Notifications") {
        navigate('/notifications');
      }
      else if (arg === "Settings") {
        navigate('/settings');
      }
      else if (arg === "Logout") {
        navigate('/');
        //should not navigate to anything
        //but rather should show a modal
        //to confirm logout
      }
      

  }

  function toggleSideNav() {
    setIsMinimized(!isMinimized);
  }

  useEffect(() => {
    const selectPanel = () => {
        const pn: string = location.pathname;
        if(pn.startsWith("/dashboard"))setSelectedPanel("Dashboard");
        else if(pn.startsWith("/analysis"))setSelectedPanel("Analysis");
        else if(pn.startsWith("/ai-model"))setSelectedPanel("AI model");
        else if(pn.startsWith("/buildings"))setSelectedPanel("Buildings");
        else if(pn.startsWith("/teams"))setSelectedPanel("Teams");
        else if(pn.startsWith("/notifications"))setSelectedPanel("Notifications");
        else if(pn.startsWith("/settings"))setSelectedPanel("Settings");
        else ;
    }

    selectPanel();
}, [location]);


  return (
    <motion.div className="w-fit border-r-[2px] border-r-gray_900 flex flex-col items-center z-50"
      animate={isMinimized ? "closed" : "open"}
      variants={sidenavvariants}>
      <div className={"flex flex-wrap items-center h-[110px] relative z-50 w-full "
        + (isMinimized ? "justify-center" : "justify-between")}>
        <motion.div className="flex items-center h-[110px]  w-fit cursor-pointer " whileTap={{scale: 0.98}}>
        <div className={"w-[40px] h-[40px] " + (isMinimized ? "ml-2 mr-2" : "mr-2")}>
            <OccupiLogo />
          </div>
          {!isMinimized && (<h2 className="text-text_col h-[24px] mt-[-10px] font-semibold text-2xl mr-2">Occupi</h2>)}
          {/* {!isMinimized && <ChevronDown />} */}
        </motion.div>
        {
          isMinimized ? 
            <motion.div 
              className="w-[20px] h-[40px] bg-secondary rounded-r-[10px] flex justify-center items-center cursor-pointer -right-5 absolute z-50"
              whileTap={{scale: 0.98}} onClick={toggleSideNav}>
              <ChevronRight />
            </motion.div>
            :
            <motion.div 
              className="w-[20px] h-[40px] bg-secondary rounded-l-[10px] flex justify-center items-center cursor-pointer"
              whileTap={{scale: 0.98}} onClick={toggleSideNav}>
              <ChevronLeft />
            </motion.div>
        }
      </div>

      {sidebarcontent.map((button_content, index) =>
        <SideNavBarButton 
        key={index}
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
