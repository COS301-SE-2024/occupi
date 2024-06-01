import React, { useState } from "react";
import {
  MdOutlineDashboard,
  MdOutlineSettings,
  MdOutlineDomain,
  MdOutlineGroup,
  MdOutlineNotifications,
  MdOutlineExitToApp,
  MdOutlinePieChart,
  MdOutlineSmartToy,
} from "react-icons/md";
import Settings  from "../../pages/settings-page/Settings";
import DrawerComponent from "../drawerComponent/DrawerComponent";
import { NavLink } from 'react-router-dom';

const SideNav: React.FC = () => {
  const [activeButton, setActiveButton] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    if (buttonName === "Settings") {
      setIsDrawerOpen(true); // Open the drawer when Settings is clicked
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-[265px] bg-white border-r-2 border-gray-200 overflow-y-auto">
        <nav className="p-5">
          <div className="relative flex mr-10 right-7 ">
            <img
              className="frame mr-2"
              alt="Frame"
              src="https://c.animaapp.com/Ac7JpPyQ/img/frame-6.svg"
            />
            <span className="font-['Inter'] text-[35px] font-semibold leading-[14px] text-[#0a0a0a] tracking-[-0.5px] absolute top-[55px] left-[120px]">
              Occupi.
            </span>
          </div>
          <ul className="menu">
            <li className="mb-2">
              <NavLink
                to="/landing"
                className={`btn text-[18px] ${
                  activeButton === "Dashboard"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Dashboard")}
              >
                <MdOutlineDashboard className="mr-3 text-xl" />
                <span className="flex-grow text-left">Dashboard</span>
              </NavLink>
            </li>
            <li className="mb-2">
              <a
                role="button"
                className={`btn text-[18px] ${
                  activeButton === "Analysis"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Analysis")}
              >
                <MdOutlinePieChart className="mr-3 text-xl" />
                <span className="flex-grow text-left">Analysis</span>
              </a>
            </li>
            <li className="mb-2">
              <a
                role="button"
                className={`btn text-[18px] ${
                  activeButton === "AI Model"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("AI Model")}
              >
                <MdOutlineSmartToy className="mr-3 text-xl" />
                <span className="flex-grow text-left">AI Model</span>
              </a>
            </li>
            <li className="mb-2">
              <a
                role="button"
                href="path"
                className={`btn text-[18px] ${
                  activeButton === "Buildings"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Buildings")}
              >
                <MdOutlineDomain className="mr-3 text-xl" />
                <span className="flex-grow text-left">Buildings</span>
              </a>
            </li>
            <li className="mb-2">
              <a
                role="button"
                className={`btn text-[18px] ${
                  activeButton === "Teams"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Teams")}
              >
                <MdOutlineGroup className="mr-3 text-xl" />
                <span className="flex-grow text-left">Teams</span>
              </a>
            </li>
            <li className="mb-2">
              <a
                role="button"
                className={`btn text-[18px] ${
                  activeButton === "Notifications"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Notifications")}
              >
                <MdOutlineNotifications className="mr-3 text-xl" />
                <span className="flex-grow text-left">Notifications</span>
              </a>
            </li>
            <li className="mb-2">
              <NavLink
                to="/settings"
                className={`btn text-[18px] ${
                  activeButton === "Settings"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Settings")}
              >
                <MdOutlineSettings className="mr-3 text-xl" />
                <span className="flex-grow text-left">Settings</span>
              </NavLink>
            </li>
            <li className="mb-2">
              <a
                role="button"
                className={`btn text-[18px] ${
                  activeButton === "Logout"
                    ? "bg-black text-white"
                    : "bg-white border-none shadow-none"
                } hover:bg-black hover:text-white w-full flex items-center p-2 rounded-lg`}
                onClick={() => handleButtonClick("Logout")}
              >
                <MdOutlineExitToApp className="mr-3 text-xl" />
                <span className="flex-grow text-left">Logout</span>
              </a>
            </li>
          </ul>

          <div className="bottom-0 left-0 w-full mt-10 p-4 bg-base-100 flex items-center">
            <div className="avatar mr-4">
              <div className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  alt="Profile"
                />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-600">johndoe@example.com</div>
            </div>
          </div>
        </nav>
      </div>
      <DrawerComponent isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
};
export default SideNav;
