import React, { useState } from "react";
import {
  BuildingTower,
  BookingLevelCalendar,
  OccupancyRecommendationEngine,
  TopNav, TabComponent
} from "@components/index";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { Tooltip } from "@nextui-org/react";

const BookingStats: React.FC = () => {
  const [showLegend, setShowLegend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const Legend = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute top-full bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20"
    >
      <h3 className="font-bold mb-2 text-text_col_secondary_alt">
        Color Legend
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-success-200 mr-2"></div>Very Low
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-warning-200 mr-2"></div>Low
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-warning-400 mr-2"></div>Medium
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-danger-200 mr-2"></div>High
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-secondary-200 mr-2"></div>Very High
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-400 mr-2"></div>Holiday
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="w-full overflow-auto bg-gradient-to-br"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <TopNav
        mainComponent={
          <TabComponent setSelectedTab={() => { }} />
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      {/* <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-text_col_secondary_alt"
        variants={itemVariants}
      >
        Visitations Dashboard
      </motion.h1> */}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={itemVariants}
      >
        <motion.div
          className="rounded-lg  p-6 h-[450px] relative overflow-visible"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold text-text_col_secondary_alt">
            Building Overview
          </h2>
          <BuildingTower />
        </motion.div>
        <motion.div
          className="rounded-lg p-6 "
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex flex-row justify-start items-center mb-3">
            <h2 className="text-2xl font-semibold text-text_col_secondary_alt">
              Booking Calendar&nbsp;
            </h2>
            <Tooltip content="View color legend">
              <Info
                size={24}
                className="text-indigo-500"
                onClick={() => setShowLegend(!showLegend)}
              />
            </Tooltip>
          </div>
          <BookingLevelCalendar />
          <AnimatePresence>{showLegend && <Legend />}</AnimatePresence>
        </motion.div>
        <motion.div
          className="rounded-lg p-6 md:col-span-2 lg:col-span-1"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-text_col_secondary_alt">
            Occupancy Recommendations
          </h2>
          <OccupancyRecommendationEngine />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BookingStats;
