import { LoginForm, OtpPage, Settings, Dashboard, Analysis, Visitation, Faq, AiDashboard, Rooms, AboutPage, SecurityPage,BookingStats ,WorkerStatsDashboard} from "@pages/index";
import { Appearance, OverviewComponent, BookingComponent, PDFReport, ProfileView } from "@components/index";
import { Layout } from "@layouts/index";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import { NotificationsSettings } from "@pages/notificationsSettings/NotificationsSettings";

function App() {
  // Initialize the theme state with system preference
  const [theme, ] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    return savedTheme;
  });

  useEffect(() => {
    const applyTheme = (theme: string ) => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
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
              <Route path="bookings" element={<BookingComponent />} />*attach appropriate component
              <Route path="visitations" element={<Visitation />} />{/**attach appropriate component */}
              <Route path="analysis" element={<Analysis/>} />{}
            </Route>

            <Route path="reports" element={<PDFReport />} />{/**attach appropriate component */}
            <Route path="faq" element={ <Faq/> } />{/**attach appropriate component */}
            <Route path="ai-dashboard" element={<AiDashboard />} />{/**consider making ths its own page */}
           <Route path="rooms" element={<Rooms />} />{/**attach appropriate component */}
           {/* <Route path="notifications" element={<Notifications />} />*attach appropriate component */}
            <Route path="bookingStats" element={<BookingStats />} />{/**attach appropriate component */}
            <Route path="worker-dashboard" element={<WorkerStatsDashboard />} />{/**attach appropriate component */}


           
            <Route path="settings/*" element={<Settings />}>
              <Route path="profile" element={<ProfileView />} />{/**attach appropriate component */}
              <Route path="appearance" element={<Appearance />} />
              <Route path="notifications" element={<NotificationsSettings />} />{/**attach appropriate component */}
              <Route path="security" element={<SecurityPage />} />{/**attach appropriate component */}
              <Route path="about" element={<AboutPage />} />{/**attach appropriate component */}
            </Route>
          </Routes>
        </Layout>}>
        </Route>
      </Routes>
    </Router>
  )
}

export default App