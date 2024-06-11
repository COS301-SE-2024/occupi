import { motion } from "framer-motion";
import React, { useState } from "react";
import {OverView} from "@components/index";
import { Dashboard } from "@pages/index";
import { useNavigate } from "react-router-dom";
const TabComponent = () => {
  const [activeTab, setActiveTab] = useState(1); // Set initial active tab
const navigate = useNavigate();
  const handleTabClick = (tabNumber: React.SetStateAction<number>) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="flex items-center justify-center h-[46px] w-[305px] rounded-[15px] bg-secondary">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary mr-[5px] cursor-pointer ${
          activeTab === 1 ? "bg-primary" : ""
        }`}
        onClick={() => handleTabClick(1)}
      >
        <p className="text-text_col">Overview</p>
      </motion.div>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary mr-[5px] cursor-pointer ${
          activeTab === 2 ? "bg-primary" : ""
        }`}
        onClick={() => handleTabClick(2)}
      >
        <p className="text-text_col">Bookings</p>
      </motion.div>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary cursor-pointer ${
          activeTab === 3 ? "bg-primary" : ""
        }`}
        onClick={() => handleTabClick(3)}
      >
        <p className="text-text_col">Visitations</p>
      </motion.div>

      {/* {activeTab === 1 && <Dashboard />} */}

      {activeTab === 2 && navigate("/overview")}
    </div>
  );
};

export default TabComponent;
