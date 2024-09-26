import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";

// Define types
type OccupancyData = {
  date: string;
  occupancy: number;
};

type Benchmarks = {
  averageOccupancy: number;
  optimalOccupancy: number;
  costPerSquareFoot: number;
};

type Recommendation = {
  type: "warning" | "success" | "error" | "info";
  title: string;
  description: string;
};

// Simulated API call to fetch occupancy data
const fetchOccupancyData = (): Promise<OccupancyData[]> => {
  // This would be replaced with an actual API call
  return Promise.resolve([
    { date: "2023-09-01", occupancy: 65 },
    { date: "2023-09-02", occupancy: 70 },
    { date: "2023-09-03", occupancy: 75 },
    { date: "2023-09-04", occupancy: 60 },
    { date: "2023-09-05", occupancy: 80 },
    { date: "2023-09-06", occupancy: 85 },
    { date: "2023-09-07", occupancy: 90 },
  ]);
};

// Simulated API call to fetch industry benchmarks
const fetchIndustryBenchmarks = (): Promise<Benchmarks> => {
  // This would be replaced with an actual API call to a service providing industry data
  return Promise.resolve({
    averageOccupancy: 75,
    optimalOccupancy: 85,
    costPerSquareFoot: 30,
  });
};

const OccupancyRecommendationEngine: React.FC = () => {
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmarks | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchOccupancyData().then(setOccupancyData);
    fetchIndustryBenchmarks().then(setBenchmarks);
  }, []);

  useEffect(() => {
    if (occupancyData.length > 0 && benchmarks) {
      analyzeOccupancy();
    }
  }, [occupancyData, benchmarks]);

  const analyzeOccupancy = () => {
    if (!benchmarks) return;

    const avgOccupancy =
      occupancyData.reduce((sum, day) => sum + day.occupancy, 0) /
      occupancyData.length;
    const newRecommendations: Recommendation[] = [];

    if (avgOccupancy < benchmarks.averageOccupancy) {
      newRecommendations.push({
        type: "warning",
        title: "Below Average Occupancy",
        description: `Your average occupancy (${avgOccupancy.toFixed(
          1
        )}%) is below the industry average (${
          benchmarks.averageOccupancy
        }%). Consider implementing flexible work arrangements or subleasing underutilized space.`,
      });
    } else if (avgOccupancy > benchmarks.optimalOccupancy) {
      newRecommendations.push({
        type: "success",
        title: "High Occupancy",
        description: `Your occupancy (${avgOccupancy.toFixed(
          1
        )}%) is above the optimal level (${
          benchmarks.optimalOccupancy
        }%). This is great for space utilization but ensure it doesn't impact employee comfort or productivity.`,
      });
    }

    if (avgOccupancy < 50) {
      newRecommendations.push({
        type: "error",
        title: "Critically Low Occupancy",
        description:
          "Your occupancy is critically low. Consider downsizing or repurposing unused space to reduce costs.",
      });
    }

    const occupancyTrend =
      occupancyData[occupancyData.length - 1].occupancy -
      occupancyData[0].occupancy;
    if (occupancyTrend > 10) {
      newRecommendations.push({
        type: "info",
        title: "Increasing Occupancy Trend",
        description:
          "Occupancy is trending upwards. Prepare for potential space constraints and consider optimizing layout for higher capacity.",
      });
    } else if (occupancyTrend < -10) {
      newRecommendations.push({
        type: "warning",
        title: "Decreasing Occupancy Trend",
        description:
          "Occupancy is trending downwards. Investigate the cause and consider strategies to increase office attendance or reduce space.",
      });
    }

    setRecommendations(newRecommendations);
  };

  const getIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "warning":
        return <FaExclamationTriangle className="text-yellow-800" />;
      case "success":
        return <FaCheckCircle className="text-green-800" />;
      case "error":
        return <FaTimesCircle className="text-red-800" />;
      case "info":
        return <FaInfoCircle className="text-blue-800" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4 text-text_col_secondary_alt">
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">
            Occupancy Analysis and Recommendations
          </h4>
        </CardHeader>
        <CardBody>
          {recommendations.map((rec, index) => (
            <Card key={index} className={`mb-2 ${getCardColor(rec.type)}`}>
              <CardBody className="flex items-center">
                <div className="ml-2">
                    <div className="flex items-center gap-3">
                    {getIcon(rec.type)}
                    <h5 className="font-semibold"> {rec.title}</h5>
                    </div>
                  <p className="text-text_col_alt">{rec.description}</p>
                </div>
              </CardBody>
            </Card>
          ))}
          {recommendations.length === 0 && (
            <p className="text-text_col_secondary_alt">
              No recommendations at this time. Your occupancy levels appear to
              be within normal ranges.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

// Helper function to get card color based on recommendation type
const getCardColor = (type: Recommendation["type"]): string => {
  switch (type) {
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "error":
      return "bg-red-100 text-red-800";
    case "info":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default OccupancyRecommendationEngine;
