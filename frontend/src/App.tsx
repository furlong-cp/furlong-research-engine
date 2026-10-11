
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import "./App.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BootIntro from "./components/BootIntro";

export default function App() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(
    location.pathname === "/"
  );

  return (
    <>
      {showIntro && (
        <BootIntro onComplete={() => setShowIntro(false)} />
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={<LoginPage key="login" mode="login" />}
        />
        <Route
          path="/signup"
          element={<LoginPage key="signup" mode="signup" />}
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}