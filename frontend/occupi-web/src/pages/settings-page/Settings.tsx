import { useState } from "react";
import TopNav from "../../components/topNav/TopNav";
import DrawerComponent from "../../components/drawerComponent/DrawerComponent";
const Settings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSettingsClick = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="w-full verflow-auto">
      <TopNav
        mainComponent={
          <div className="text-black font-semibold text-2xl ml-5">
          Settings
          <span className="block text-sm text-gray-500">
            Manage your profile, appearance, and what data is shared with us
          </span>
        </div>
        
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />
          <DrawerComponent/>

    </div>
  );
};

export default Settings;
