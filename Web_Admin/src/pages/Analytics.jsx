// import { useState, useEffect, useRef } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import {
//   BarChart, Bar,
//   CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
// } from "recharts";
// import { format } from "date-fns";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// export default function Analytics() {
//   const [reports, setReports] = useState([]);
//   const [geocodedReports, setGeocodedReports] = useState([]);
//   const [pageLoading, setPageLoading] = useState(true);
//   const [mapLoading, setMapLoading] = useState(true);
//   const [timeGrouping, setTimeGrouping] = useState("Monthly");
//   const [selectedReport, setSelectedReport] = useState(null); 
//   const affectedTableRef = useRef(null);

//   const navigate = useNavigate();

//   const highestAffectedReport = reports
//     .filter(r => r.affected_count > 0)
//     .reduce((max, r) => (r.affected_count > (max?.affected_count || 0) ? r : max), null);

//   const scrollToHighestAffected = () => {
//     if (!highestAffectedReport || !affectedTableRef.current) return;
//     const rows = affectedTableRef.current.querySelectorAll("tbody tr");
//     const rowIndex = Array.from(rows).findIndex(r => {
//       return parseInt(r.querySelector("td:nth-child(4)").textContent) === highestAffectedReport.affected_count &&
//         r.querySelector("td:nth-child(2)").textContent === highestAffectedReport.issue_type &&
//         r.querySelector("td:nth-child(3)").textContent === highestAffectedReport.location;
//     });

//     if (rowIndex === -1) return;
//     const row = rows[rowIndex];
//     row.scrollIntoView({ behavior: "smooth", block: "center" });
//     row.classList.add("bg-yellow-100");
//     setTimeout(() => row.classList.remove("bg-yellow-100"), 2000);
//   };

//   useEffect(() => {
//     const fetchReports = async () => {
//       const { data: initialReports, error } = await supabase.from("reports").select("*");
//       if (error) {
//         console.error("Error fetching reports:", error);
//         setPageLoading(false);
//         setMapLoading(false);
//         return;
//       }
//       setReports(initialReports || []);
//       setPageLoading(false);

//       const geocodingPromises = (initialReports || []).map(async (report) => {
//         if (!report.location || !GEOAPIFY_API_KEY) return report;
//         try {
//           const encodedLocation = encodeURIComponent(report.location);
//           const url = `https://api.geoapify.com/v1/geocode/search?text=${encodedLocation}&apiKey=${GEOAPIFY_API_KEY}`;
//           const response = await fetch(url);
//           const data = await response.json();
//           if (data.features && data.features.length > 0) {
//             const { coordinates } = data.features[0].geometry;
//             return { ...report, lng: coordinates[0], lat: coordinates[1] };
//           }
//         } catch (err) {
//           console.error("Geocoding failed:", report.location, err);
//         }
//         return report;
//       });

//       const resolvedReports = await Promise.all(geocodingPromises);
//       setGeocodedReports(resolvedReports);
//       setMapLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // KPI Data
//   const totalIssues = reports.length;
//   const resolvedCount = reports.filter(r => r.status === "Resolved").length;
//   const pendingCount = reports.filter(r => r.status === "Pending").length;
//   const inProgressCount = reports.filter(r => r.status === "In Progress").length;

//   // Trend Chart
//   const issuesTrend = (() => {
//     const map = {};
//     reports.forEach(r => {
//       const date = new Date(r.created_at);
//       let key;
//       if (timeGrouping === "Daily") key = format(date, "dd MMM");
//       else if (timeGrouping === "Weekly") key = `Week ${format(date, "yyyy-'W'ww")}`;
//       else key = format(date, "MMM yyyy");

//       if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
//       map[key].reported++;
//       if (r.status === "Resolved") map[key].resolved++;
//     });
//     return Object.values(map);
//   })();

//   // Breakdown by Category
//   const categoryMap = {};
//   reports.forEach(r => {
//     categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
//   });
//   const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

