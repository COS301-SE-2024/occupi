import { useState, useEffect } from "react";
import TopNav from "../../components/topNav/TopNav";
import { motion } from "framer-motion";
import {MenuItem} from "@components/index"; // Make sure to adjust the path according to your directory structure
import {Userprofile, Pallete, Privacy, AlertIcon, HelpIcon} from "@assets/index";
import { useNavigate, Outlet } from "react-router-dom";

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<string>("/profile");

  const handleClick = (path: string) => {
    setSelectedItem(path);
    navigate("/settings" + path);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleClick("/profile");
  },[]);

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Settings
            <span className="block text-sm opacity-65  text-text_col_secondary_alt ">
            Manage your profile, appearance, and what data is shared with us
          </span>
        </div>
        
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      <div className="flex relative">
        <motion.div
          className="fixed"
          initial={{ x: "-1%" }}
          animate={{ x: 20 }}
          transition={{ duration: 0.2, ease: "linear" }}
        >
          <div className="menu p-4 w-80 bg-base-100 text-base-content bg-transparent">
              <MenuItem icon={<Userprofile />} selectedItem={selectedItem} text="Profile" path="/profile" handleClick={handleClick} />
              <MenuItem icon={<Pallete />} selectedItem={selectedItem} text="Appearance" path="/appearance" handleClick={handleClick} />
              <MenuItem icon={<Privacy />} selectedItem={selectedItem} text="Privacy" path="/privacy" handleClick={handleClick} />
              <MenuItem icon={<AlertIcon />} selectedItem={selectedItem} text="Help" path="/help" handleClick={handleClick} />
              <MenuItem icon={<HelpIcon />} selectedItem={selectedItem} text="About" path="/about" handleClick={handleClick} />
          </div>
        </motion.div>
        <div className="ml-80 overflow-x-hidden overflow-y-auto w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
