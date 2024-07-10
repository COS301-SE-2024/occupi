import { Uptrend, Cal, DownTrend, Bf } from "@assets/index";
import { BarGraph, GraphContainer, Line_Chart, StatCard, Header } from "@components/index";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const OverviewComponent = () => {
  return (
    <div className=" ">
   <Header/>
   {/* <OccupiLoader/> */}

      <div className=" w-11/12 mr-auto ml-auto">
        <div className="lg:flex md:flex-row sm:flex-row gap-10 mt-10">
          <GraphContainer
            width="55vw"
            height="500px"
            mainComponent={<Line_Chart />}
          />

          <StatCard
            width="18rem"
            height="500px"
            icon={<img src={Cal} alt="Calendar" />}
            title="Total bookings today"
            count="143 people"
            trend={{
              icon: <Uptrend />,
              value: "2.8%",
              direction: "up",
            }}
            comparisonText="Up from yesterday"
          />


        </div>
      </div>

      <motion.div
        // whileHover={{gap: "10px"}}
        className="flex w-11/12 mr-auto ml-auto h-8 text-text_col text-3xl font-semibold leading-none mt-32 items-center cursor-auto"
      >
        Most Visitations <ChevronRight size={24} className="mt-2" />
      </motion.div>

      <div className="lg:flex md:flex-row sm:flex-row mt-5 gap-10">
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
        <StatCard
            width="18rem"
            height="500px"
            icon={<img src={Bf} alt="Building" />}
            title="Total visitations today"
            count="79 people"
            trend={{
              icon: <DownTrend />,
              value: "4.3%",
              direction: "down"
            }}
            comparisonText="Down from yesterday"
          />

          
        </div>
      </div>
    </div>
  );
};

export default OverviewComponent;
