import { TopNav } from "@components/index";
import { useState, useEffect } from "react";
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
    const path = window.location.pathname;
    if (path === "/dashboard") {
      handleClick("/overview");
    }
  },[]);

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
      <Outlet />
    </div>
  );
};

export default Dashboard;
