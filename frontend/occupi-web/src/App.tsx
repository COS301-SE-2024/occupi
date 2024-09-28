import { LoginForm, OtpPage, Settings, Dashboard, Faq, AiDashboard, Rooms, AboutPage, SecurityPage, BookingStats, WorkerStatsDashboard, BookingsDashboardPage, ForgotPassword, ResetPassword } from "@pages/index";
import { Appearance, OverviewComponent, BookingComponent, PDFReport, ProfileView } from "@components/index";
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
  const [isAuthenticated] = useState(() => {
    // Retrieve user storage from localStorage
    const userStorage = localStorage.getItem("user-storage");

    // Parse the userStorage if it exists
    if (userStorage) {
      const parsedUserStorage = JSON.parse(userStorage);
      // Check if the email in userDetails is null or empty
      return parsedUserStorage?.state?.userDetails?.email ? true : false;
    }

    return false;
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
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard/overview" />
            ) : (
              <LoginForm />
            )
          }
        />
        <Route
          path="/otp"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard/overview" />
            ) : (
              <OtpPage />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard/overview" />
            ) : (
              <ForgotPassword />
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard/overview" />
            ) : (
              <ResetPassword />
            )
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoutes>
              <Layout>
              <Routes>
                <Route path="dashboard/*" element={<Dashboard />} >
                  <Route path="overview" element={<OverviewComponent />} />
                </Route>



                <Route path="reports" element={<PDFReport />} />{/**attach appropriate component */}
                <Route path="faq" element={ <Faq/> } />{/**attach appropriate component */}
                <Route path="ai-dashboard" element={<AiDashboard />} />{/**consider making ths its own page */}
              <Route path="rooms" element={<Rooms />} />{/**attach appropriate component */}
              {/* <Route path="notifications" element={<Notifications />} />*attach appropriate component */}
                <Route path="bookingStats" element={<BookingStats />} />{/**attach appropriate component */}
                <Route path="worker-dashboard" element={<WorkerStatsDashboard />} />{/**attach appropriate component */}
                <Route path="bookings" element={<BookingComponent />} />*attach appropriate component
                {/* <Route path="bookingsDashboard" element={<BookingsDashboard />} />*attach appropriate component */}


                <Route path="bookingStats/*" element={<BookingsDashboardPage />} >
                {/* <Route path="bookings" element={<BookingComponent />} />*attach appropriate component */}

                </Route>



              
                <Route path="settings/*" element={<Settings />}>
                  <Route path="profile" element={<ProfileView />} />{/**attach appropriate component */}
                  <Route path="appearance" element={<Appearance />} />
                  <Route path="notifications" element={<NotificationsSettings />} />{/**attach appropriate component */}
                  <Route path="security" element={<SecurityPage />} />{/**attach appropriate component */}
                  <Route path="about" element={<AboutPage />} />{/**attach appropriate component */}
                </Route>
              </Routes>
            </Layout>
            </ProtectedRoutes>}>
        </Route>
    </Router>
  )
}

export default App