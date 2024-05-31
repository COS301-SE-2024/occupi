//import React from "react";
import SideNav from "../../Components/sideNavComponent/SideNav";
import TabComponent from "../../Components/tabComponent/TabComponent";
import SearchBar from "../../Components/searchBarComponent/SearchBar";
import GraphContainer from "../../Components/graphContainer/GraphContainer";

const LandingPage = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div className="flex flex-col w-full">
        {/* GraphContainer (Right side with space) */}
    

        {/* TabComponent (Left of Sidebar on large screens, below on small screens) */}
        <div className="lg:ml-64 w-full lg:w-auto">
          <TabComponent />
        </div>

        {/* SearchBar (Top Right Corner) */}
        <div className="lg:ml-auto mb-4 lg:mb-4">
          <SearchBar />
        </div>

        <div className="ml-auto mr-6">
          <GraphContainer />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
