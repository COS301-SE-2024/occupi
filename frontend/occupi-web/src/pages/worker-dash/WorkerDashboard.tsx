import React, { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import {
  Clock,
  Users,
  BarChart2,
  Sunrise,
  Sunset,
  User,
  UserMinus,
} from "lucide-react";
import * as workerStats from "WorkerStatsService";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Selection } from "@nextui-org/react";
import {
  AiDashCard,
  ActiveEmployeeCard,
  LeastActiveEmployeeCard,
  WorkRatioChart,
  PeakOfficeHoursChart,
  HoursDashboard,
  AverageHoursChart,
  TopNav,
} from "@components/index";

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultVisibleCards = [
  "hours",
  "averageHours",
  "workRatio",
  "peakOfficeHours",
];

const defaultLayouts: Layouts = {
  lg: defaultVisibleCards.map((id, index) => ({
    i: id,
    x: index * 3,
    y: 0,
    w: 3,
    h: 2,
  })),
};

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
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedLayouts = localStorage.getItem("workerStatsDashboardLayouts");
    return savedLayouts ? JSON.parse(savedLayouts) : defaultLayouts;
  });
  const [visibleCards, setVisibleCards] = useState<string[]>(() => {
    const savedVisibleCards = localStorage.getItem("workerStatsVisibleCards");
    return savedVisibleCards
      ? JSON.parse(savedVisibleCards)
      : defaultVisibleCards;
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
            const method = workerStats[`get${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof typeof workerStats] as unknown as () => Promise<{ data: [string] }>;
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
      "workerStatsDashboardLayouts",
      JSON.stringify(layouts)
    );
    localStorage.setItem(
      "workerStatsVisibleCards",
      JSON.stringify(visibleCards)
    );
  }, [layouts, visibleCards]);

  const formatStat = (stat: string, value: unknown): string => {
    switch (stat) {
      case "hours":
      case "averageHours":
        return typeof value === "object" && value !== null && "overallTotal" in value
          ? (value.overallTotal as number).toFixed(2)
          : "N/A";
      case "workRatio":
        return typeof value === "number" ? `${(value * 100).toFixed(2)}%` : "N/A";
      case "peakOfficeHours":
        return typeof value === "object" && value !== null && "peakHours" in value
          ? value.peakHours as string
          : "N/A";
      case "arrivalDepartureAverage":
        return typeof value === "object" && value !== null &&
               "overallavgArrival" in value && "overallavgDeparture" in value
          ? `${value.overallavgArrival} - ${value.overallavgDeparture}`
          : "N/A";
      case "mostActiveEmployee":
      case "leastActiveEmployee":
        return typeof value === "object" && value !== null && "email" in value
          ? value.email as string
          : "N/A";
      default:
        return "N/A";
    }
  };

  const onLayoutChange = (_currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  };

  const handleAddCard = (cardId: string) => {
    if (!visibleCards.includes(cardId)) {
      setVisibleCards((prev) => [...prev, cardId]);
      setLayouts((prev) => ({
        ...prev,
        lg: [...prev.lg, { i: cardId, x: 0, y: Infinity, w: 3, h: 2 }],
      }));
    }
  };

  const handleRemoveCard = (cardId: string) => {
    setVisibleCards((prev) => prev.filter((id) => id !== cardId));
    setSelectedKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(cardId);
      return newKeys;
    });
    setLayouts((prev) => ({
      ...prev,
      lg: prev.lg.filter((item) => item.i !== cardId),
    }));
  };

  if (loading) {
    return <Spinner>Loading stats...</Spinner>;
  }

  const cardData = [
    {
      id: "hours",
      title: "Total Hours",
      icon: <Clock />,
      stat: stats.hours,
      trend: 5,
    },
    {
      id: "averageHours",
      title: "Average Hours",
      icon: <BarChart2 />,
      stat: stats.averageHours,
      trend: -2,
    },
    {
      id: "workRatio",
      title: "Work Ratio",
      icon: <Users />,
      stat: stats.workRatio,
      trend: 3,
    },
    {
      id: "peakOfficeHours",
      title: "Peak Office Hours",
      icon: <Sunrise />,
      stat: stats.peakOfficeHours,
      trend: 0,
    },
    {
      id: "arrivalDepartureAverage",
      title: "Avg Arrival - Departure",
      icon: <Sunrise />,
      stat: stats.arrivalDepartureAverage,
      trend: 1,
    },
    {
      id: "inOfficeRate",
      title: "In-Office Rate",
      icon: <Sunset />,
      stat: stats.inOfficeRate,
      trend: -1,
    },
    {
      id: "mostActiveEmployee",
      title: "Most Active Employee",
      icon: <User />,
      stat: stats.mostActiveEmployee,
      trend: 2,
    },
    {
      id: "leastActiveEmployee",
      title: "Least Active Employee",
      icon: <UserMinus />,
      stat: stats.leastActiveEmployee,
      trend: -3,
    },
  ];

  return (
    <div className="w-full overflow-auto">
       <TopNav
        mainComponent={<div className="text-text_col font-semibold text-2xl ml-5">
          Employee Statistics
          <span className="block text-sm opacity-65  text-text_col_secondary_alt ">
            See all Your Employee Statistics from Occubot
          </span>
        </div>} searchQuery={""} onChange={function (): void {
          throw new Error("Function not implemented.");
        } }        
      />
      <div className="flex justify-between mb-4">
        <Button
          color="primary"
          onClick={() => {
            setLayouts(defaultLayouts);
            setVisibleCards(defaultVisibleCards);
            setSelectedKeys(new Set(defaultVisibleCards));
          }}
        >
          Reset to Default Layout
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Button color="primary">Add Card</Button>
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
            {cardData.map((card) => (
              <DropdownItem key={card.id} startContent={card.icon}>
                {card.title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        margin={[20, 20]}
      >
        {cardData.map(
          (card) =>
            visibleCards.includes(card.id) && (
              <div key={card.id}>
                <AiDashCard
                  title={card.title}
                  icon={card.icon}
                  stat={card.stat || "N/A"}
                  trend={card.trend}
                  onRemove={() => handleRemoveCard(card.id)}
                />
              </div>
            )
        )}
      </ResponsiveGridLayout>

      <div className="mb-3 ml-5 flex gap-5 ">
        <div>
          <div className=" mb-5">
            <ActiveEmployeeCard />
          </div>
          <LeastActiveEmployeeCard />
        </div>

        <div className="flex gap-6 ">
          <PeakOfficeHoursChart />
          <HoursDashboard />
          <AverageHoursChart />
          <WorkRatioChart />
        </div>
      </div>
    </div>
  );
};

export default WorkerStatsDashboard;