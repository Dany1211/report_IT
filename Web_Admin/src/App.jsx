import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";
import Reports from "./pages/Reports";
import Exporting from "./pages/Exporting";
import DepartmentReports from "./pages/DepartmentReports";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes (outside dashboard layout) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Layout (protected pages) */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/exporting" element={<Exporting />} />
            <Route path="/department-reports" element={<DepartmentReports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
