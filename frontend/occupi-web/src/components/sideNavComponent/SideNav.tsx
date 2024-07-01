import { ChevronLeft, ChevronRight,
   Grid, ColorSwatch, Home, PieChart, UserProfileGroup,OccupiLogo,Report ,Faq} from "@assets/index";
import {SideNavBarButton} from "@components/index";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const sidenavvariants = {
  open: {
    width: "300px",
  },
  closed: {
    width: "5vw",
    minWidth: "50px", // Set a minimum width when the side panel is closed

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
    icon: Report,
    text: "Reports",
  },
  // {
  //   icon: Faq,
  //   text: "Help",
  // }
]

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState(window.innerWidth < 1000);
  const [selectedPanel, setSelectedPanel] = useState("Dashboard");


  useEffect(() => {
    const handleResize = () => {
      setIsMinimized(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


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
      else if (arg === "Reports") {
        navigate('/reports');
      }
      else if (arg === "Help") {
        navigate('/faq');
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
        else if(pn.startsWith("/reports"))setSelectedPanel("Reports");
        else ;
    }

    selectPanel();
}, [location]);


  return (
   <div data-testid='sidenav'>
    <motion.div className="w-fit border-r-[2px] border-r-secondary flex flex-col items-center z-50"
      animate={isMinimized ? "closed" : "open"}
      variants={sidenavvariants}>
      <div className={"flex flex-wrap items-center h-[110px] relative z-50 w-full "
        + (isMinimized ? "justify-center" : "justify-between")}>
        <motion.div className="flex items-center h-[110px]  w-fit cursor-pointer " whileTap={{scale: 0.98}}>
        <div className="w-[40px] h-[40px] ml-2 mr-2">
            <OccupiLogo />
          </div>
          {!isMinimized && (<h2 className="text-text_col h-[24px] mt-[-10px] font-semibold text-2xl mr-2">Occupi</h2>)}
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
    </div>
  );
};
export default SideNav;
