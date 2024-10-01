import React from 'react';
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
  onClick?: () => void; // Added optional onClick prop
}

const StatCard: React.FC<StatCardProps> = ({
  width,
  height,
  icon,
  title,
  count,
  trend,
  comparisonText,
  onClick, // Added onClick to the destructured props
}) => {
  return (
    <GraphContainer
      width={width}
      height={height}
      mainComponent={
        <div className="w-full h-full p-5 flex flex-col justify-between">
          <div>
            <div className="opacity-70 text-text_col text-base font-semibold leading-none mb-4">
              {title}
            </div>
            <div className="w-48 h-48 mx-auto transform transition duration-500 hover:scale-105 hover:shadow-xl">
              {icon}
            </div>
            <div className="text-text_col text-4xl font-semibold leading-10 mt-4">
              {count}
            </div>
            <div className="mt-4 flex items-center">
              <span className={`flex items-center text-${trend.direction === 'up' ? 'teal-500' : 'text_col_red_salmon'} text-base font-semibold leading-none mr-2`}>
                {trend.icon} {trend.value}
              </span>
              <span className="text-text_col text-base font-semibold leading-none">
                {comparisonText}
              </span>
            </div>
          </div>
          <Button 
            className="bg-primary_alt text-text_col_alt text-sm font-medium leading-normal w-full mt-10"
            onClick={onClick} // Added onClick prop to the Button
          >
            See more
            <FaArrowRight className="ml-2" />
          </Button>
        </div>
      }
    />
  );
};

export default StatCard;