//   // Geo Reports
//   const geoReports = geocodedReports.filter(r => r.lat && r.lng);
//   const DEFAULT_CENTER = [19.7515, 75.7139]; // Maharashtra
//   const DEFAULT_ZOOM = 6;
//   const avgLat = geoReports.length > 0 ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length : DEFAULT_CENTER[0];
//   const avgLng = geoReports.length > 0 ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length : DEFAULT_CENTER[1];

//   const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
//       <main className="flex-1 p-6">

//         {/* KPIs */}
//         {pageLoading ? (
//           <p className="p-6 text-[#555555]">Loading reports...</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//             <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//               <h3 className="text-sm text-[#555555] mb-2">Total Issues</h3>
//               <p className="text-2xl font-bold text-[#333333]">{totalIssues}</p>
//             </div>
//             <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//               <h3 className="text-sm text-[#555555] mb-2">Pending</h3>
//               <p className="text-2xl font-bold text-[#FFB347]">{pendingCount}</p>
//             </div>
//             <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//               <h3 className="text-sm text-[#555555] mb-2">Resolved</h3>
//               <p className="text-2xl font-bold text-[#32CD32]">{resolvedCount}</p>
//             </div>
//             <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//               <h3 className="text-sm text-[#555555] mb-2">In Progress</h3>
//               <p className="text-2xl font-bold text-[#FFA500]">{inProgressCount}</p>
//             </div>
//           </div>
//         )}

//         {/* BAR GRAPH + MAP */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
//           {/* Bar Graph */}
//           {!pageLoading && (
//             <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//               <div className="mb-4 flex items-center gap-4">
//                 <h2 className="text-lg font-semibold text-[#333333]">Reported vs Resolved</h2>
//                 <select
//                   value={timeGrouping}
//                   onChange={(e) => setTimeGrouping(e.target.value)}
//                   className="border border-[#FFE4B5] rounded-lg p-1 px-2 bg-white"
//                 >
//                   <option value="Daily">Daily</option>
//                   <option value="Weekly">Weekly</option>
//                   <option value="Monthly">Monthly</option>
//                 </select>
//               </div>

//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={issuesTrend} barSize={40}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#FFE4B5" />
//                   <XAxis dataKey="period" stroke="#555555" />
//                   <YAxis stroke="#555555" />
//                   <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//                   <Legend />
//                   <Bar dataKey="reported" fill="#FFA500" radius={[6, 6, 0, 0]} />
//                   <Bar dataKey="resolved" fill="#32CD32" radius={[6, 6, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           )}

//           {/* Map */}
//           <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//             <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
//             {mapLoading ? (
//               <p className="text-[#555555]">Loading map...</p>
//             ) : (
//               <MapContainer
//                 center={geoReports.length > 0 ? [avgLat, avgLng] : DEFAULT_CENTER}
//                 zoom={geoReports.length > 0 ? 6 : DEFAULT_ZOOM}
//                 className="h-[350px] w-full rounded-lg z-0"
//               >
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//                 />
//                 {geoReports.map((r, idx) => (
//                   <Marker key={r.id || idx} position={[r.lat, r.lng]}>
//                     <Popup>
//                       <b>{r.issue_type}</b> <br />
//                       Status: {r.status} <br />
//                       Priority: {r.priority} <br />
//                       Location: {r.location} <br />
//                       Reported: {format(new Date(r.created_at), "PP")}
//                     </Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             )}
//           </div>
//         </div>

