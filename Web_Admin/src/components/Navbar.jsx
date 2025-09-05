import { Home, BarChart, Settings, Bell, HelpCircle } from "lucide-react"

export default function Navbar() {
  return (
    <aside className="h-screen w-64 bg-gray-900 text-gray-200 flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-10">
        <div className="h-10 w-10 bg-yellow-400 rounded-xl flex items-center justify-center font-bold text-black">
          L
        </div>
        <span className="text-lg font-bold">LoadSwift</span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-3">
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
          <Home size={18} /> <span>Dashboard</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
          <BarChart size={18} /> <span>Reports</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
          <Settings size={18} /> <span>Settings</span>
        </a>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3">
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
          <Bell size={18} /> <span>Notifications</span>
        </a>
        <a href="#" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-2 rounded-lg">
          <HelpCircle size={18} /> <span>Help</span>
        </a>
      </div>
    </aside>
  )
}
