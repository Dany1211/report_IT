// import { NavLink } from "react-router-dom"
// // import 

// export default function DashboardLayout({ children }) {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-900 text-white p-4">
//         <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
//         <ul className="space-y-4">
//           <li>
//             <NavLink to="/" className="hover:text-yellow-300">Home</NavLink>
//           </li>
//           <li>
//             <NavLink to="/analytics" className="hover:text-yellow-300">Analytics</NavLink>
//           </li>
//           <li>
//             <NavLink to="/settings" className="hover:text-yellow-300">Settings</NavLink>
//           </li>
//         </ul>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
//         {children}
//       </main>
//     </div>
//   )
// }


// import { NavLink, Outlet } from "react-router-dom"
// // import 

// export default function DashboardLayout() {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-900 text-white p-4">
//         <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
//         <ul className="space-y-4">
//           <li>
//             <NavLink to="/" className="hover:text-yellow-300">Home</NavLink>
//           </li>
//           <li>
//             <NavLink to="/analytics" className="hover:text-yellow-300">Analytics</NavLink>
//           </li>
//           <li>
//             <NavLink to="/Reports" className="hover:text-yellow-300">Reports</NavLink>
//           </li>
//           <li>
//             <NavLink to="/exporting" className="hover:text-yellow-300">Exporting</NavLink>
//           </li>
//           <li>
//             <NavLink to="/settings" className="hover:text-yellow-300">Settings</NavLink>
//           </li>
//         </ul>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
//         <Outlet />
//       </main>
//     </div>
//   )
// }

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
        } bg-gray-900 text-white transition-all duration-300 p-4 flex flex-col`}
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
                      ? "bg-yellow-500 text-black font-semibold"
                      : "hover:bg-yellow-500/20 text-white"
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
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