//         {/* CATEGORY + HIGH PRIORITY REPORTS */}
//         {!pageLoading && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
//             {/* Category */}
//             <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//               <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Category</h2>
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                     {categoryData.map((entry, index) => (
//                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Reports with Affected Count Table */}
//             <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//               <h2 className="text-lg font-semibold text-[#333333] mb-4">
//                 Reports with Affected Count
//               </h2>

//               {reports.filter(r => r.affected_count > 0).length === 0 ? (
//                 <p className="text-[#777777]">No reports with affected count 🎉</p>
//               ) : (
//                 <div
//                   ref={affectedTableRef}
//                   className="overflow-y-auto max-h-64 rounded-lg border border-[#FFE4B5]"
//                 >
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-[#FFF9F0] sticky top-0 z-10">
//                       <tr>
//                         <th className="p-2 border border-[#FFE4B5]">#</th>
//                         <th className="p-2 border border-[#FFE4B5]">Issue</th>
//                         <th className="p-2 border border-[#FFE4B5]">Location</th>
//                         <th className="p-2 border border-[#FFE4B5]">Affected Count</th>
//                         <th className="p-2 border border-[#FFE4B5]">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {reports
//                         .filter(r => r.affected_count > 0)
//                         .sort((a, b) => b.affected_count - a.affected_count)
//                         .map((r, idx) => (
//                           <tr
//                             key={r.id}
//                             className="hover:bg-[#FFF9F0] transition cursor-pointer"
//                             onClick={() => setSelectedReport(r)} // <-- open modal
//                           >
//                             <td className="p-2 border border-[#FFE4B5] font-bold">{idx + 1}</td>
//                             <td className="p-2 border border-[#FFE4B5]">{r.issue_type}</td>
//                             <td className="p-2 border border-[#FFE4B5]">{r.location}</td>
//                             <td className="p-2 border border-[#FFE4B5] font-bold text-[#FF4500]">
//                               {r.affected_count}
//                             </td>
//                             <td className="p-2 border border-[#FFE4B5]">{r.status}</td>
//                           </tr>
//                         ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Modal Popup for Report Details */}
//         {selectedReport && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//             <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-lg border border-[#FFE4B5] relative">
//               <button
//                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//                 onClick={() => setSelectedReport(null)}
//               >
//                 ✕
//               </button>
//               <h2 className="text-xl font-bold text-[#333333] mb-4">
//                 Report Details
//               </h2>
//               <div className="space-y-2 text-sm text-[#444]">
//                 <p><b>Issue:</b> {selectedReport.issue_type}</p>
//                 <p><b>Location:</b> {selectedReport.location}</p>
//                 <p><b>Status:</b> {selectedReport.status}</p>
//                 <p><b>Priority:</b> {selectedReport.priority || "N/A"}</p>
//                 <p><b>Affected Count:</b> {selectedReport.affected_count}</p>
//                 <p><b>Reported At:</b> {format(new Date(selectedReport.created_at), "PPpp")}</p>
//               </div>
//               <button
//                 className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition"
//                 onClick={() => {
//                   navigate("/reports", { state: { reportId: selectedReport.id } });
//                 }}
//               >
//                 Go to Report
//               </button>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



// import { useState, useEffect, useRef } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import {
//   BarChart, Bar,
//   CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
// } from "recharts";
// import { format } from "date-fns";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // Fix Leaflet marker icons
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// // Helper function to return the correct gradient and icon styles for the StatCard
// const getStatCardStyles = (title) => {
//   switch (title) {
//     case "Pending Issues":
//       return {
//         bgGradient: "bg-gradient-to-br from-[#F87171] to-[#DC2626]",
//         iconBg: "bg-[#B91C1C]",
//       };
//     case "Resolved Issues":
//       return {
//         bgGradient: "bg-gradient-to-br from-green-200 to-green-400",
//         iconBg: "bg-green-300",
//       };
//     case "In Progress":
//       return {
//         bgGradient: "bg-gradient-to-br from-orange-200 to-orange-400",
//         iconBg: "bg-orange-300",
//       };
//     case "Total Issues":
//       return {
//         bgGradient: "bg-gradient-to-br from-purple-200 to-purple-400",
//         iconBg: "bg-purple-300",
//       };
//     default:
//       return {
//         bgGradient: "bg-gradient-to-br from-gray-200 to-gray-400",
//         iconBg: "bg-gray-300",
//       };
//   }
// };

// // StatCard component with updated styling and horizontal layout
// const StatCard = ({ title, value, icon, styles }) => (
//   <div
//     className={`p-6 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${styles.bgGradient}`}
//   >
//     {/* This container aligns the icon and title horizontally */}
//     <div className="flex items-center space-x-4">
//       <div
//         className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${styles.iconBg}`}
//       >
//         {icon}
//       </div>
//       <p className="text-sm font-semibold text-gray-800 uppercase">{title}</p>
//     </div>

//     {/* The value remains below for visual emphasis */}
//     <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
//   </div>
// );

// export default function Analytics() {
//   const [reports, setReports] = useState([]);
//   const [geocodedReports, setGeocodedReports] = useState([]);
//   const [pageLoading, setPageLoading] = useState(true);
//   const [mapLoading, setMapLoading] = useState(true);
//   const [timeGrouping, setTimeGrouping] = useState("Monthly");
//   const [selectedReport, setSelectedReport] = useState(null); 
//   const affectedTableRef = useRef(null);

//   const navigate = useNavigate();

//   const highestAffectedReport = reports
//     .filter(r => r.affected_count > 0)
//     .reduce((max, r) => (r.affected_count > (max?.affected_count || 0) ? r : max), null);

//   const scrollToHighestAffected = () => {
//     if (!highestAffectedReport || !affectedTableRef.current) return;
//     const rows = affectedTableRef.current.querySelectorAll("tbody tr");
//     const rowIndex = Array.from(rows).findIndex(r => {
//       return parseInt(r.querySelector("td:nth-child(4)").textContent) === highestAffectedReport.affected_count &&
//         r.querySelector("td:nth-child(2)").textContent === highestAffectedReport.issue_type &&
//         r.querySelector("td:nth-child(3)").textContent === highestAffectedReport.location;
//     });

//     if (rowIndex === -1) return;
//     const row = rows[rowIndex];
//     row.scrollIntoView({ behavior: "smooth", block: "center" });
//     row.classList.add("bg-yellow-100");
//     setTimeout(() => row.classList.remove("bg-yellow-100"), 2000);
//   };

//   useEffect(() => {
//     const fetchReports = async () => {
//       const { data: initialReports, error } = await supabase.from("reports").select("*");
//       if (error) {
//         console.error("Error fetching reports:", error);
//         setPageLoading(false);
//         setMapLoading(false);
//         return;
//       }
//       setReports(initialReports || []);
//       setPageLoading(false);

//       const geocodingPromises = (initialReports || []).map(async (report) => {
//         if (!report.location || !GEOAPIFY_API_KEY) return report;
//         try {
//           const encodedLocation = encodeURIComponent(report.location);
//           const url = `https://api.geoapify.com/v1/geocode/search?text=${encodedLocation}&apiKey=${GEOAPIFY_API_KEY}`;
//           const response = await fetch(url);
//           const data = await response.json();
//           if (data.features && data.features.length > 0) {
//             const { coordinates } = data.features[0].geometry;
//             return { ...report, lng: coordinates[0], lat: coordinates[1] };
//           }
//         } catch (err) {
//           console.error("Geocoding failed:", report.location, err);
//         }
//         return report;
//       });

//       const resolvedReports = await Promise.all(geocodingPromises);
//       setGeocodedReports(resolvedReports);
//       setMapLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // KPI Data
//   const totalIssues = reports.length;
//   const resolvedCount = reports.filter(r => r.status === "Resolved").length;
//   const pendingCount = reports.filter(r => r.status === "Pending").length;
//   const inProgressCount = reports.filter(r => r.status === "In Progress").length;

//   // Trend Chart
//   const issuesTrend = (() => {
//     const map = {};
//     reports.forEach(r => {
//       const date = new Date(r.created_at);
//       let key;
//       if (timeGrouping === "Daily") key = format(date, "dd MMM");
//       else if (timeGrouping === "Weekly") key = `Week ${format(date, "yyyy-'W'ww")}`;
//       else key = format(date, "MMM yyyy");

//       if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
//       map[key].reported++;
//       if (r.status === "Resolved") map[key].resolved++;
//     });
//     return Object.values(map);
//   })();

//   // Breakdown by Category
//   const categoryMap = {};
//   reports.forEach(r => {
//     categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
//   });
//   const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

//   // Geo Reports
//   const geoReports = geocodedReports.filter(r => r.lat && r.lng);
//   const DEFAULT_CENTER = [19.7515, 75.7139]; // Maharashtra
//   const DEFAULT_ZOOM = 6;
//   const avgLat = geoReports.length > 0 ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length : DEFAULT_CENTER[0];
//   const avgLng = geoReports.length > 0 ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length : DEFAULT_CENTER[1];

//   const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
//       <main className="flex-1 p-6">

//         {/* KPIs */}
//         {pageLoading ? (
//           <p className="p-6 text-[#555555]">Loading reports...</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//             <StatCard
//               title="Total Issues"
//               value={totalIssues}
//               icon={<Flame size={24} />}
//               styles={getStatCardStyles("Total Issues")}
//             />
//             <StatCard
//               title="Pending Issues"
//               value={pendingCount}
//               icon={<AlertCircle size={24} />}
//               styles={getStatCardStyles("Pending Issues")}
//             />
//             <StatCard
//               title="Resolved Issues"
//               value={resolvedCount}
//               icon={<CheckCircle size={24} />}
//               styles={getStatCardStyles("Resolved Issues")}
//             />
//             <StatCard
//               title="In Progress"
//               value={inProgressCount}
//               icon={<Clock size={24} />}
//               styles={getStatCardStyles("In Progress")}
//             />
//           </div>
//         )}

//         {/* BAR GRAPH + MAP */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
//           {/* Bar Graph */}
//           {!pageLoading && (
//             <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//               <div className="mb-4 flex items-center gap-4">
//                 <h2 className="text-lg font-semibold text-[#333333]">Reported vs Resolved</h2>
//                 <select
//                   value={timeGrouping}
//                   onChange={(e) => setTimeGrouping(e.target.value)}
//                   className="border border-[#FFE4B5] rounded-lg p-1 px-2 bg-white"
//                 >
//                   <option value="Daily">Daily</option>
//                   <option value="Weekly">Weekly</option>
//                   <option value="Monthly">Monthly</option>
//                 </select>
//               </div>

//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={issuesTrend} barSize={40}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#FFE4B5" />
//                   <XAxis dataKey="period" stroke="#555555" />
//                   <YAxis stroke="#555555" />
//                   <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//                   <Legend />
//                   <Bar dataKey="reported" fill="#FFA500" radius={[6, 6, 0, 0]} />
//                   <Bar dataKey="resolved" fill="#32CD32" radius={[6, 6, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           )}

//           {/* Map */}
//           <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//             <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
//             {mapLoading ? (
//               <p className="text-[#555555]">Loading map...</p>
//             ) : (
//               <MapContainer
//                 center={geoReports.length > 0 ? [avgLat, avgLng] : DEFAULT_CENTER}
//                 zoom={geoReports.length > 0 ? 6 : DEFAULT_ZOOM}
//                 className="h-[350px] w-full rounded-lg z-0"
//               >
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//                 />
//                 {geoReports.map((r, idx) => (
//                   <Marker key={r.id || idx} position={[r.lat, r.lng]}>
//                     <Popup>
//                       <b>{r.issue_type}</b> <br />
//                       Status: {r.status} <br />
//                       Priority: {r.priority} <br />
//                       Location: {r.location} <br />
//                       Reported: {format(new Date(r.created_at), "PP")}
//                     </Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             )}
//           </div>
//         </div>

//         {/* CATEGORY + HIGH PRIORITY REPORTS */}
//         {!pageLoading && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
//             {/* Category */}
//             <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//               <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Category</h2>
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                     {categoryData.map((entry, index) => (
//                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Reports with Affected Count Table */}
//             <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//               <h2 className="text-lg font-semibold text-[#333333] mb-4">
//                 Reports with Affected Count
//               </h2>

//               {reports.filter(r => r.affected_count > 0).length === 0 ? (
//                 <p className="text-[#777777]">No reports with affected count 🎉</p>
//               ) : (
//                 <div
//                   ref={affectedTableRef}
//                   className="overflow-y-auto max-h-64 rounded-lg border border-[#FFE4B5]"
//                 >
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-[#FFF9F0] sticky top-0 z-10">
//                       <tr>
//                         <th className="p-2 border border-[#FFE4B5]">#</th>
//                         <th className="p-2 border border-[#FFE4B5]">Issue</th>
//                         <th className="p-2 border border-[#FFE4B5]">Location</th>
//                         <th className="p-2 border border-[#FFE4B5]">Affected Count</th>
//                         <th className="p-2 border border-[#FFE4B5]">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {reports
//                         .filter(r => r.affected_count > 0)
//                         .sort((a, b) => b.affected_count - a.affected_count)
//                         .map((r, idx) => (
//                           <tr
//                             key={r.id}
//                             className="hover:bg-[#FFF9F0] transition cursor-pointer"
//                             onClick={() => setSelectedReport(r)} // <-- open modal
//                           >
//                             <td className="p-2 border border-[#FFE4B5] font-bold">{idx + 1}</td>
//                             <td className="p-2 border border-[#FFE4B5]">{r.issue_type}</td>
//                             <td className="p-2 border border-[#FFE4B5]">{r.location}</td>
//                             <td className="p-2 border border-[#FFE4B5] font-bold text-[#FF4500]">
//                               {r.affected_count}
//                             </td>
//                             <td className="p-2 border border-[#FFE4B5]">{r.status}</td>
//                           </tr>
//                         ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Modal Popup for Report Details */}
//         {selectedReport && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//             <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-lg border border-[#FFE4B5] relative">
//               <button
//                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//                 onClick={() => setSelectedReport(null)}
//               >
//                 ✕
//               </button>
//               <h2 className="text-xl font-bold text-[#333333] mb-4">
//                 Report Details
//               </h2>
//               <div className="space-y-2 text-sm text-[#444]">
//                 <p><b>Issue:</b> {selectedReport.issue_type}</p>
//                 <p><b>Location:</b> {selectedReport.location}</p>
//                 <p><b>Status:</b> {selectedReport.status}</p>
//                 <p><b>Priority:</b> {selectedReport.priority || "N/A"}</p>
//                 <p><b>Affected Count:</b> {selectedReport.affected_count}</p>
//                 <p><b>Reported At:</b> {format(new Date(selectedReport.created_at), "PPpp")}</p>
//               </div>
//               <button
//                 className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition"
//                 onClick={() => {
//                   navigate("/reports", { state: { reportId: selectedReport.id } });
//                 }}
//               >
//                 Go to Report
//               </button>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Helper function to return the correct gradient and icon styles for the StatCard
const getStatCardStyles = (title) => {
  switch (title) {
    case "Pending Issues":
      return {
        bgGradient: "bg-gradient-to-br from-[#F87171] to-[#DC2626]",
        iconBg: "bg-[#B91C1C]",
      };
    case "Resolved Issues":
      return {
        bgGradient: "bg-gradient-to-br from-green-200 to-green-400",
        iconBg: "bg-green-300",
      };
    case "In Progress":
      return {
        bgGradient: "bg-gradient-to-br from-orange-200 to-orange-400",
        iconBg: "bg-orange-300",
      };
    case "Total Issues":
      return {
        bgGradient: "bg-gradient-to-br from-purple-200 to-purple-400",
        iconBg: "bg-purple-300",
      };
    default:
      return {
        bgGradient: "bg-gradient-to-br from-gray-200 to-gray-400",
        iconBg: "bg-gray-300",
      };
  }
};

// StatCard component with updated styling and horizontal layout
const StatCard = ({ title, value, icon, styles }) => (
  <div
    className={`p-6 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${styles.bgGradient}`}
  >
    {/* This container aligns the icon and title horizontally */}
    <div className="flex items-center space-x-4">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${styles.iconBg}`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-800 uppercase">{title}</p>
    </div>

    {/* The value remains below for visual emphasis */}
    <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [geocodedReports, setGeocodedReports] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState("Monthly");
  const [selectedReport, setSelectedReport] = useState(null); 
  const affectedTableRef = useRef(null);

  const navigate = useNavigate();

  const highestAffectedReport = reports
    .filter(r => r.affected_count > 0)
    .reduce((max, r) => (r.affected_count > (max?.affected_count || 0) ? r : max), null);

  const scrollToHighestAffected = () => {
    if (!highestAffectedReport || !affectedTableRef.current) return;
    const rows = affectedTableRef.current.querySelectorAll("tbody tr");
    const rowIndex = Array.from(rows).findIndex(r => {
      return parseInt(r.querySelector("td:nth-child(4)").textContent) === highestAffectedReport.affected_count &&
        r.querySelector("td:nth-child(2)").textContent === highestAffectedReport.issue_type &&
        r.querySelector("td:nth-child(3)").textContent === highestAffectedReport.location;
    });

    if (rowIndex === -1) return;
    const row = rows[rowIndex];
    row.scrollIntoView({ behavior: "smooth", block: "center" });
    row.classList.add("bg-yellow-100");
    setTimeout(() => row.classList.remove("bg-yellow-100"), 2000);
  };

  useEffect(() => {
    const fetchReports = async () => {
      const { data: initialReports, error } = await supabase.from("reports").select("*");
      if (error) {
        console.error("Error fetching reports:", error);
        setPageLoading(false);
        setMapLoading(false);
        return;
      }
      setReports(initialReports || []);
      setPageLoading(false);

      const geocodingPromises = (initialReports || []).map(async (report) => {
        if (!report.location || !GEOAPIFY_API_KEY) return report;
        try {
          const encodedLocation = encodeURIComponent(report.location);
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodedLocation}&apiKey=${GEOAPIFY_API_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const { coordinates } = data.features[0].geometry;
            return { ...report, lng: coordinates[0], lat: coordinates[1] };
          }
        } catch (err) {
          console.error("Geocoding failed:", report.location, err);
        }
        return report;
      });

      const resolvedReports = await Promise.all(geocodingPromises);
      setGeocodedReports(resolvedReports);
      setMapLoading(false);
    };

    fetchReports();
  }, []);

  // KPI Data
  const totalIssues = reports.length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const inProgressCount = reports.filter(r => r.status === "In Progress").length;

  // Trend Chart
  const issuesTrend = (() => {
    const map = {};
    reports.forEach(r => {
      const date = new Date(r.created_at);
      let key;
      if (timeGrouping === "Daily") key = format(date, "dd MMM");
      else if (timeGrouping === "Weekly") key = `Week ${format(date, "yyyy-'W'ww")}`;
      else key = format(date, "MMM yyyy");

      if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
      map[key].reported++;
      if (r.status === "Resolved") map[key].resolved++;
    });
    return Object.values(map);
  })();

  // Breakdown by Category
  const categoryMap = {};
  reports.forEach(r => {
    categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Geo Reports
  const geoReports = geocodedReports.filter(r => r.lat && r.lng);
  const DEFAULT_CENTER = [19.7515, 75.7139]; // Maharashtra
  const DEFAULT_ZOOM = 6;
  const avgLat = geoReports.length > 0 ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length : DEFAULT_CENTER[0];
  const avgLng = geoReports.length > 0 ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length : DEFAULT_CENTER[1];

  const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      <main className="flex-1 p-6">

        {/* KPIs */}
        {pageLoading ? (
          <p className="p-6 text-[#555555]">Loading reports...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Issues"
              value={totalIssues}
              icon={<Flame size={24} />}
              styles={getStatCardStyles("Total Issues")}
            />
            <StatCard
              title="Pending Issues"
              value={pendingCount}
              icon={<AlertCircle size={24} />}
              styles={getStatCardStyles("Pending Issues")}
            />
            <StatCard
              title="Resolved Issues"
              value={resolvedCount}
              icon={<CheckCircle size={24} />}
              styles={getStatCardStyles("Resolved Issues")}
            />
            <StatCard
              title="In Progress"
              value={inProgressCount}
              icon={<Clock size={24} />}
              styles={getStatCardStyles("In Progress")}
            />
          </div>
        )}

        {/* BAR GRAPH + MAP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Bar Graph */}
          {!pageLoading && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
              <div className="mb-4 flex items-center gap-4">
                <h2 className="text-lg font-semibold text-[#333333]">Reported vs Resolved</h2>
                <select
                  value={timeGrouping}
                  onChange={(e) => setTimeGrouping(e.target.value)}
                  className="border border-[#FFE4B5] rounded-lg p-1 px-2 bg-white"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issuesTrend} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFE4B5" />
                  <XAxis dataKey="period" stroke="#555555" />
                  <YAxis stroke="#555555" />
                  <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
                  <Legend />
                  <Bar dataKey="reported" fill="#FFA500" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" fill="#32CD32" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Map */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
            <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
            {mapLoading ? (
              <p className="text-[#555555]">Loading map...</p>
            ) : (
              <MapContainer
                center={geoReports.length > 0 ? [avgLat, avgLng] : DEFAULT_CENTER}
                zoom={geoReports.length > 0 ? 6 : DEFAULT_ZOOM}
                className="h-[350px] w-full rounded-lg z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                {geoReports.map((r, idx) => (
                  <Marker key={r.id || idx} position={[r.lat, r.lng]}>
                    <Popup>
                      <b>{r.issue_type}</b> <br />
                      Status: {r.status} <br />
                      Priority: {r.priority} <br />
                      Location: {r.location} <br />
                      Reported: {format(new Date(r.created_at), "PP")}
                      <div className="mt-2">
                        <button
                          className="bg-orange-500 text-white px-3 py-1 rounded-md shadow hover:bg-orange-600 transition"
                          onClick={() => {
                            navigate("/reports", { state: { reportId: r.id } });
                          }}
                        >
                          Go to Report
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* CATEGORY + HIGH PRIORITY REPORTS */}
        {!pageLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Category */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Category</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Reports with Affected Count Table */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">
                Reports with Affected Count
              </h2>

              {reports.filter(r => r.affected_count > 0).length === 0 ? (
                <p className="text-[#777777]">No reports with affected count 🎉</p>
              ) : (
                <div
                  ref={affectedTableRef}
                  className="overflow-y-auto max-h-64 rounded-lg border border-[#FFE4B5]"
                >
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#FFF9F0] sticky top-0 z-10">
                      <tr>
                        <th className="p-2 border border-[#FFE4B5]">#</th>
                        <th className="p-2 border border-[#FFE4B5]">Issue</th>
                        <th className="p-2 border border-[#FFE4B5]">Location</th>
                        <th className="p-2 border border-[#FFE4B5]">Affected Count</th>
                        <th className="p-2 border border-[#FFE4B5]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports
                        .filter(r => r.affected_count > 0)
                        .sort((a, b) => b.affected_count - a.affected_count)
                        .map((r, idx) => (
                          <tr
                            key={r.id}
                            className="hover:bg-[#FFF9F0] transition cursor-pointer"
                            onClick={() => setSelectedReport(r)} // <-- open modal
                          >
                            <td className="p-2 border border-[#FFE4B5] font-bold">{idx + 1}</td>
                            <td className="p-2 border border-[#FFE4B5]">{r.issue_type}</td>
                            <td className="p-2 border border-[#FFE4B5]">{r.location}</td>
                            <td className="p-2 border border-[#FFE4B5] font-bold text-[#FF4500]">
                              {r.affected_count}
                            </td>
                            <td className="p-2 border border-[#FFE4B5]">{r.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Popup for Report Details */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-lg border border-[#FFE4B5] relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedReport(null)}
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-[#333333] mb-4">
                Report Details
              </h2>
              <div className="space-y-2 text-sm text-[#444]">
                <p><b>Issue:</b> {selectedReport.issue_type}</p>
                <p><b>Location:</b> {selectedReport.location}</p>
                <p><b>Status:</b> {selectedReport.status}</p>
                <p><b>Priority:</b> {selectedReport.priority || "N/A"}</p>
                <p><b>Affected Count:</b> {selectedReport.affected_count}</p>
                <p><b>Reported At:</b> {format(new Date(selectedReport.created_at), "PPpp")}</p>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 transition"
                onClick={() => {
                  navigate("/reports", { state: { reportId: selectedReport.id } });
                }}
              >
                Go to Report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}