// <<<<<<< HEAD
// import { BrowserRouter, Routes, Route } from "react-router-dom"
// import DashboardLayout from "./layouts/DashboardLayout"
// import Home from "./pages/Home"
// import Analytics from "./pages/Analytics"
// import Settings from "./pages/Settings"
// import Reports from "./pages/Reports"

// =======
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import DashboardLayout from "./layouts/DashboardLayout";
// >>>>>>> a7caa0b2cf35c762f361fcc212be01e5089203bd

// // Pages
// import Home from "./pages/Home";
// import Reports from "./pages/Reports";
// import Analytics from "./pages/Analytics";
// // import Notifications from "./pages/Notifications";
// import Settings from "./pages/Settings";
// import LoginPage from "./pages/LoginPage";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Login Route (outside dashboard layout) */}
//         <Route path="/login" element={<LoginPage />} />

//         {/* Dashboard Layout (protected pages) */}
//         <Route element={<DashboardLayout />}>
//           <Route path="/" element={<Home />} />
//           <Route path="/reports" element={<Reports />} />
//           <Route path="/analytics" element={<Analytics />} />
//           {/* <Route path="/notifications" element={<Notifications />} /> */}
//           <Route path="/settings" element={<Settings />} />
// <<<<<<< HEAD
//           <Route path="/Reports" element={<Reports />} />
//         </Routes>
//       </DashboardLayout>
// =======
//         </Route>
//       </Routes>
// >>>>>>> a7caa0b2cf35c762f361fcc212be01e5089203bd
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
// import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage"; // ✅ import signup page
import Reports from "./pages/Reports";
import Exporting from "./pages/Exporting";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes (outside dashboard layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} /> {/* ✅ signup route */}

        {/* Dashboard Layout (protected pages) */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* <Route path="/notifications" element={<Notifications />} /> */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/exporting" element={<Exporting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
