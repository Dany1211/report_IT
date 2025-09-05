import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
// import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route (outside dashboard layout) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Layout (protected pages) */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* <Route path="/notifications" element={<Notifications />} /> */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

