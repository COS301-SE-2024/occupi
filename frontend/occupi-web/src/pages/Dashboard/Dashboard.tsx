import { TopNav } from "@components/index";
import { useState, useEffect } from "react";
import { TabComponent,GraphContainer } from "@components/index";
import { Button } from "@nextui-org/react";
import { FaArrowRight } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { GraphCol } from "@assets/index";
import { Cal } from "@assets/index";
import { useNavigate, Outlet } from "react-router-dom";

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
  }, [])

  return (
    <div className="w-full overflow-auto">
      <TopNav
        // mainComponent={<TabComponent />}
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      <div className="flex flex-col ml-10 mt-10 gap-2">
        <div className="w-24 h-6  text-neutral-950 text-xl font-extralight leading-snug">
          Hi Tina 👋
        </div>
        <div className="w-96 h-7 text-neutral-950 text-2xl font-semibold  leading-none">
          Welcome to Occupi
        </div>
        <div className="w-60 h-8 text-neutral-950 text-3xl font-semibold leading-none mt-9">
          Office bookings{" "}
        </div>
      </div>
      <div className="">
        <div className="flex gap-10 ml-10 mt-10">
          <GraphContainer
          width="850px"
          height="28rem"
            mainComponent={
              <div className=" relative">
                <div className=" -ml-72 mt-16 transform transition duration-500 hover:scale-105 hover:shadow-xl">

                <GraphCol/>
                </div>
                <div className="w-96 h-96 left-[2px] top-[2px] absolute">
                  <div className="w-8 h-7 left-[112.60px] top-[380.27px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Jul
                  </div>
                  <div className="w-11 h-7 left-[217.01px] top-[380.27px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Aug
                  </div>
                  <div className="w-11 h-7 left-[317.33px] top-[380.27px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Sep
                  </div>
                  <div className="w-10 h-7 left-[419.69px] top-[380.27px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Oct
                  </div>
                  <div className="w-11 h-7 left-[522.06px] top-[380.27px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Nov
                  </div>
                  <div className="w-11 h-7 left-[622.37px] top-[380.90px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Dec
                  </div>
                  <div className="w-10 h-7 left-[724.74px] top-[380.27px] absolute text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                    Jan
                  </div>
                  <div className="w-11 h-7 left-[69.61px] top-[349.93px] absolute">
                    <div className="w-4 h-7 left-0 top-0 absolute text-right text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                      0
                    </div>
                  </div>
                  <div className="w-16 h-7 left-[45.04px] top-[269.02px] absolute">
                    <div className="w-11 h-7 left-0 top-0 absolute text-right text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                      200
                    </div>
                  </div>
                  <div className="w-16 h-7 left-[42.99px] top-[188.11px] absolute">
                    <div className="w-11 h-7 left-0 top-0 absolute text-right text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                      400
                    </div>
                  </div>
                  <div className="w-16 h-7 left-[42.99px] top-[107.20px] absolute">
                    <div className="w-11 h-7 left-0 top-0 absolute text-right text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                      600
                    </div>
                  </div>
                  <div className="w-16 h-7 left-[42.99px] top-[26.30px] absolute">
                    <div className="w-11 h-7 left-0 top-0 absolute text-right text-slate-400 text-xs font-normal font-['Inter'] leading-none">
                      800
                    </div>
                  </div>
                  <div className="w-96 h-80 left-[114.65px] top-[40.45px] absolute">
                    <div className="w-96 h-80 left-0 top-0 absolute"></div>
                    <div className="w-96 h-80 left-0 top-0 absolute"></div>
                  </div>
                  <div className="w-96 h-72 left-[114.65px] top-[66.75px] absolute"></div>
                </div>
              </div>
            }
          />

          <GraphContainer
            width="18rem"
            height="28rem"
            mainComponent={
              <div className="w-72 h-96 relative">
                <div className=" left-0 top-0 absolute rounded-2xl border-2 " />
                <div className="w-64 px-7 py-2 left-[20px] top-[389px] absolute rounded-lg justify-center items-center gap-2.5 inline-flex">
                  <Button className="text-white text-sm w-96 font-medium  leading-normal bg-black py-2 px-4">
                    See more
                    <FaArrowRight className="ml-2" />
                  </Button>
                  <div className="w-6 h-6 justify-center items-center gap-6 flex" />
                </div>
                <div className="left-[20px] top-[285px] absolute text-neutral-800 text-4xl font-semibold  leading-10">
                  50 people
                </div>
                <div className="left-[20px] top-[20px] absolute opacity-70 text-neutral-800 text-base font-semibold  leading-none">
                  Total bookings today
                </div>
                <div className="left-[20px] top-[345px] absolute">
                  <div className="w-10 h-6 left-0 top-0 absolute"></div>
                  <div className=" flex flex-row left-[32px] top-[5px] absolute">
                    <span className="text-teal-500 text-base font-semibold  leading-none">
                      1.8%
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
        <div className="flex gap-10 mt-20 ml-10">
          <GraphContainer width="39.063vw" height="50.063vw" />
          <GraphContainer width="40.063vw" height="40.063vw" />
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Dashboard;
