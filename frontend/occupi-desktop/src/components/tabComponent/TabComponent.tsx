import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

type Tab = {
  name: string;
  path: string;
  index: number;
};

type TabComponentProps = {
  setSelectedTab: (arg: string) => void;
};

const TabComponent: React.FC<TabComponentProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: Tab[] = [
    { name: "Overview", path: "overview", index: 1 },
    { name: "Bookings", path: "bookings-dashboard", index: 2 },
    // { name: "Visitations", path: "visitations", index: 3 }
  ];

  useEffect(() => {
    const currentPath = location.pathname.split('/').pop() || '';
    const currentTab = tabs.find(tab => tab.path === currentPath) || tabs[0];
    setActiveTab(currentTab);
  }, [location]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsDropdownOpen(false);
    props.setSelectedTab(tab.path);
    navigate("/booking-statistics/" + tab.path);
  };

  const tabWidth = 95; // Width of each tab
  const tabSpacing = 5; // Spacing between tabs
  const backgroundPadding = 20; // Additional padding on each side of the background
  const totalWidth = tabs.length * tabWidth + (tabs.length - 1) * tabSpacing + 2 * backgroundPadding;

  return (
    <div data-testid='tab' className="flex items-center justify-center">
      {/* Desktop view */}
      <div 
        className="hidden md:flex items-center justify-center h-[46px] rounded-[15px] bg-secondary"
        style={{ width: `${totalWidth}px` }}
      >
        <div className="flex items-center justify-center">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.index}
              whileTap={{ scale: 0.97 }}
              className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary cursor-pointer ${
                activeTab?.index === tab.index ? "bg-primary" : ""
              }`}
              style={{ marginRight: index !== tabs.length - 1 ? `${tabSpacing}px` : '0' }}
              onClick={() => handleTabClick(tab)}
            >
              <p className="text-text_col">{tab.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden relative ml-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-between w-[120px] h-[36px] rounded-[10px] bg-secondary px-3"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="text-text_col">{activeTab?.name}</span>
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