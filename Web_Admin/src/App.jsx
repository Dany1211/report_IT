import { BrowserRouter, Routes, Route } from "react-router-dom"
import DashboardLayout from "./layouts/DashboardLayout"
import Home from "./pages/Home"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"
import Reports from "./pages/Reports"



export default function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/Reports" element={<Reports />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  )
}
