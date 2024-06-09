import React, { useState } from "react";

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState(2); // Set initial active tab

  const handleTabClick = (tabIndex: React.SetStateAction<number>) => {
    setActiveTab(tabIndex);
  };

  return (
    <div>
      <div role="tablist" className="tabs tabs-boxed tabs-lg 098  ">
        <a
          href="#"
          role="tab"
          className={`tab ${activeTab === 1 ? " bg-white text-black" : "bg-gray-200 text-black"}`}
          onClick={() => handleTabClick(1)}
        >
          Tab1
        </a>
        <a
          href="#"
          role="tab"
          className={`tab ${activeTab === 2 ? " bg-white text-black" : "bg-gray-200 text-black"}`}
          onClick={() => handleTabClick(2)}
        >
          Tab2
        </a>
        <a
          href="#"
          role="tab"
          className={`tab ${activeTab === 3 ?  " bg-white text-black" : "bg-gray-200 text-black"}`}
          onClick={() => handleTabClick(3)}
        >
          Tab3
        </a>
      </div>

      
    </div>
  );
};

export default TabComponent;
