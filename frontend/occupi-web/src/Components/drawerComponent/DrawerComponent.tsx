interface DrawerComponentProps {
  isOpen: boolean;
  onClose: () => void;

}

const DrawerComponent = ({ isOpen, onClose }: DrawerComponentProps) => {
  return (
    <div className={`drawer drawer-end ${isOpen ? 'drawer-open' : ''}`}>
      <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={isOpen} readOnly />
      <div className="drawer-content">
        {/* Page content here */}
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay" onClick={onClose}></label>
        <div className="menu p-4 w-80 bg-base-100 text-base-content">
          <div className="menu-title">
            <span className="text-lg font-bold">Menu</span>
          </div>
          <ul className="menu-items">
            <li>
              <a className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-200">
                <div className="w-6 h-6">
                  <img
                    src="../assets/images/e7224eda-d51b-473a-9d51-d4aeb56ebbbb.png"
                    alt="Profile Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base font-medium">Profile</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                <div className="w-6 h-6">
                  <img
                    src="../assets/images/bb86e214-20d9-49e1-81df-85eb53449fda.png"
                    alt="Appearance Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base font-medium">Appearance</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-200">
                <div className="w-6 h-6">
                  <img
                    src="../assets/images/17d9a8a6-6bd2-479d-94d4-5c7aab96b5b2.png"
                    alt="Privacy Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base font-medium">Privacy</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-200">
                <div className="w-6 h-6">
                  <img
                    src="../assets/images/b39442ab-9a28-412f-bb3e-60895b0890f7.png"
                    alt="Help Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base font-medium">Help</span>
              </a>
            </li>
            <li>
              <a className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-200">
                <div className="w-6 h-6">
                  <img
                    src="../assets/images/7f575c6a-f072-4174-874d-db95967b442d.png"
                    alt="About Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-base font-medium">About</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DrawerComponent;