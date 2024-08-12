import { OccupiLogo } from "@assets/index";
import { motion } from "framer-motion";

const AboutComponent = () => {
  return (
    <div>
      <div className="flex flex-col items-center">
        
        <div className="fixed w-40 h-40 flex flex-col items-center justify-center ">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <OccupiLogo />
          </motion.div>
        </div>

        <h2 className="mt-44 text-7xl font-bold text-text_col">Occupi.</h2>
        <p className="mt-2 text-3xl text-text_col text-center">Predict. Plan. Perfect</p>

        <div className="text-center text-2xl mt-4">
          <p className="text-text_col">version: 0.2.0</p>
          <p className="text-text_col">Web</p>
          <p className="text-text_col">Chrome 18.0.4</p>
        </div>

        <div className="flex flex-col underline text-center text-xl mt-4">
          <a href="/privacy-policy" className="text-blue-500">privacy policy</a>
          <a href="/terms-of-service" className="text-blue-500">terms of service</a>
          <a href="/user-manual" className="text-blue-500">user manual</a>
        </div>
      </div>
    </div>
  );
};

export default AboutComponent;
