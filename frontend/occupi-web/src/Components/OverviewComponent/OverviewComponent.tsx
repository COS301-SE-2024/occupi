import { Uptrend, Cal, DownTrend, Bf } from "@assets/index";
import { BarGraph, GraphContainer, Line_Chart } from "@components/index";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";

const OverviewComponent = () => {
    return (
        <div>
            <div className="flex flex-col mt-6 gap-2 w-11/12 mr-auto ml-auto">
                <div className="w-24 h-6 text-text_col text-xl font-extralight leading-snug">
                Hi Tina 👋
                </div>
                <div className="w-96 h-7 text-text_col text-2xl font-semibold  leading-none">
                Welcome to Occupi
                </div>
                <motion.div 
                whileHover={{gap: "10px"}}
                className="flex w-full h-8 items-center text-text_col text-3xl font-semibold leading-none mt-9 cursor-pointer">
                  Office bookings <ChevronRight size={24} className="mt-1" />
                </motion.div>
            </div>

            <div className=" w-11/12 mr-auto ml-auto">
                <div className="flex gap-10 mt-10">
                    <GraphContainer
                    width="55vw"
                    height="500px"
                    mainComponent={<Line_Chart />}
                    />

                    <GraphContainer
                    width="18rem"
                    height="500px"
                    mainComponent={
                        <div className="w-72 h-96 relative">
                        <div className=" left-0 top-0 absolute rounded-2xl border-2 " />
                        <div className="w-64 px-7 py-2 left-[20px] top-[389px] absolute rounded-lg justify-center items-center gap-2.5 inline-flex">
                            <Button className="text-white text-sm w-96 font-medium  leading-normal bg-black mt-10">
                            See more
                            <FaArrowRight className="ml-2" />
                            </Button>
                            <div className="w-6 h-6 justify-center items-center gap-6 flex" />
                        </div>
                        <div className="left-[20px] top-[290px] absolute text-text_col text-4xl font-semibold  leading-10">
                            50 people
                        </div>
                        <div className="left-[20px] top-[25px] absolute opacity-70 text-text_col  text-base font-semibold  leading-none">
                            Total bookings today
                        </div>
                        <div className="left-[20px] top-[345px] absolute">
                            <div className="w-10 h-6 left-0 top-0 absolute"></div>
                            <div className=" flex flex-row  top-[20px] absolute">
                            <span className="flex  text-teal-500 text-base font-semibold   leading-none">
                                1.8% <Uptrend  />
                            </span>
                            <span className=" w-36  text-text_col text-base font-semibold  leading-none">
                                Up from yesterday
                            </span>
                            </div>
                        </div>
                        <img
                            className="w-48 h-48 left-[50px] top-[54px] absolute transform transition duration-500 hover:scale-105 hover:shadow-xl"
                            src={Cal}
                        />
                        </div>
                    }
                    />
                </div>
            </div>

            <motion.div 
            whileHover={{gap: "10px"}}
              className="flex w-11/12 mr-auto ml-auto h-8 text-text_col text-3xl font-semibold leading-none mt-32 items-center cursor-auto">
                Most Visitations <ChevronRight size={24} className="mt-2" />
            </motion.div>

          <div className="flex mt-5 gap-10">
            <div className="mt-20 ml-14 ">
              <GraphContainer
                width="55vw"
                height="500px"
                mainComponent={
                  <div className=" relative">
                    <div className=" mt-14 mb-20 ">
                      <BarGraph />
                    </div>
                  </div>
                }
              />
            </div>



            <div className="mt-20">
              <GraphContainer
                width="18rem"
                height="500px"
                mainComponent={
                  <div className="w-72 h-96 relative">
                    <div className=" left-0 top-0 absolute rounded-2xl border-2 " />
                    <div className="w-64 px-7 py-2 left-[20px] top-[389px] absolute rounded-lg justify-center items-center gap-2.5 inline-flex">
                      <Button className="text-white text-sm w-96 font-medium  leading-normal bg-black mt-10">
                        See more
                        <FaArrowRight className="ml-2" />
                      </Button>
                      <div className="w-6 h-6 justify-center items-center gap-6 flex" />
                    </div>
                    <div className="left-[20px] top-[290px] absolute text-text_col  text-4xl font-semibold  leading-10">
                      50 people
                    </div>
                    <div className="left-[20px] top-[25px] absolute opacity-70 text-text_col  text-base font-semibold  leading-none">
                      Total visitations today
                    </div>
                    <div className="left-[20px] top-[345px] absolute">
                      <div className="w-10 h-6 left-0 top-0 absolute"></div>
                      <div className=" flex flex-row top-[20px] absolute">
                        <span className="flex text-text_col_red_salmon text-base font-semibold leading-none">
                          4.3% <DownTrend />
                        </span>
                        <span className=" w-40  text-text_col text-base font-semibold  leading-none">
                          Down from yesterday
                        </span>
                      </div>
                    </div>
                    <img
                      className="w-48 h-48 left-[50px] top-[70px] absolute transform transition duration-500 hover:scale-105 hover:shadow-xl"
                      src={Bf}
                    />
                  </div>
                }
              />
          </div>
        </div>
      
        </div>
    )
}

export default OverviewComponent