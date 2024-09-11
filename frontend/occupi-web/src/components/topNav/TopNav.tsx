import React, { useState } from 'react';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type TopNavProps = {
  mainComponent?: JSX.Element;
  searchQuery: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedTab?: (arg: string) => void; // Make setSelectedTab optional
}

const TopNav = (props: TopNavProps) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const navigate = useNavigate();

  const tabs = [
    { name: "Overview", path: "overview" },
    { name: "Employees", path: "bookings" },
    { name: "Visitations", path: "visitations" }
  ];

  const handleTabSelect = (tab: { name: string; path: string }) => {
    setActiveTab(tab.name);
    setIsDropdownOpen(false);
    if (props.setSelectedTab) {
      props.setSelectedTab(tab.path); // Only call setSelectedTab if it exists
    }
    navigate(tab.path);
  };

  return (
    <div data-testid='topnav' className="sticky top-0 z-10 overflow-visible border-b-[2px] border-b-secondary flex items-center justify-between h-[70px] md:h-[110px] backdrop-blur-[20px] bg-primary_40 px-4 md:px-8">
      <div className="hidden md:block">
        {props.mainComponent}
      </div>

      <div className="md:hidden relative ml-7 mr-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-between w-[120px] h-[36px] rounded-[10px] bg-secondary px-3"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="text-text_col">{activeTab}</span>
          <FaChevronDown className="text-text_col" />
        </motion.button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 w-[120px] mt-1 bg-secondary rounded-[10px] overflow-hidden"
            >
              {tabs.map((tab) => (
                <motion.button
                  key={tab.name}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full text-left px-3 py-2 text-text_col"
                  onClick={() => handleTabSelect(tab)}
                >
                  {tab.name}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden md:block relative">
        <input
          type="text"
          placeholder="ctrl/cmd-k to search"
          className="w-[30vw] h-[45px] rounded-[15px] bg-secondary p-[8px]"
          value={props.searchQuery}
          onChange={props.onChange}
        />
      </div>

      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-full px-4 py-2 bg-primary_40 border-b-[2px] border-b-secondary"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-[35px] rounded-[15px] bg-secondary p-[8px] pr-10"
                value={props.searchQuery}
                onChange={props.onChange}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setIsSearchVisible(false)}
              >
                <FaSearch size={20} className="text-text_col" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden"
          onClick={() => setIsSearchVisible(!isSearchVisible)}
        >
          <FaSearch size={24} className="text-text_col" />
        </motion.button>
        {/* <ProfileDropDown /> */}
      </div>
    </div>
  )
}

export default TopNav;