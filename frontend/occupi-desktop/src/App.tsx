import { LoginForm, OtpPage, Settings, Dashboard,Analysis,Visitation,Faq} from "@pages/index";
import {Appearance, OverviewComponent,BookingComponent,PDFReport} from "@components/index";
import { Layout } from "@layouts/index";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', disableContextMenu);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
    };
  }, []);
  
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
              <Route path="bookings" element={<BookingComponent />} />{/**attach appropriate component */}
              <Route path="visitations" element={<Visitation />} />{/**attach appropriate component */}
              <Route path="analysis" element={<Analysis/>} />{}
            </Route>
            <Route path="reports" element={<PDFReport />} />{/**attach appropriate component */}
            <Route path="faq" element={ <Faq/> } />{/**attach appropriate component */}
           
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