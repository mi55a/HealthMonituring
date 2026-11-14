import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import AIAnalysis from "./pages/AIAnalysis";

import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
