import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type TabComponentProps = {
  setSelectedTab: (arg: string) => void;
};

const TabComponent = (props: TabComponentProps) => {
  const [activeTab, setActiveTab] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { name: "Overview", path: "overview", index: 1 },
    { name: "Employees", path: "bookings", index: 2 },
    { name: "Visitations", path: "visitations", index: 3 }
  ];

  const handleTabClick = (tab: { name: string; path: string; index: number }) => {
    setActiveTab(tab.index);
    setIsDropdownOpen(false);
    props.setSelectedTab(tab.path);
    navigate(tab.path);
  };

  return (
    <div data-testid='tab' className="flex items-center justify-center">
      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-center h-[46px] w-[305px] rounded-[15px] bg-secondary">
        {tabs.map((tab) => (
          <motion.div
            key={tab.index}
            whileTap={{ scale: 0.97 }}
            className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary ${
              tab.index !== 3 ? "mr-[5px]" : ""
            } cursor-pointer ${activeTab === tab.index ? "bg-primary" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            <p className="text-text_col">{tab.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Mobile view */}
      <div className="md:hidden relative ml-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-between w-[120px] h-[36px] rounded-[10px] bg-secondary px-3"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="text-text_col">{tabs.find(tab => tab.index === activeTab)?.name}</span>
          <FaChevronDown className="text-text_col" />
        </motion.button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-[120px] mt-1 bg-secondary rounded-[10px] overflow-hidden"
            >
              {tabs.map((tab) => (
                <motion.button
                  key={tab.index}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full text-left px-3 py-2 text-text_col"
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.name}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TabComponent;