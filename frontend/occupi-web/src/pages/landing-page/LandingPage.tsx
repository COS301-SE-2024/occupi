import React from "react";
import SideNav from "../../Components/sideNavComponent/SideNav";
import TabComponent from "../../Components/tabComponent/TabComponent";
import SearchBar from "../../Components/searchBarComponent/SearchBar";
import GraphContainer from "../../Components/graphContainer/GraphContainer";
import TopNav from "../../Components/topNav/TopNav";
const LandingPage = () => {
  return (
    <div className="fixed w-full">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-0rem)] overflow-x-auto max-w-[calc(100vh- -5rem)] ">
        {" "}
        {/* Adjust the max height as needed */}
        <div className="flex flex-row gap-16 ml-64 mt-10">
          {" "}
          {/* Added gap-4 for spacing between containers */}
          <div className="-ml-4 mt-10">
            <GraphContainer />
          </div>
          <div className="mt-10">
            <GraphContainer />
          </div>
          {/* <div>
      <GraphContainer />
    </div> */}
        </div>
        <div className="flex flex-row gap-16 ml-60 mt-10">
          <GraphContainer width="500px" height="400px" />
        </div>
        <div className=" ml-60 mt-10  ">
          <GraphContainer width="500px" height="400px" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
