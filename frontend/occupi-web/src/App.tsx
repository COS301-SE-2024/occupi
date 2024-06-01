import "./App.css";
import LoginForm from "./pages/Login/LoginForm";
import OtpPage from "./pages/otp-page/OtpPage";
import SideNav from "./Components/sideNavComponent/SideNav";
import LandingPage from "./pages/landing-page/LandingPage";
import TabComponent from "./Components/tabComponent/TabComponent";
import Routers from "./Routers";
import SearchBar from "./Components/searchBarComponent/SearchBar";
import Settings from "./pages/settings-page/Settings";
import Layout from "./Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <div>
      {/* <Routers /> */}
      {/* <LoginForm /> */}
      {/* <OtpComponent /> */}
      {/* <OtpPage /> */}
      {/* <SideNav /> */}
      <LandingPage />
      {/* <div className='ml-5'>

</div> */}
      {/* <TabComponent /> */}

      {/* <SearchBar /> */}
      {/* <Settings /> */}

      {/* <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router> */}
    </div>
  );
}

export default App;
