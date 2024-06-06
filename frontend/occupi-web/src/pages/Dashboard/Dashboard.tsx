import { TopNav } from "@components/index";
import { useState } from "react";
import { GraphContainer } from "@components/index";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-full">
      <TopNav searchQuery={searchQuery} onChange={handleInputChange} />

      <div>

      <div className="flex gap-10 ml-10 mt-10">
      <GraphContainer />
        <GraphContainer />
        <GraphContainer />
      </div>
      <div className="flex gap-10 mt-20 ml-10">
        <GraphContainer width="39.063vw" height="50.063vw"/>
        <GraphContainer width="39.063vw" height="50.063vw"/>

      </div>


      </div>
     
    </div>
  );
};

export default Dashboard;
