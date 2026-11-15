import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import BodyMap from "./pages/BodyMap";
import AIAnalysis from "./pages/AIAnalysis";
import Settings from "./pages/Settings";
import PhysicalStats from "./pages/Physicalstats";
import MentalStats from "./pages/Mentalstats";

import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health-stats" element={<BodyMap />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/physical-stats" element={<PhysicalStats />} />
        <Route path="/mental-stats" element={<MentalStats />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);