import React from "react";
import { motion } from "framer-motion";
import { Macbook1, Macbook2, Macbook3 } from "@assets/index";

const Appearance = () => {
  return (
    <motion.div
      className="w-full p-4 rounded-lg text-white overflow-y-auto max-h-screen"
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
    

      <div className="w-full h-full relative gap-72 flex">
        <div>
          <div className="w-full h-9 text-neutral-950 text-base font-semibold font-['Inter'] leading-none">
            Accent colour
          </div>
          <div className="w-full h-9 text-stone-300 text-base font-normal font-['Inter'] leading-none">
            Select or customize your accent colours
          </div>
        </div>

        <div>
          <div className="w-full h-12  items-center relative ">
            <div className="flex items-center">
              <div className="w-12 h-12 relative flex-shrink-0">
                <div className="w-10 h-10 absolute inset-1 bg-neutral-950 rounded-full" />
                <div className="w-12 h-12 absolute inset-0 rounded-3xl border-2 border-neutral-950" />
              </div>
              
              <div className="w-10 h-10 mx-1 bg-red-500 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-amber-300 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-lime-400 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-green-400 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-cyan-300 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-blue-500 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-purple-500 rounded-full" />
              <div className="w-10 h-10 mx-1 bg-fuchsia-500 rounded-full" />
            </div>
          </div>

          <div className="w-full h-10 mt-4 flex items-center">
            <div className="w-28 h-9 text-neutral-700 text-base font-normal font-['Inter'] leading-none">
              Custom colour:
            </div>
            <div className="w-40 h-10 pl-5 py-2.5 bg-gray-200 rounded-2xl flex items-center justify-center">
              <div className="text-neutral-950 text-xs font-extralight font-['Inter'] leading-none">
                #25AD77
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-0.5 bg-gray-200 rounded-2xl my-4" />














      <div className="w-full h-full relative gap-80 flex mb-10">
        <div>
          <div className="w-full h-9 text-neutral-950 text-base font-semibold font-['Inter'] leading-none">
            Themes
          </div>
          <div className="w-full h-9 text-stone-300 text-base font-normal font-['Inter'] leading-none">
            Switch between multiple themes
          </div>
        </div>

        <div className=" text-black font-semibold ">
          <div className="w-full h-12 items-center relative flex gap-10 ">
            <div className="flex flex-col items-center ">
              <img src={Macbook1} alt="light" className=" w-28 h-24 mt-6" />
              <span className=" -mt-3 ">Snowflake</span>
            </div>
            <div className="flex flex-col items-center ">
            

              <img src={Macbook2} alt="dark" className="w-28 h-24 mt-6" />
              
              <span className=" -mt-3">Midnight</span>
            </div>
            <div className="flex flex-col items-center">
              <img src={Macbook3} alt="light" className="w-28 h-24 mt-6"  />
              <span className="  -mt-3">System</span>

            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-0.5 bg-gray-200 rounded-2xl my-4" />
    </motion.div>
  );
};

export default Appearance;
