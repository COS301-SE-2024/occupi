import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

type TabComponentProps = {
  setSelectedTab: (arg: string) => void;
};

const TabComponent = (props: TabComponentProps) => {
  const [activeTab, setActiveTab] = useState(1); // Set initial active tab

  const handleTabClick = (tabIndex: React.SetStateAction<number>) => {
    setActiveTab(tabIndex);
    props.setSelectedTab(tabIndex === 1 ? "/overview" : tabIndex === 2 ? "/employees" : "/visitations");
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/dashboard")) {
      const uPath = path.split("/dashboard")[1];
      if (uPath === "/overview") {
        handleTabClick(1);
      } else if (uPath === "/employees") {
        handleTabClick(2);
      } else if (uPath === "/visitations") {
        handleTabClick(3);
      }
    }
  }, []);

  return (
    <div data-testid='tab' className="flex items-center justify-center h-[46px] w-[305px] rounded-[15px] bg-secondary">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary mr-[5px] cursor-pointer ${activeTab === 1 ? "bg-primary" : ""}`}
        onClick={() => handleTabClick(1)}
      >
        <p className="text-text_col">
          Overview
        </p>
      </motion.div>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary mr-[5px] cursor-pointer ${activeTab === 2 ? "bg-primary" : ""}`}
        onClick={() => handleTabClick(2)}
      >
        <p className="text-text_col">
          Employees
        </p>
      </motion.div>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[95px] h-[36px] rounded-[10px] flex justify-center items-center hover:bg-primary cursor-pointer ${activeTab === 3 ? "bg-primary" : ""}`}
        onClick={() => handleTabClick(3)}
      >
        <p className="text-text_col">
          Visitations
        </p>
      </motion.div>

    </div>
  );
};

export default TabComponent;