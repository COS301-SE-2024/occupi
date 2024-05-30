import React, { useState } from "react";

const TabComponent = () => {
  const [activeTab, setActiveTab] = useState(2); // Set initial active tab

  const handleTabClick = (tabIndex: React.SetStateAction<number>) => {
    setActiveTab(tabIndex);
  };

  return (
    <div>
      <div role="tablist" className="tabs tabs-boxed tabs-md w-10 bg-transparent ">
        <a
          href="#"
          role="tab"
          className={`tab ${activeTab === 1 ? "tab-active bg-white text-black" : "bg-gray-200 text-black"}`}
          onClick={() => handleTabClick(1)}
        >
          Tab1
        </a>
        <a
          href="#"
          role="tab"
          className={`tab ${activeTab === 2 ? "tab-active bg-white text-black" : "bg-gray-200 text-black"}`}
          onClick={() => handleTabClick(2)}
        >
          Tab2
        </a>
        <a
          href="#"
          role="tab"
          className={`tab ${activeTab === 3 ? "tab-active" : ""}`}
          onClick={() => handleTabClick(3)}
        >
          Tab3
        </a>
      </div>

      
    </div>
  );
};

export default TabComponent;
