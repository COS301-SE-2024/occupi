import React from "react";
import { motion } from "framer-motion";
import { OccupiLogo } from "@assets/index";

interface OccupiLoaderProps {
  message?: string;
}

const OccupiLoader: React.FC<OccupiLoaderProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center backdrop-blur-md z-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      >
        <OccupiLogo />
      </motion.div>
      {message && <p className="mt-4 text-2xl text-text_col">{message}</p>}
    </div>
  );
};

export default OccupiLoader;
