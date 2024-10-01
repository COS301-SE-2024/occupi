import React, { useState, useEffect } from "react";
import {
  TopNav,
  AiDashCard,
  PredictedCapacityGraph,
  CapacityComparisonGraph,
  HourlyPredictionGraph,
  HourlyComparisonGraph,
  RecommendationsModal,
} from "@components/index";
import {
  FaUsers,
  FaBed,
  FaClipboardList,
  FaCalendarCheck,
  FaUndo,
  FaPlus,
} from "react-icons/fa";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import * as WorkerStatsService from "WorkerStatsService";
const ResponsiveGridLayout = WidthProvider(Responsive);
import { useCentrifugeCounter } from "CentrifugoService";
import axios from "axios";

const AiDashboard: React.FC = () => {
  const counter = useCentrifugeCounter();
  const [workRatio, setWorkRatio] = useState<number | null>(null);
  const [currentBookings, setCurrentBookings] = useState<number | null>(null);
  const [totalMaxCapacity, setTotalMaxCapacity] = useState<number | null>(null);
  const [totalBookings, setTotalBookings] = useState<number | null>(null);

  useEffect(() => {
    const fetchWorkRatio = async () => {
      try {
        const response = await WorkerStatsService.getWorkRatio({});
        if (response.data && response.data.length > 0) {
          const overallRatio = (response.data as { ratio: number }[])[0].ratio;
          setWorkRatio(overallRatio);
        }
      } catch (error) {
        console.error("Error fetching work ratio:", error);
      }
    };

    const fetchCurrentBookings = async () => {
      try {
        const response = await axios.get("/analytics/bookings-current");
        if (response.data && response.data.meta) {
          setCurrentBookings(response.data.meta.totalResults);
        }
      } catch (error) {
        console.error("Error fetching current bookings:", error);
      }
    };


    const fetchTotalCapacityAndBookings = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          fetch("/api/view-rooms"),
          fetch("/analytics/top-bookings"),
        ]);

        if (!roomsResponse.ok || !bookingsResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const roomsData = await roomsResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (!Array.isArray(roomsData.data) || !Array.isArray(bookingsData.data)) {
          throw new Error("Data is not in the expected format");
        }

        let totalMaxCapacity = 0;
        let totalBookings = 0;

        roomsData.data.forEach((room: { maxOccupancy?: number }) => {
          totalMaxCapacity += room.maxOccupancy || 0;
        });

        bookingsData.data.forEach((booking: { count: number }) => {
          totalBookings += booking.count;
        });

        setTotalMaxCapacity(totalMaxCapacity);
        setTotalBookings(totalBookings);
      } catch (error) {
        console.error("Error fetching total capacity and bookings:", error);
      }
    };

    fetchWorkRatio();
    fetchCurrentBookings();
    fetchTotalCapacityAndBookings();

  }, []);

  const defaultLayouts: Layouts = {
    lg: [
      { i: "card1", x: 0, y: 0, w: 3, h: 2 },
      { i: "card2", x: 3, y: 0, w: 3, h: 2 },
      { i: "card3", x: 6, y: 0, w: 3, h: 2 },
      { i: "card4", x: 9, y: 0, w: 3, h: 2 },
      { i: "graph1", x: 0, y: 2, w: 6, h: 4 },
      { i: "graph2", x: 6, y: 2, w: 6, h: 4 },
      { i: "hourlyPrediction", x: 0, y: 6, w: 12, h: 5 },
      { i: "hourlyCapacity", x: 0, y: 11, w: 12, h: 5 },
    ],
    sm: [
      { i: "card1", x: 0, y: 0, w: 6, h: 2 }, // Wider on small screens
      { i: "card2", x: 0, y: 2, w: 6, h: 2 },
      { i: "card3", x: 0, y: 4, w: 6, h: 2 },
      { i: "card4", x: 0, y: 6, w: 6, h: 2 },
      { i: "graph1", x: 0, y: 8, w: 6, h: 4 },
      { i: "graph2", x: 0, y: 12, w: 6, h: 4 },
      { i: "hourlyPrediction", x: 0, y: 16, w: 6, h: 5 },
      { i: "hourlyCapacity", x: 0, y: 21, w: 6, h: 5 },
    ],
    xxs: [
      { i: "card1", x: 0, y: 0, w: 1, h: 2 }, // 1 column layout on very small screens
      { i: "card2", x: 0, y: 2, w: 1, h: 2 },
      { i: "card3", x: 0, y: 4, w: 1, h: 2 },
      { i: "card4", x: 0, y: 6, w: 1, h: 2 },
      { i: "graph1", x: 0, y: 8, w: 1, h: 4 },
      { i: "graph2", x: 0, y: 12, w: 1, h: 4 },
      { i: "hourlyPrediction", x: 0, y: 16, w: 1, h: 5 },
      { i: "hourlyCapacity", x: 0, y: 21, w: 1, h: 5 },
    ],
  };

  const cardData = [
    {
      id: "card1",
      title: "Office Occupancy",
      icon: <FaUsers size={24} color="white" />,
      stat: workRatio ? `${(workRatio * 10).toFixed(2)}%` : "Loading...",
      trend: 3.46,
    },
    {
      id: "card2",
      title: "Available Space",
      icon: <FaBed size={24} color="white" />,
      stat: totalMaxCapacity && totalBookings
      ? `${totalBookings}/${totalMaxCapacity}`
      : "Loading...",      trend: -2.1,
    },
    {
      id: "card3",
      title: "Bookings",
      icon: <FaClipboardList size={24} color="white" />,
      stat: currentBookings !== null ? `${currentBookings}` : "Loading...",
      trend: 8.7,
    },
    {
      id: "card4",
      title: "Check-ins Today",
      icon: <FaCalendarCheck size={24} color="white" />,
      stat: `${counter}`,
      trend: 3.4,
    },
  ];

  const originalCardLayouts: { [key: string]: Layout } = {
    card1: { i: "card1", x: 0, y: 0, w: 3, h: 2 },
    card2: { i: "card2", x: 3, y: 0, w: 3, h: 2 },
    card3: { i: "card3", x: 6, y: 0, w: 3, h: 2 },
    card4: { i: "card4", x: 9, y: 0, w: 3, h: 2 },
  };

  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedLayouts = localStorage.getItem("dashboardLayouts");
    if (savedLayouts) {
      try {
        return JSON.parse(savedLayouts);
      } catch (error) {
        console.error("Error parsing saved layouts:", error);
      }
    }
    return defaultLayouts;
  });

  const [visibleCards, setVisibleCards] = useState<string[]>(() => {
    const savedVisibleCards = localStorage.getItem("visibleCards");
    if (savedVisibleCards) {
      try {
        return JSON.parse(savedVisibleCards);
      } catch (error) {
        console.error("Error parsing saved visible cards:", error);
      }
    }
    return cardData.map((card) => card.id);
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("dashboardLayouts", JSON.stringify(layouts));
    localStorage.setItem("visibleCards", JSON.stringify(visibleCards));
  }, [layouts, visibleCards]);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    const newVisibleCards = currentLayout
      .map((item: Layout) => item.i)
      .filter((id: string) => cardData.some((card) => card.id === id));
    setVisibleCards(newVisibleCards);
  };

  const resetToDefaultLayout = () => {
    setLayouts(defaultLayouts);
    setVisibleCards(cardData.map((card) => card.id));
    localStorage.setItem("dashboardLayouts", JSON.stringify(defaultLayouts));
    localStorage.setItem(
      "visibleCards",
      JSON.stringify(cardData.map((card) => card.id))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveCard = (cardId: string) => {
    setVisibleCards((prev) => prev.filter((id) => id !== cardId));

    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach((breakpoint) => {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(
        (item) => item.i !== cardId
      );
    });
    setLayouts(newLayouts);
  };

  const handleAddCard = (cardId: string) => {
    if (!visibleCards.includes(cardId)) {
      setVisibleCards((prev) => [...prev, cardId]);

      const newLayouts = { ...layouts };
      Object.keys(newLayouts).forEach((breakpoint) => {
        newLayouts[breakpoint] = [
          ...newLayouts[breakpoint],
          originalCardLayouts[cardId] ||
            defaultLayouts.lg.find((item: Layout) => item.i === cardId) || {
              i: cardId,
              x: 0,
              y: 0,
              w: 3,
              h: 2,
            },
        ];
      });
      setLayouts(newLayouts);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            AI Analysis
            <span className="block text-sm opacity-65 text-text_col">
              Leverage the power of AI to Analyse office trends
            </span>
          </div>
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />

      {/* Add Recommendations and Reset to Default Buttons */}
      <div className="flex justify-between mb-4 px-8 pt-6 pb-2">
        {/* Left: Get Recommendations Button */}
        <button
          className="px-4 py-2 bg-[#9bfb2d] hover:bg-[#7ddd3d] text-black rounded-lg transition-colors duration-300 font-semibold"
          onClick={() => {
            console.log("Opening Modal");
            setIsModalOpen(true);
          }}
        >
          Get Recommendations
        </button>

        {/* Right: Reset to Default Layout Button */}
        <button
          onClick={resetToDefaultLayout}
          className="px-4 py-2 bg-text_col text-text_col_alt font-semibold rounded-lg transition-colors duration-300 flex items-center"
        >
          <FaUndo className="mr-2" /> Reset to Default Layout
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            {cardData.map(
              (card) =>
                !visibleCards.includes(card.id) && (
                  <button
                    key={card.id}
                    onClick={() => handleAddCard(card.id)}
                    className="px-4 py-2 bg-text_col text-text_col_alt rounded-lg transition-colors duration-300 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add {card.title}
                  </button>
                )
            )}
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 1 }}
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
                    stat={card.stat}
                    trend={card.trend}
                    onRemove={() => handleRemoveCard(card.id)}
                  />
                </div>
              )
          )}
          <div key="graph1" className="bg-secondary rounded-lg shadow-md p-4">
            <PredictedCapacityGraph />
          </div>
          <div key="graph2" className="bg-secondary rounded-lg shadow-md p-4">
            <CapacityComparisonGraph />
          </div>
          <div
            key="hourlyPrediction"
            className="bg-secondary rounded-lg shadow-md p-4"
          >
            <HourlyPredictionGraph />
          </div>
          <div
            key="hourlyCapacity"
            className="bg-secondary rounded-lg shadow-md p-4"
          >
            <HourlyComparisonGraph />
          </div>
        </ResponsiveGridLayout>
      </div>
      {isModalOpen && (
        <RecommendationsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AiDashboard;
