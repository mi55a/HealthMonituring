
import { useState } from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

const alertStates = {
  safe: {
    label: "Environment: Safe",
    message: "No environmental hazards detected.",
    icon: ShieldCheck,
  },
  caution: {
    label: "Environment: Caution",
    message: "Potential environmental hazard detected.",
    icon: AlertTriangle,
  },
  danger: {
    label: "Environment: Danger",
    message: "Significant environmental hazard detected.",
    icon: AlertTriangle,
  },
};

export default function WelcomePage() {
  const [showAlerts, setShowAlerts] = useState(false);
  const navigate = useNavigate();
  // Demo status. Replace with actual sensor data later.
  const environmentStatus = "safe";

  const currentAlert = alertStates[environmentStatus];
  const AlertIcon = currentAlert.icon;

  
  const handleNavigation = (page) => {
    const routes = {
      dashboard: "/dashboard",
      report: "/dashboard",
      assistant: "/ai-analysis",
      settings: "/settings",
    };

    if (routes[page]) {
      navigate(routes[page]);
    }
  };


  return (
    <div className="welcome-page">

      {/* Header */}
      <header className="welcome-header">

        {/* Profile Dropdown */}
        <div className="header-left">
          <ProfileDropdown onNavigate={handleNavigation} />
        </div>

        {/* Environmental Alerts */}
        <div className="alerts-container">
          <button
            type="button"
            className={`welcome-alerts alert-${environmentStatus}`}
            onClick={() => setShowAlerts(!showAlerts)}
            aria-expanded={showAlerts}
            aria-controls="environment-alert-details"
          >
            <AlertIcon size={18} />
            <span>{currentAlert.label}</span>
          </button>

          {showAlerts && (
            <div
              className="alerts-message"
              id="environment-alert-details"
            >
              <div className="alerts-title">
                <AlertIcon size={18} />
                <span>Environmental Status</span>
              </div>

              <p className="alerts-description">
                {currentAlert.message}
              </p>

              <div
                className={`alerts-status status-${environmentStatus}`}
              >
                <span className="status-dot" />
                <span>{currentAlert.label}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Welcome Section */}
      <main className="welcome-content">

        {/* Cosmic AstroHealth Logo */}
        <div className="cosmic-logo">

          {/* Thin Cosmic Orbit */}
          <svg
            className="cosmic-orbit"
            viewBox="0 0 600 230"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="orbitGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#C7E4FF" />
                <stop offset="50%" stopColor="#69B6F5" />
                <stop offset="100%" stopColor="#C7E4FF" />
              </linearGradient>
            </defs>

            <ellipse
              cx="300"
              cy="115"
              rx="275"
              ry="65"
              transform="rotate(-12 300 115)"
              fill="none"
              stroke="url(#orbitGradient)"
              strokeWidth="2.5"
            />
          </svg>

          {/* Golden Stars */}
          <svg
            className="cosmic-star star-one"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
              fill="#F4C95D"
            />
          </svg>

          <svg
            className="cosmic-star star-two"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
              fill="#F4C95D"
            />
          </svg>

          <svg
            className="cosmic-star star-three"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
              fill="#F4C95D"
            />
          </svg>

          {/* AstroHealth Title */}
          <h1 className="brand-title">
            <span className="brand-astro">Astro</span>
            <span className="brand-health">Health</span>
          </h1>
        </div>

        {/* Welcome Message */}
        <p className="welcome-subtitle">
          Welcome, Astronaut!
        </p>

        {/* Get Started Button */}
        <button
          type="button"
          className="get-started-btn"
          onClick={() => handleNavigation("dashboard")}
        >
          Get Started
        </button>
      </main>
    </div>
  );
}
