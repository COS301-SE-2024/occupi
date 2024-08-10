import {
  LoginForm,
  OtpPage,
  Settings,
  Dashboard,
  Analysis,
  Visitation,
  Faq,
  AiDashboard,
  Rooms,
} from "@pages/index";
import {
  Appearance,
  OverviewComponent,
  BookingComponent,
  PDFReport,
} from "@components/index";
import { Layout } from "@layouts/index";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoutes from "@components/protectedRoutes/ProtectedRoutes";
import { FaroRoutes } from '@grafana/faro-react';

function App() {
  // Initialize the theme state with system preference
  const [theme] = useState(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    return savedTheme;
  });

  useEffect(() => {
    const applyTheme = (theme: string) => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        document.documentElement.classList.toggle(
          "dark",
          systemTheme === "dark"
        );
      } else {
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <Router>
        <FaroRoutes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoutes>
                  <Layout>
                    <Routes>
                      <Route path="dashboard/*" element={<Dashboard />}>
                        <Route path="overview" element={<OverviewComponent />} />
                        <Route path="bookings" element={<BookingComponent />} />
                        <Route path="visitations" element={<Visitation />} />
                        <Route path="analysis" element={<Analysis />} />
                      </Route>

                      <Route path="reports" element={<PDFReport />} />
                      <Route path="faq" element={<Faq />} />
                      <Route path="ai-dashboard" element={<AiDashboard />} />
                      <Route path="rooms" element={<Rooms />} />

                      <Route path="settings/*" element={<Settings />}>
                        <Route path="profile" element={<Appearance />} />
                        <Route path="appearance" element={<Appearance />} />
                        <Route path="privacy" element={<Appearance />} />
                        <Route path="help" element={<Appearance />} />
                        <Route path="about" element={<Appearance />} />
                      </Route>
                    </Routes>
                  </Layout>
                </ProtectedRoutes>
              }
            />
        </FaroRoutes>
      </Router>
  );
}

export default App;
