import { LoginForm, OtpPage, Settings, Dashboard, Faq, AiDashboard, Rooms, AboutPage, SecurityPage, BookingStats, WorkerStatsDashboard, BookingsDashboardPage, ForgotPassword, ResetPassword, LocationPage } from "@pages/index";
import { Appearance, BookingComponent, PDFReport, ProfileView } from "@components/index";
import { Layout } from "@layouts/index";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { NotificationsSettings } from "@pages/notificationsSettings/NotificationsSettings";
import ProtectedRoutes from "@components/protectedRoutes/ProtectedRoutes";

function App() {
  // Initialize the theme state with system preference
  const [theme, ] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
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
  <Routes>
    <Route
      path="/*"
      element={
        <ProtectedRoutes 
          unAuthRoutes={
            <Routes>
              <Route index element={<LoginForm />} />
              <Route path="otp" element={<OtpPage />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          }
          authRoutes={
            <Layout>
              <Routes>
                <Route index path="dashboard" element={<Dashboard />}/>
                <Route path="reports" element={<PDFReport />} />
                <Route path="faq" element={<Faq />} />
                <Route path="ai-dashboard" element={<AiDashboard />} />
                <Route path="rooms" element={<Rooms />} />
                <Route path="booking-statistics/overview" element={<BookingStats />} />
                <Route path="booking-statistics/bookings-dashboard" element={<BookingsDashboardPage />} />
                <Route path="worker-dashboard" element={<WorkerStatsDashboard />} />
                <Route path="employees" element={<BookingComponent />} />
                <Route path="user-locations" element={<LocationPage />} />
                <Route path="settings/*" element={<Settings />}>
                  <Route path="profile" element={<ProfileView />} />
                  <Route path="appearance" element={<Appearance />} />
                  <Route path="notifications" element={<NotificationsSettings />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="about" element={<AboutPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          }
        />
      }
    />
  </Routes>
</Router>
  )
}

export default App