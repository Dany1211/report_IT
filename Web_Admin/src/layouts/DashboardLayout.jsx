import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Home,
  BarChart2,
  FileText,
  Upload,
  Settings,
  Menu,
  Users,
} from "lucide-react";

export default function DashboardLayout() {
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { name: "Home", to: "/", icon: <Home size={20} /> },
    { name: "Analytics", to: "/analytics", icon: <BarChart2 size={20} /> },
    { name: "Reports", to: "/reports", icon: <FileText size={20} /> },
    { name: "Exporting", to: "/exporting", icon: <Upload size={20} /> },
    {
      name: "Department Reports",
      to: "/department-reports",
      icon: <Users size={20} />,
    },
    { name: "Settings", to: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          isExpanded ? "w-64" : "w-20"
        } bg-[#1A202C] text-[#F0F4F8] transition-all duration-300 p-4 flex flex-col shadow-lg`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-6 text-[#F0F4F8] focus:outline-none hover:text-[#D1D8E3]"
        >
          <Menu size={24} />
        </button>

        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#F56565] text-white font-semibold shadow-sm"
                      : "hover:bg-[#4A5568] text-[#D1D8E3]"
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
      <main className="flex-1 bg-[#E8EDF4] p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}