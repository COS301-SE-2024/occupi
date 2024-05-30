import React from "react";
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
import GraphContainer from "../graphContainer/GraphContainer";
import SearchBar from "../searchBarComponent/SearchBar";
const SideNav = () => {
  return (
    <div className="flex h-screen">
        {/* <GraphContainer />
        <SearchBar /> */}
      <nav className="w-64 bg-base-white shadow-2xl p-10 absolute  left-0 top-0">
      
          <div className="flex items-center mb-5 top-4 left-4">
            <img
              className="frame mr-2"
              alt="Frame"
              src="https://c.animaapp.com/Ac7JpPyQ/img/frame-6.svg"
            />
           
            </div>
            
        <button
          className="btn bg-black text-white hover:bg-gray-800 w-full"
          //   onClick={onClick}
        >
          {" "}
          <MdOutlineDashboard className="mr-5 text-2xl text-white" />
          Dashboard
        </button>
        <ul className="menu">
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlinePieChart className="mr-2 text-2xl text-black" />
              Analysis
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlineSmartToy className="mr-2 text-2xl text-black" />
              AI Model
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlineDomain className="mr-2 text-2xl text-black" />
              Buildings
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlineGroup className="mr-2 text-2xl text-black" />
              Teams
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlineNotifications className="mr-2 text-2xl text-black" />
              Notifications
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlineSettings className="mr-2 text-2xl text-black" />
              Settings
            </a>
          </li>
          <li className="mb-2">
            <a
              href="#"
              className="flex items-center p-2 rounded-lg hover:bg-base-300"
            >
              <MdOutlineExitToApp className="mr-2 text-2xl text-black" />
              Logout
            </a>
          </li>
        </ul>
        <div className="fixed bottom-0 left-0 w-64 p-4 bg-base-100 border-black flex items-center">
          <div className="avatar mr-4">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
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
  );
};

export default SideNav;
