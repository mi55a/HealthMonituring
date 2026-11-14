
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileDropdown.css";
import {
  Home,
  Settings,
  ChevronDown,
  ClipboardList,
  ChartNoAxesColumn,
  Sparkles,
} from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Today's Report", icon: ClipboardList, path: "/dashboard" },
    { label: "View Health Stats", icon: ChartNoAxesColumn, path: "/health-stats" },
    { label: "AI Assistant", icon: Sparkles, path: "/ai-analysis" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Settings size={19} strokeWidth={2} />
        <span>Profile</span>
        <ChevronDown
          size={17}
          className={isOpen ? "arrow rotated" : "arrow"}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu" role="menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                type="button"
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  navigate(item.path);
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}