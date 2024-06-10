import { motion } from "framer-motion";
import MenuItem from "./menuItem/MenuItem"; // Make sure to adjust the path according to your directory structure
import {Userprofile, Pallete, Privacy, AlertIcon, HelpIcon} from "@assets/index";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Appearance } from "@components/index";
import { SettingsImg } from "@assets/index";

const DrawerComponent = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<string>("/profile");
  const [showAppearance, setShowAppearance] = useState(false);

  const handleClick = (path: string) => {
    setSelectedItem(path);
    navigate("/settings" + path);
  };

  return (
    <div className="flex flex-row relative">
      <motion.div
        className="w-full  z-10"
        initial={{ x: "-1%" }}
        animate={{ x: 20 }}
        transition={{ duration: 0.2, ease: "linear" }}
      >
        <div className="menu p-4 w-80 bg-base-100 text-base-content bg-transparent">
          <ul className="menu-items ">
            <MenuItem icon={<Userprofile />} selectedItem={selectedItem} text="Profile" path="/profile" handleClick={handleClick} />
            <MenuItem icon={<Pallete />} selectedItem={selectedItem} text="Appearance" path="/appearance" handleClick={handleClick} />
          </ul>
        </div>
      </motion.div>
      <div className=" absolute left-0  top-0">
        {showAppearance ? (
          <Appearance />
        ) : (
          <div className="flex flex-col items-center ml-96 mt-16 ">
            <span className=" font-serif font-semibold text-3xl">Please Select a Setting</span>
            <img
              src={SettingsImg}
              alt="Settings"
              className="object-scale-down  "
              
            />
            
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawerComponent;
