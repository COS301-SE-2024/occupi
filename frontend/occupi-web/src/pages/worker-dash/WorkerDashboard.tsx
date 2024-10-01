import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Clock, Users, BarChart2, Sunrise, Sunset } from "lucide-react";
import * as workerStats from "WorkerStatsService";
import type { Selection } from "@nextui-org/react";
import {
  ActiveEmployeeCard,
  LeastActiveEmployeeCard,
  WorkRatioChart,
  PeakOfficeHoursChart,
  HoursDashboard,
  AverageHoursChart,
  TopNav,
  AiDashCard,
} from "@components/index";
import { AI_loader } from "@assets/index";

// New individual AiDashCard components
const TotalHoursCard: React.FC<{
  stat: string | null;
  onRemove: () => void;
}> = ({ stat, onRemove }) => (
  <AiDashCard
    title="Total Hours"
    icon={<Clock />}
    stat={stat || "N/A"}
    trend={5}
    onRemove={onRemove}
  />
);

const AverageHoursCard: React.FC<{
  stat: string | null;
  onRemove: () => void;
}> = ({ stat, onRemove }) => (
  <AiDashCard
    title="Average Hours"
    icon={<BarChart2 />}
    stat={stat || "N/A"}
    trend={-2}
    onRemove={onRemove}
  />
);

const WorkRatioCard: React.FC<{
  stat: string | null;
  onRemove: () => void;
}> = ({ stat, onRemove }) => (
  <AiDashCard
    title="Work Ratio"
    icon={<Users />}
    stat={stat || "N/A"}
    trend={3}
    onRemove={onRemove}
  />
);

const ArrivalDepartureCard: React.FC<{
  stat: string | null;
  onRemove: () => void;
}> = ({ stat, onRemove }) => (
  <AiDashCard
    title="Avg Arrival - Departure"
    icon={<Sunrise />}
    stat={stat || "N/A"}
    onRemove={onRemove}
    trend={0}
  />
);

const InOfficeRateCard: React.FC<{
  stat: string | null;
  onRemove: () => void;
}> = ({ stat, onRemove }) => (
  <AiDashCard
    title="In-Office Rate"
    icon={<Sunset />}
    stat={stat || "N/A"}
    trend={-1}
    onRemove={onRemove}
  />
);

interface WorkerStats {
  hours: string | null;
  averageHours: string | null;
  workRatio: string | null;
  peakOfficeHours: string | null;
  arrivalDepartureAverage: string | null;
  inOfficeRate: string | null;
  mostActiveEmployee: string | null;
  leastActiveEmployee: string | null;
}

const WorkerStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<WorkerStats>({
    hours: null,
    averageHours: null,
    workRatio: null,
    peakOfficeHours: null,
    arrivalDepartureAverage: null,
    inOfficeRate: null,
    mostActiveEmployee: null,
    leastActiveEmployee: null,
  });
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState<string[]>(() => {
    const savedVisibleCards = localStorage.getItem("workerStatsVisibleCards");
    return savedVisibleCards
      ? JSON.parse(savedVisibleCards)
      : ["hours", "averageHours"];
  });
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set(visibleCards)
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statNames = [
          "hours",
          "averageHours",
          "workRatio",
          "peakOfficeHours",
          "arrivalDepartureAverage",
          "inOfficeRate",
          "mostActiveEmployee",
          "leastActiveEmployee",
        ] as const;
        const results = await Promise.all(
          statNames.map((stat) => {
            const method = workerStats[
              `get${
                stat.charAt(0).toUpperCase() + stat.slice(1)
              }` as keyof typeof workerStats
            ] as unknown as () => Promise<{ data: [string] }>;
            return method();
          })
        );

        const newStats = statNames.reduce((acc, stat, index) => {
          const result = results[index].data[0];
          acc[stat] = formatStat(stat, result);
          return acc;
        }, {} as WorkerStats);

        setStats(newStats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching worker stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "workerStatsVisibleCards",
      JSON.stringify(visibleCards)
    );
  }, [visibleCards]);

  const formatStat = (stat: string, value: unknown): string => {
    switch (stat) {
      case "hours":
      case "averageHours":
        return typeof value === "object" &&
          value !== null &&
          "overallTotal" in value
          ? (value.overallTotal as number).toFixed(2)
          : "N/A";
      case "workRatio":
        return typeof value === "number"
          ? `${(value * 100).toFixed(2)}%`
          : "N/A";
      case "peakOfficeHours":
        return typeof value === "object" &&
          value !== null &&
          "peakHours" in value
          ? (value.peakHours as string)
          : "N/A";
      case "arrivalDepartureAverage":
        return typeof value === "object" &&
          value !== null &&
          "overallavgArrival" in value &&
          "overallavgDeparture" in value
          ? `${value.overallavgArrival} - ${value.overallavgDeparture}`
          : "N/A";
      case "mostActiveEmployee":
      case "leastActiveEmployee":
        return typeof value === "object" && value !== null && "email" in value
          ? (value.email as string)
          : "N/A";
      default:
        return "N/A";
    }
  };

  const handleAddCard = (cardId: string) => {
    if (!visibleCards.includes(cardId)) {
      setVisibleCards((prev) => [...prev, cardId]);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    setVisibleCards((prev) => prev.filter((id) => id !== cardId));
    setSelectedKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(cardId);
      return newKeys;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center ml-96 justify-center min-h-screen">
      <div className="font-bold flex flex-col items-center">
        <img className="h-96 w-62" src={AI_loader} alt="Loading" />
        <div>Loading Statistics from Occubot...</div>
      </div>
    </div>
    
    
    );
  }

  return (
    <div className=" w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Employee Statistics
            <span className="block text-sm opacity-65 text-text_col_secondary_alt">
              See all Your Employee Statistics from Occubot
            </span>
          </div>
        }
        searchQuery=""
        onChange={() => {}}
      />
      <div className="flex justify-between mb-4">
        <Button
          color="primary"
          className="mt-2 ml-3 px-4 py-2 bg-text_col text-text_col_alt font-semibold rounded-lg transition-colors duration-300 flex items-center"
          onClick={() => {
            setVisibleCards(["hours"]);
            setSelectedKeys(new Set(["hours"]));
          }}
        >
          Reset to Default Layout
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Button
              color="primary"
              className="mr-3 mt-2 px-4 py-2 bg-text_col text-text_col_alt font-semibold rounded-lg transition-colors duration-300 flex items-center"
            >
              Add Card
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Add Card Actions"
            closeOnSelect={false}
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={(keys: Selection) => {
              setSelectedKeys(keys);
              const newVisibleCards = Array.from(keys) as string[];
              setVisibleCards(newVisibleCards);
              newVisibleCards.forEach((cardId) => {
                if (!visibleCards.includes(cardId)) {
                  handleAddCard(cardId);
                }
              });
            }}
          >
            <DropdownItem key="hours" startContent={<Clock />}>
              Total Hours
            </DropdownItem>
            <DropdownItem key="averageHours" startContent={<BarChart2 />}>
              Average Hours
            </DropdownItem>
            <DropdownItem key="workRatio" startContent={<Users />}>
              Work Ratio
            </DropdownItem>
            <DropdownItem
              key="arrivalDepartureAverage"
              startContent={<Sunrise />}
            >
              Avg Arrival - Departure
            </DropdownItem>
            <DropdownItem key="inOfficeRate" startContent={<Sunset />}>
              In-Office Rate
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="mb-2 ml-3 mr-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCards.includes("workRatio") && (
          <WorkRatioCard
            stat={stats.workRatio}
            onRemove={() => handleRemoveCard("workRatio")}
          />
        )}
        {visibleCards.includes("averageHours") && (
          <AverageHoursCard
            stat={stats.averageHours}
            onRemove={() => handleRemoveCard("averageHours")}
          />
        )}
        {visibleCards.includes("arrivalDepartureAverage") && (
          <ArrivalDepartureCard
            stat={stats.arrivalDepartureAverage}
            onRemove={() => handleRemoveCard("arrivalDepartureAverage")}
          />
        )}
        {visibleCards.includes("inOfficeRate") && (
          <InOfficeRateCard
            stat={stats.inOfficeRate}
            onRemove={() => handleRemoveCard("inOfficeRate")}
          />
        )}
      </div>

      <div className="mb-3 ml-3 flex gap-2">
        <div>
          <div className="mb-5">
            <ActiveEmployeeCard />
          </div>
          <LeastActiveEmployeeCard />
        </div>

        <div className="flex gap-2 mr-2">
          <PeakOfficeHoursChart />

          <div className="">
            <div className=" mb-2">
              {visibleCards.includes("hours") && (
                <TotalHoursCard
                  stat={stats.hours}
                  onRemove={() => handleRemoveCard("hours")}
                />
              )}
            </div>

            <WorkRatioChart />
          </div>
        </div>
      </div>

      <div className="flex gap-2 ml-3 mr-3">
        <HoursDashboard />
        <AverageHoursChart />
      </div>
    </div>
  );
};

export default WorkerStatsDashboard;
