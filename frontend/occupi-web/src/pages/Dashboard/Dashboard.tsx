import { TopNav } from "@components/index";
import { useState, useEffect } from "react";
import {
  TabComponent,
} from "@components/index";
import { useNavigate, Outlet } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate("/dashboard" + path);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    handleClick("/overview");
  }, []);

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={<TabComponent setSelectedTab={handleClick} />}
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
      <Outlet />
    </div>
  );
};

export default Dashboard;
