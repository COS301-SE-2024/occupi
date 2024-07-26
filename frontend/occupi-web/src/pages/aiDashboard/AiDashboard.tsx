import React, { useState, useEffect } from "react";
import { TopNav,AiDashCard,PredictedCapacityGraph,CapacityComparisonGraph } from "@components/index";

import { FaUsers, FaBed, FaClipboardList, FaCalendarCheck, FaUndo, FaPlus } from "react-icons/fa";
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: 'card1', x: 0, y: 0, w: 3, h: 2 },
    { i: 'card2', x: 3, y: 0, w: 3, h: 2 },
    { i: 'card3', x: 6, y: 0, w: 3, h: 2 },
    { i: 'card4', x: 9, y: 0, w: 3, h: 2 },
    { i: 'graph1', x: 0, y: 2, w: 6, h: 4 },
    { i: 'graph2', x: 6, y: 2, w: 6, h: 4 },
  ]
};

const cardData = [
  { id: 'card1', title: "Office Occupancy", icon: <FaUsers size={24} />, stat: "65%", trend: 3.46 },
  { id: 'card2', title: "Available Desks", icon: <FaBed size={24} />, stat: "89", trend: -2.1 },
  { id: 'card3', title: "Reservations", icon: <FaClipboardList size={24} />, stat: "45", trend: 8.7 },
  { id: 'card4', title: "Check-ins Today", icon: <FaCalendarCheck size={24} />, stat: "23", trend: 3.4 },
];

const AiDashboard: React.FC = () => {
  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedLayouts = localStorage.getItem('dashboardLayouts');
    if (savedLayouts) {
      try {
        return JSON.parse(savedLayouts);
      } catch (error) {
        console.error('Error parsing saved layouts:', error);
      }
    }
    return defaultLayouts;
  });

  const [visibleCards, setVisibleCards] = useState<string[]>(cardData.map(card => card.id));
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
  }, [layouts]);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  };

  const resetToDefaultLayout = () => {
    setLayouts(defaultLayouts);
    setVisibleCards(cardData.map(card => card.id));
    localStorage.setItem('dashboardLayouts', JSON.stringify(defaultLayouts));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveCard = (cardId: string) => {
    setVisibleCards(visibleCards.filter(id => id !== cardId));
  };

  const handleAddCard = (cardId: string) => {
    if (!visibleCards.includes(cardId)) {
      setVisibleCards([...visibleCards, cardId]);
    }
  };

  // Sample data for graphs
  const predictedCapacityData = [
    { day: 'Mon', level: 2 },
    { day: 'Tue', level: 3 },
    { day: 'Wed', level: 4 },
    { day: 'Thu', level: 1 },
    { day: 'Fri', level: 2 },
  ];

  const capacityComparisonData = [
    { day: 'Mon', predicted: 65, actual: 70 },
    { day: 'Tue', predicted: 70, actual: 68 },
    { day: 'Wed', predicted: 80, actual: 82 },
    { day: 'Thu', predicted: 75, actual: 73 },
    { day: 'Fri', predicted: 85, actual: 88 },
  ];

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

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <button
            onClick={resetToDefaultLayout}
            className="px-4 py-2 bg-text_col text-text_col_alt rounded-lg transition-colors duration-300 flex items-center"
          >
            <FaUndo className="mr-2" /> Reset to Default Layout
          </button>
          <div className="flex gap-2">
            {cardData.map(card => (
              !visibleCards.includes(card.id) && (
                <button
                  key={card.id}
                  onClick={() => handleAddCard(card.id)}
                  className="px-4 py-2 bg-text_col text-text_col_alt rounded-lg transition-colors duration-300 flex items-center"
                >
                  <FaPlus className="mr-2" /> Add {card.title}
                </button>
              )
            ))}
          </div>
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
          {cardData.map(card => (
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
          ))}
          <div key="graph1" className="bg-secondary rounded-lg shadow-md p-4">
            <PredictedCapacityGraph  />
          </div>
          <div key="graph2" className="bg-secondary rounded-lg shadow-md p-4">
            <CapacityComparisonGraph data={capacityComparisonData} />
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default AiDashboard;