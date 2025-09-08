import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  BarChart2,
  FileText,
  Upload,
  Settings,
  Menu,
} from "lucide-react";

export default function DashboardLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { name: "Home", to: "/", icon: <Home size={20} /> },
    { name: "Analytics", to: "/analytics", icon: <BarChart2 size={20} /> },
    { name: "Reports", to: "/reports", icon: <FileText size={20} /> },
    { name: "Exporting", to: "/exporting", icon: <Upload size={20} /> },
    { name: "Settings", to: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          isExpanded ? "w-64" : "w-20"
        } bg-[#332211] text-white transition-all duration-300 p-4 flex flex-col shadow-lg`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-6 text-white focus:outline-none"
        >
          <Menu size={24} />
        </button>

        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-[#FFA500] text-[#333333] font-semibold shadow-md"
                      : "hover:bg-[#FFE4B5]/20 text-white"
                  }`
                }
              >
                {item.icon}
                <span
                  className={`text-sm font-medium transition-opacity duration-200 ${
                    isExpanded ? "opacity-100" : "opacity-0 hidden"
                  }`}
                >
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
