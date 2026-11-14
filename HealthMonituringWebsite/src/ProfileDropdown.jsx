import { useState, useEffect, useRef } from "react";
import {
  Settings,
  ChevronDown,
  ClipboardList,
  ChartNoAxesColumn,
  Sparkles
} from "lucide-react";

export default function ProfileDropdown({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

  const menuItems = [
    {
      label: "Today's Report",
      icon: ClipboardList,
      page: "report"
    },
    {
      label: "View Health Stats",
      icon: ChartNoAxesColumn,
      page: "stats"
    },
    {
      label: "AI Assistant",
      icon: Sparkles,
      page: "assistant"
    },
    {
      label: "Settings",
      icon: Settings,
      page: "settings"
    }
  ];

  return (
    <div className="profile-dropdown" ref={dropdownRef}>

      {/* Profile Button with Settings Icon */}
      <button
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu" role="menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  onNavigate(item.page);
                  setIsOpen(false);
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
