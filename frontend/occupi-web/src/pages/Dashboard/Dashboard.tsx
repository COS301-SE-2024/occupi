import { TopNav } from "@components/index";
import { useState, useEffect } from "react";
import {
  TabComponent,
  GraphContainer,
  Line_Chart,
  BarGraph,
} from "@components/index";
import { Button } from "@nextui-org/react";
import { FaArrowRight } from "react-icons/fa";
import { GraphCol, Bf ,DownTrend,Uptrend} from "@assets/index";
import { Cal } from "@assets/index";
import { useNavigate, Outlet } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate("/dashboard" + path);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleClick("/overview");
  }, []);

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={<TabComponent setSelectedTab={(arg: string) => {}} />}
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      <div className="flex flex-col mt-5 gap-2 ml-32">
        <div className="w-24 h-6  text-neutral-950 text-xl font-extralight leading-snug">
          Hi Tina 👋
        </div>
        <div className="w-96 h-7 text-neutral-950 text-2xl font-semibold  leading-none">
          Welcome to Occupi
        </div>
        <div className="flex w-60 h-8 text-neutral-950 text-3xl font-semibold leading-none mt-9">
          Office bookings <ChevronRight size={20} className="mt-1" />
        </div>
      </div>

      <div className="ml-20">
        <div className="">
          <div className="flex gap-10 ml-10 mt-10">
            <GraphContainer
              width="900px"
              height="500px"
              mainComponent={
                <div className=" relative">
                  <div className=" mt-9 ">
                    <Line_Chart />
                  </div>
                </div>
              }
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
                  <div className="left-[20px] top-[290px] absolute text-neutral-800 text-4xl font-semibold  leading-10">
                    50 people
                  </div>
                  <div className="left-[20px] top-[25px] absolute opacity-70 text-neutral-800 text-base font-semibold  leading-none">
                    Total bookings today
                  </div>
                  <div className="left-[20px] top-[345px] absolute">
                    <div className="w-10 h-6 left-0 top-0 absolute"></div>
                    <div className=" flex flex-row  top-[20px] absolute">
                      <span className="flex  text-teal-500 text-base font-semibold   leading-none">
                        1.8% <Uptrend  />
                      </span>
                      <span className=" w-36  text-slate-900 text-base font-semibold  leading-none">
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

          <div className="flex w-60 h-8 text-neutral-950 text-3xl font-semibold leading-none mt-32 ml-14">
            Most Visitations <ChevronRight size={20} className="mt-2" />
          </div>

          <div className="flex mt-5 gap-10">
            <div className="mt-20 ml-14 ">
              <GraphContainer
                width="900px"
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
                    <div className="left-[20px] top-[290px] absolute text-neutral-800 text-4xl font-semibold  leading-10">
                      50 people
                    </div>
                    <div className="left-[20px] top-[25px] absolute opacity-70 text-neutral-800 text-base font-semibold  leading-none">
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
      </div>

      {/* <Outlet /> */}
    </div>
  );
};

export default Dashboard;
