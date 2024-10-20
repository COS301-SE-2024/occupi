import {
  ChevronLeft,
  ChevronRight,
  Grid,
  Home,
  PieChart,
  OccupiLogo,
  Report,
  Bar,
  Worker,
  Employee,
  Location,
} from "@assets/index";
import { ProfileDropDown, SideNavBarButton } from "@components/index";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const sidenavvariants = {
  open: {
    width: "300px",
  },
  closed: {
    width: "5vw",
    minWidth: "57px",
  },
};

const sidebarcontent = [
  {
    icon: Grid,
    text: "Dashboard",
  },
  {
    icon: Employee,
    text: "Employees",
  },
  {
    icon: Bar,
    text: "Booking Statistics",
  },
  {
    icon: Worker,
    text: "Company Statistics",
  },
  {
    icon: PieChart,
    text: "AI Analysis",
  },
  {
    icon: Home,
    text: "Rooms",
  },
  {
    icon: Location,
    text: "Location",
  },
  {
    icon: Report,
    text: "Reports",
  },
];

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState(window.innerWidth < 1000);
  const [selectedPanel, setSelectedPanel] = useState("Dashboard");

  useEffect(() => {
    const handleResize = () => {
      setIsMinimized(window.innerWidth < 1000);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function setSelectedPanelF(arg: string) {
    setSelectedPanel(arg);
    if (arg === "Dashboard") navigate("/dashboard");
    else if (arg === "AI Analysis") navigate("/ai-dashboard");
    else if (arg === "Rooms") navigate("/rooms");
    else if (arg === "Settings") navigate("/settings");
    else if (arg === "Logout") navigate("/");
    else if (arg === "Reports") navigate("/reports");
    else if (arg === "Help") navigate("/faq");
    else if (arg === "Booking Statistics") navigate("/booking-statistics/overview");
    else if (arg === "Company Statistics") navigate("/worker-dashboard");
    else if (arg === "Employees") navigate("/employees");
    else if (arg === "Location") navigate("/user-locations");
    else;
  }

  function toggleSideNav() {
    setIsMinimized(!isMinimized);
  }

  useEffect(() => {
    const selectPanel = () => {
      const pn: string = location.pathname;
      if (pn.startsWith("/dashboard")) setSelectedPanel("Dashboard");
      else if (pn.startsWith("/ai-dashboard")) setSelectedPanel("AI Analysis");
      else if (pn.startsWith("/rooms")) setSelectedPanel("Rooms");
      else if (pn.startsWith("/settings")) setSelectedPanel("Settings");
      else if (pn.startsWith("/reports")) setSelectedPanel("Reports");
      else if (pn.startsWith("/faq")) setSelectedPanel("Help");
      else if (pn.startsWith("/booking-statistics")) setSelectedPanel("Booking Statistics");
      else if (pn.startsWith("/worker-dashboard")) setSelectedPanel("Worker Dashboard");
      else if (pn.startsWith("/employees")) setSelectedPanel("Employees");
      else if (pn.startsWith("/user-locations")) setSelectedPanel("Location");
      else setSelectedPanel("");
    };

    selectPanel();
  }, [location]);

  return (
    <motion.div
      data-testid="sidenav"
      className="w-fit border-r-[2px] border-r-secondary flex flex-col items-center z-50 h-screen"
      animate={isMinimized ? "closed" : "open"}
      variants={sidenavvariants}
    >
        <div
          className={
            "flex flex-wrap items-center h-[110px] relative z-50 w-full " +
            (isMinimized ? "justify-center" : "justify-between")
          }
        >
          <motion.div
            className="flex items-center h-[110px] w-fit cursor-pointer "
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedPanelF("Dashboard")}
          >
            <div className="w-[40px] h-[40px] ml-2 mr-2">
              <OccupiLogo />
            </div>
            {!isMinimized && (
              <h2 className="text-text_col h-[24px] mt-[-10px] font-semibold text-2xl mr-2">
                Occupi
              </h2>
            )}
          </motion.div>
          {isMinimized ? (
            <motion.div
              className="w-[20px] h-[40px] bg-secondary rounded-r-[10px] flex justify-center items-center cursor-pointer -right-5 absolute z-50"
              whileTap={{ scale: 0.98 }}
              onClick={toggleSideNav}
            >
              <ChevronRight />
            </motion.div>
          ) : (
            <motion.div
              className="w-[20px] h-[40px] bg-secondary rounded-l-[10px] flex justify-center items-center cursor-pointer z-50"
              whileTap={{ scale: 0.98 }}
              onClick={toggleSideNav}
            >
              <ChevronLeft />
            </motion.div>
          )}
        </div>
        {sidebarcontent.map((button_content, index) => (
          <SideNavBarButton
            key={index}
            icon={button_content.icon}
            text={button_content.text}
            isMinimized={isMinimized}
            selected_panel={selectedPanel}
            setSelectedPanelF={setSelectedPanelF}
          />
        ))}
        <div className="flex-grow"/>
        <div className="mb-4">
          <ProfileDropDown isMinimized={isMinimized} />
        </div>
    </motion.div>
  );
};

export default SideNav;
