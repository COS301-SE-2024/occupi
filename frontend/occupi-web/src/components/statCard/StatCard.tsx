import { GraphContainer } from "@components/index";
import { Button } from "@nextui-org/react";
import { FaArrowRight } from "react-icons/fa";

interface StatCardProps {
  width: string;
  height: string;
  icon: React.ReactNode;
  title: string;
  count: string;
  trend: {
    icon: React.ReactNode;
    value: string;
    direction: "up" | "down";
  };
  comparisonText: string;
}

const StatCard: React.FC<StatCardProps> = ({
  width,
  height,
  icon,
  title,
  count,
  trend,
  comparisonText,
}) => {
  return (
    <GraphContainer
      width={width}
      height={height}
      mainComponent={
        <div className="w-72 h-96 relative">
          <div className="w-64 px-7 py-2 left-[20px] top-[389px] absolute rounded-lg justify-center items-center gap-2.5 inline-flex">
            <Button className="bg-primary_alt text-text_col_alt text-sm w-96 font-medium leading-normal mt-10">
              See more
              <FaArrowRight className="ml-2" />
            </Button>
            <div className="w-6 h-6 justify-center items-center gap-6 flex" />
          </div>
          <div className="left-[20px] top-[290px] absolute text-text_col text-4xl font-semibold leading-10">
            {count}
          </div>
          <div className="left-[20px] top-[25px] absolute opacity-70 text-text_col text-base font-semibold leading-none">
            {title}
          </div>
          <div className="left-[20px] top-[345px] absolute">
            <div className="w-10 h-6 left-0 top-0 absolute"></div>
            <div className="flex flex-row top-[20px] absolute">
              <span className={`flex text-${trend.direction === 'up' ? 'teal-500' : 'text_col_red_salmon'} text-base font-semibold leading-none`}>
                {trend.icon} {trend.value}
              </span>
              <span className="w-40 text-text_col text-base font-semibold leading-none">
                {comparisonText}
              </span>
            </div>
          </div>
          <div className="w-48 h-48 left-[50px] top-[54px] absolute transform transition duration-500 hover:scale-105 hover:shadow-xl">
            {icon}
          </div>
        </div>
      }
    />
  );
};

export default StatCard;