// src/AiDashCard.tsx
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";
import { IconType } from "react-icons";
import { Uptrend, DownTrend } from "@assets/index";

interface AiDashCardProps {
  title: string;
  icon: React.ReactElement<IconType>;
  stat: string;
  trend: number;
  onRemove: () => void;
}

const AiDashCard: React.FC<AiDashCardProps> = ({
  title,
  icon,
  stat,
  trend,
  onRemove,
}) => {
  return (
    <Card
      className="w-full max-w-sm h-auto shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl"
      data-testid="ai-dash-card">
      <CardHeader
        className="flex justify-between items-center p-4 bg-secondary dark:bg-zinc-500"
        data-testid="card-header">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-text_col " data-testid="icon">
            {icon}
          </div>
          <h4 className="text-lg font-semibold" data-testid="title">
            {title}
          </h4>
        </div>
        <Button
          onClick={onRemove}
          size="sm"
          className="bg-transparent text-2xl  hover:bg-red_salmon text-gray-600 dark:text-gray-300"
          data-testid="remove-button">
         ×
        </Button>
      </CardHeader>
      <CardBody
        className="    background-color: hsl(var(--nextui-content1) / var(--nextui-content1-opacity, var(--tw-bg-opacity)));  flex flex-col items-center justify-center py-6"
        data-testid="card-body">
        <h2
          className="text-6xl font-bold text-text_col -mb-2"
          data-testid="stat">
          {stat}
        </h2>
      </CardBody>
      <CardFooter
        className="flex  justify-center py-3"
        data-testid="card-footer">
        <p
          className={`text-sm font-medium flex items-center gap-1 ${
            trend >= 0 ? "text-green-500" : "text-red-500"
          }`}
          data-testid="trend">
          {trend >= 0 ? (
            <Uptrend data-testid="uptrend-icon" />
          ) : (
            <DownTrend data-testid="downtrend-icon" />
          )}
          {Math.abs(trend)}% Since last month
        </p>
      </CardFooter>
    </Card>
  );
};

export default AiDashCard;
