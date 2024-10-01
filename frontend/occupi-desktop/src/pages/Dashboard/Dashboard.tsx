import { OverviewComponent, TopNav } from "@components/index";
import { useState } from "react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div data-testid='dashboard' className="w-full overflow-auto">
         <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Overview
            <span className="block text-sm opacity-65  text-text_col_secondary_alt ">
            See your Statistics at a glance
          </span>
        </div>
        
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      <OverviewComponent />
    </div>
  );
};

export default Dashboard;
