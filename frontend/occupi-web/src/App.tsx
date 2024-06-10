import { LoginForm, OtpPage, Settings, Dashboard} from "@pages/index";
import {Appearance} from "@components/index";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="settings/*" element={<Settings />}>
              <Route path="appearance" element={<Appearance />} />
            </Route>
          </Routes>
        </Layout>}>
        </Route>
      </Routes>
    </Router> 
  )
}

export default App