import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/LandingPage";
import LoginForm from "./pages/Login/LoginForm";

const Routers = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/landing" element={<LandingPage />} />
    </Routes>
  </Router>
  );
};

export default Routers;
