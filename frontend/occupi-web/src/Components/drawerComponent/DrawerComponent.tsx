import { motion } from "framer-motion";
import { FiUser, FiImage, FiLock, FiHelpCircle, FiInfo } from "react-icons/fi";
import MenuItem from "./menuItem/MenuItem"; // Make sure to adjust the path according to your directory structure
import profileIcon from "../../assets/images/userprofile.svg";
import appearanceIcon from "../../assets/images/palette.svg";
import privacyIcon from "../../assets/images/shieldplus.svg";
import helpIcon from "../../assets/images/alertcircle.svg";
import aboutIcon from "../../assets/images/marker-03.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Appearance } from "@components/index";
import { SettingsImg } from "@assets/index";
interface DrawerComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrawerComponent = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showAppearance, setShowAppearance] = useState(false);

  const handleClick = (path: string) => {
    setSelectedItem(path);
    if (path === "/appearance") {
      setShowAppearance(true);
    } else {
      setShowAppearance(false);
    }
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
            <li>
              <motion.a
                className={`flex items-center gap-4 p-2 rounded-lg ${
                  selectedItem === "/profile" ? "bg-gray-200" : ""
                }`}
                onClick={() => handleClick("/profile")}
                whileTap={{ scale: 0.95 }}
              >
                <img src={profileIcon} alt="" />
                <span className="text-base font-medium">Profile</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                className={`flex items-center gap-4 p-2 rounded-lg ${
                  selectedItem === "/appearance" ? "bg-gray-200" : ""
                }`}
                onClick={() => handleClick("/appearance")}
                whileTap={{ scale: 0.95 }}
              >
                <img src={appearanceIcon} alt="" />
                <span className="text-base font-medium">Appearance</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                className={`flex items-center gap-4 p-2 rounded-lg ${
                  selectedItem === "/privacy" ? "bg-gray-200" : ""
                }`}
                onClick={() => handleClick("/privacy")}
                whileTap={{ scale: 0.95 }}
              >
                <img src={privacyIcon} alt="" />
                <span className="text-base font-medium">Privacy</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                className={`flex items-center gap-4 p-2 rounded-lg ${
                  selectedItem === "/help" ? "bg-gray-200" : ""
                }`}
                onClick={() => handleClick("/help")}
                whileTap={{ scale: 0.95 }}
              >
                <img src={helpIcon} alt="" />
                <span className="text-base font-medium">Help</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                className={`flex items-center gap-4 p-2 rounded-lg ${
                  selectedItem === "/about" ? "bg-gray-200" : ""
                }`}
                onClick={() => handleClick("/about")}
                whileTap={{ scale: 0.95 }}
              >
                <img src={aboutIcon} alt="" />
                <span className="text-base font-medium">About</span>
              </motion.a>
            </li>
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
