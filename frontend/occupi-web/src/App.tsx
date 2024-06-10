import { LoginForm, OtpPage, Settings, Dashboard} from "@pages/index";
import {Appearance, OverviewComponent} from "@components/index";
import { Layout } from "@layouts/index";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/otp" element={<OtpPage />} />

        <Route path="/*" element={
          <Layout>
          <Routes>
            <Route path="dashboard/*" element={<Dashboard />} >
              <Route path="overview" element={<OverviewComponent />} />
              <Route path="bookings" element={<OverviewComponent />} />{/**attach appropriate component */}
              <Route path="visitations" element={<OverviewComponent />} />{/**attach appropriate component */}
            </Route>
            <Route path="settings/*" element={<Settings />}>
              <Route path="profile" element={<Appearance />} />{/**attach appropriate component */}
              <Route path="appearance" element={<Appearance />} />
              <Route path="privacy" element={<Appearance />} />{/**attach appropriate component */}
              <Route path="help" element={<Appearance />} />{/**attach appropriate component */}
              <Route path="about" element={<Appearance />} />{/**attach appropriate component */}
            </Route>
          </Routes>
        </Layout>}>
        </Route>
      </Routes>
    </Router> 
  )
}

export default App