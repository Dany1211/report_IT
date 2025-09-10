// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient"; // adjust path if needed
// import {
//   BarChart, Bar, PieChart, Pie, Cell,
//   CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
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

// // Add your Geoapify API Key
// const GEOAPIFY_API_KEY = '4aec0d60f3684c7ea113a00db8f564b5';

// export default function Analytics() {
//   const [reports, setReports] = useState([]);
//   // New state to hold reports after geocoding
//   const [geocodedReports, setGeocodedReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [timeGrouping, setTimeGrouping] = useState("Monthly");

//   useEffect(() => {
//     const fetchAndGeocodeReports = async () => {
//       setLoading(true);
      
//       // 1. Fetch reports from Supabase
//       const { data: initialReports, error } = await supabase.from("reports").select("*");
//       if (error) {
//         console.error("Error fetching reports:", error);
//         setLoading(false);
//         return;
//       }
//       setReports(initialReports || []);

//       // 2. Geocode each report's location text using Geoapify
//       // We use Promise.all to run all API calls concurrently for speed
//       const geocodingPromises = (initialReports || []).map(async (report) => {
//         // Only geocode if the report has a location and the API key is valid
//         if (!report.location || GEOAPIFY_API_KEY === 'YOUR_GEOAPIFY_API_KEY' || !GEOAPIFY_API_KEY) {
//             return report; // Return original report if no location or API key
//         }
//         try {
//           const encodedLocation = encodeURIComponent(report.location);
//           const url = `https://api.geoapify.com/v1/geocode/search?text=${encodedLocation}&apiKey=${GEOAPIFY_API_KEY}`;
//           const response = await fetch(url);
//           const data = await response.json();
//           if (data.features && data.features.length > 0) {
//             const { coordinates } = data.features[0].geometry;
//             // Return the original report with new lat/lng properties
//             return { ...report, lng: coordinates[0], lat: coordinates[1] };
//           }
//         } catch (err) {
//           console.error("Geocoding failed for:", report.location, err);
//         }
//         return report; // Return original report if geocoding fails
//       });
      
//       const resolvedReports = await Promise.all(geocodingPromises);
//       setGeocodedReports(resolvedReports);
//       setLoading(false);
//     };

//     fetchAndGeocodeReports();
//   }, []);

//   if (loading) {
//     return <p className="p-6 text-[#555555]">Loading and geocoding reports...</p>;
//   }

//   // ---------- KPI Overview ----------
//   const totalIssues = reports.length;
//   const resolvedCount = reports.filter(r => r.status === "Resolved").length;
//   const pendingCount = reports.filter(r => r.status === "Pending").length;
//   const avgResolutionTime = 4.5; // placeholder


//   // ---------- Monthly Trend ----------
//   const issuesTrend = (() => {
//     const map = {};
//     reports.forEach(r => {
//       const date = new Date(r.created_at);
//       let key;

//       if (timeGrouping === "Daily") {
//         key = format(date, "dd MMM");
//       } else if (timeGrouping === "Weekly") {
//         const weekStart = format(date, "yyyy-'W'ww"); // ISO week
//         key = `Week ${weekStart}`;
//       } else {
//         key = format(date, "MMM yyyy");
//       }

//       if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
//       map[key].reported++;
//       if (r.status === "Resolved") map[key].resolved++;
//     });
//     return Object.values(map);
//   })();


//   // ---------- Category Breakdown ----------
//   const categoryMap = {};
//   reports.forEach(r => {
//     categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
//   });
//   const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

//   // ---------- Status Breakdown ----------
//   const statusMap = {};
//   reports.forEach(r => {
//     statusMap[r.status] = (statusMap[r.status] || 0) + 1;
//   });
//   const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

//   // ---------- Priority Breakdown (placeholder if no field) ----------
//   const priorityMap = {};
//   reports.forEach(r => {
//     const p = r.priority || "Low";
//     priorityMap[p] = (priorityMap[p] || 0) + 1;
//   });
//   const priorityData = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

//   // Geo Reports for Map now uses the geocodedReports state
//   const geoReports = geocodedReports.filter(r => r.lat && r.lng);

//   // Default center: India if no reports
//   const avgLat =
//     geoReports.length > 0
//       ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length
//       : 20.5937;
//   const avgLng =
//     geoReports.length > 0
//       ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length
//       : 78.9629;

//   // Theme colors
//   const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];
//   const statusColors = {
//     Pending: "#FF0000",        // 🔴 Red
//     "In Progress": "#FFA500",  // 🟠 Orange/Yellow
//     Resolved: "#32CD32",       // 🟢 Green
//   };


//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
//       {/* KPI Overview */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//           <h3 className="text-sm text-[#555555] mb-2">Total Issues</h3>
//           <p className="text-2xl font-bold text-[#333333]">{totalIssues}</p>
//         </div>
//         <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//           <h3 className="text-sm text-[#555555] mb-2">Resolved</h3>
//           <p className="text-2xl font-bold text-[#32CD32]">{resolvedCount}</p>
//         </div>
//         <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//           <h3 className="text-sm text-[#555555] mb-2">Pending</h3>
//           <p className="text-2xl font-bold text-[#FFB347]">{pendingCount}</p>
//         </div>
//         <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//           <h3 className="text-sm text-[#555555] mb-2">Avg. Resolution Time</h3>
//           <p className="text-2xl font-bold text-[#FFA500]">{avgResolutionTime}h</p>
//         </div>
//       </div>

//       ---

//       {/* Trend Chart */}
//       <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
//         {/* Header with dropdown */}
//         <div className="mb-4 flex items-center gap-4">
//           <h2 className="text-lg font-semibold text-[#333333]">Reported vs Resolved</h2>
//           <select
//             value={timeGrouping}
//             onChange={(e) => setTimeGrouping(e.target.value)}
//             className="border border-[#FFE4B5] rounded-lg p-1 px-2 bg-white"
//           >
//             <option value="Daily">Daily</option>
//             <option value="Weekly">Weekly</option>
//             <option value="Monthly">Monthly</option>
//           </select>
//         </div>

//         {/* Bar Chart */}
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={issuesTrend} barSize={40}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#FFE4B5" />
//             <XAxis dataKey="period" stroke="#555555" />
//             <YAxis stroke="#555555" />
//             <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//             <Legend />
//             <Bar dataKey="reported" fill="#FFA500" radius={[6, 6, 0, 0]} />
//             <Bar dataKey="resolved" fill="#32CD32" radius={[6, 6, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       ---

//       {/* Live Issues Map */}
//       <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
//         <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
//         <MapContainer center={[avgLat, avgLng]} zoom={geoReports.length > 0 ? 6 : 5} className="h-[400px] w-full rounded-lg z-0">
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           />
//           {geoReports.map((r, idx) => {
//             return (
//               <Marker key={r.id || idx} position={[r.lat, r.lng]}>
//                 <Popup>
//                   <b>{r.issue_type}</b> <br />
//                   Status: {r.status} <br />
//                   Location: {r.location} <br />
//                   Reported: {format(new Date(r.created_at), "PP")}
//                 </Popup>
//               </Marker>
//             );
//           })}
//         </MapContainer>
//       </div>
      
//       ---

//       {/* Breakdown Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
//         <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//           <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Category</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={categoryData}
//                 dataKey="value"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 label
//               >
//                 {categoryData.map((entry, index) => (
//                   <Cell
//                     key={index}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip
//                 contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }}
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//           <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Status</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                 {statusData.map((entry, index) => (
//                   <Cell key={index} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//           <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Priority</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                 {priorityData.map((entry, index) => (
//                   <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient"; // adjust path if needed
// import {
//   BarChart, Bar, PieChart, Pie, Cell,
//   CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
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

// // Your Geoapify API Key
// const GEOAPIFY_API_KEY = "4aec0d60f3684c7ea113a00db8f564b5";

// export default function Analytics() {
//   const [reports, setReports] = useState([]);
//   const [geocodedReports, setGeocodedReports] = useState([]);
//   const [pageLoading, setPageLoading] = useState(true); // For KPIs & charts
//   const [mapLoading, setMapLoading] = useState(true);   // For map section
//   const [timeGrouping, setTimeGrouping] = useState("Monthly");

//   useEffect(() => {
//     const fetchReports = async () => {
//       // 1. Fetch reports (fast) → update KPIs & charts
//       const { data: initialReports, error } = await supabase.from("reports").select("*");
//       if (error) {
//         console.error("Error fetching reports:", error);
//         setPageLoading(false);
//         setMapLoading(false);
//         return;
//       }
//       setReports(initialReports || []);
//       setPageLoading(false);

//       // 2. Background geocoding for map only
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

//   // ---------- KPI Overview ----------
//   const totalIssues = reports.length;
//   const resolvedCount = reports.filter(r => r.status === "Resolved").length;
//   const pendingCount = reports.filter(r => r.status === "Pending").length;
//   const avgResolutionTime = 4.5; // placeholder

//   // ---------- Monthly Trend ----------
//   const issuesTrend = (() => {
//     const map = {};
//     reports.forEach(r => {
//       const date = new Date(r.created_at);
//       let key;

//       if (timeGrouping === "Daily") {
//         key = format(date, "dd MMM");
//       } else if (timeGrouping === "Weekly") {
//         const weekStart = format(date, "yyyy-'W'ww");
//         key = `Week ${weekStart}`;
//       } else {
//         key = format(date, "MMM yyyy");
//       }

//       if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
//       map[key].reported++;
//       if (r.status === "Resolved") map[key].resolved++;
//     });
//     return Object.values(map);
//   })();

//   // ---------- Category Breakdown ----------
//   const categoryMap = {};
//   reports.forEach(r => {
//     categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
//   });
//   const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

//   // ---------- Status Breakdown ----------
//   const statusMap = {};
//   reports.forEach(r => {
//     statusMap[r.status] = (statusMap[r.status] || 0) + 1;
//   });
//   const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

//   // ---------- Priority Breakdown ----------
//   const priorityMap = {};
//   reports.forEach(r => {
//     const p = r.priority || "Low";
//     priorityMap[p] = (priorityMap[p] || 0) + 1;
//   });
//   const priorityData = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

//   // Geo Reports for Map
//   const geoReports = geocodedReports.filter(r => r.lat && r.lng);

//   const avgLat =
//     geoReports.length > 0
//       ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length
//       : 20.5937;
//   const avgLng =
//     geoReports.length > 0
//       ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length
//       : 78.9629;

//   // Theme colors
//   const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];
//   const statusColors = {
//     Pending: "#FF0000",
//     "In Progress": "#FFA500",
//     Resolved: "#32CD32",
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      
//       {/* KPI Overview */}
//       {pageLoading ? (
//         <p className="p-6 text-[#555555]">Loading reports...</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//             <h3 className="text-sm text-[#555555] mb-2">Total Issues</h3>
//             <p className="text-2xl font-bold text-[#333333]">{totalIssues}</p>
//           </div>
//           <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//             <h3 className="text-sm text-[#555555] mb-2">Resolved</h3>
//             <p className="text-2xl font-bold text-[#32CD32]">{resolvedCount}</p>
//           </div>
//           <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//             <h3 className="text-sm text-[#555555] mb-2">Pending</h3>
//             <p className="text-2xl font-bold text-[#FFB347]">{pendingCount}</p>
//           </div>
//           <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
//             <h3 className="text-sm text-[#555555] mb-2">Avg. Resolution Time</h3>
//             <p className="text-2xl font-bold text-[#FFA500]">{avgResolutionTime}h</p>
//           </div>
//         </div>
//       )}

//       {/* Trend Chart */}
//       {!pageLoading && (
//         <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
//           <div className="mb-4 flex items-center gap-4">
//             <h2 className="text-lg font-semibold text-[#333333]">Reported vs Resolved</h2>
//             <select
//               value={timeGrouping}
//               onChange={(e) => setTimeGrouping(e.target.value)}
//               className="border border-[#FFE4B5] rounded-lg p-1 px-2 bg-white"
//             >
//               <option value="Daily">Daily</option>
//               <option value="Weekly">Weekly</option>
//               <option value="Monthly">Monthly</option>
//             </select>
//           </div>

//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={issuesTrend} barSize={40}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#FFE4B5" />
//               <XAxis dataKey="period" stroke="#555555" />
//               <YAxis stroke="#555555" />
//               <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//               <Legend />
//               <Bar dataKey="reported" fill="#FFA500" radius={[6, 6, 0, 0]} />
//               <Bar dataKey="resolved" fill="#32CD32" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       )}

//       {/* Live Issues Map */}
//       <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
//         <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
//         {mapLoading ? (
//           <p className="text-[#555555]">Loading map...</p>
//         ) : (
//           <MapContainer center={[avgLat, avgLng]} zoom={geoReports.length > 0 ? 6 : 5} className="h-[400px] w-full rounded-lg z-0">
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//             />
//             {geoReports.map((r, idx) => (
//               <Marker key={r.id || idx} position={[r.lat, r.lng]}>
//                 <Popup>
//                   <b>{r.issue_type}</b> <br />
//                   Status: {r.status} <br />
//                   Location: {r.location} <br />
//                   Reported: {format(new Date(r.created_at), "PP")}
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         )}
//       </div>

//       {/* Breakdown Charts */}
//       {!pageLoading && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
//           <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//             <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Category</h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                   {categoryData.map((entry, index) => (
//                     <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//             <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Status</h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                   {statusData.map((entry, index) => (
//                     <Cell key={index} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
//             <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Priority</h2>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                   {priorityData.map((entry, index) => (
//                     <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // adjust path if needed
import {
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Your Geoapify API Key
const GEOAPIFY_API_KEY = "4aec0d60f3684c7ea113a00db8f564b5";

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [geocodedReports, setGeocodedReports] = useState([]);
  const [pageLoading, setPageLoading] = useState(true); // For KPIs & charts
  const [mapLoading, setMapLoading] = useState(true);   // For map section
  const [timeGrouping, setTimeGrouping] = useState("Monthly");

  useEffect(() => {
    const fetchReports = async () => {
      // 1. Fetch reports (fast) → update KPIs & charts
      const { data: initialReports, error } = await supabase.from("reports").select("*");
      if (error) {
        console.error("Error fetching reports:", error);
        setPageLoading(false);
        setMapLoading(false);
        return;
      }
      setReports(initialReports || []);
      setPageLoading(false);

      // 2. Background geocoding for map only
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

  // ---------- KPI Overview ----------
  const totalIssues = reports.length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const avgResolutionTime = 4.5; // placeholder

  // ---------- Monthly Trend ----------
  const issuesTrend = (() => {
    const map = {};
    reports.forEach(r => {
      const date = new Date(r.created_at);
      let key;

      if (timeGrouping === "Daily") {
        key = format(date, "dd MMM");
      } else if (timeGrouping === "Weekly") {
        const weekStart = format(date, "yyyy-'W'ww");
        key = `Week ${weekStart}`;
      } else {
        key = format(date, "MMM yyyy");
      }

      if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
      map[key].reported++;
      if (r.status === "Resolved") map[key].resolved++;
    });
    return Object.values(map);
  })();

  // ---------- Category Breakdown ----------
  const categoryMap = {};
  reports.forEach(r => {
    categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // ---------- Status Breakdown ----------
  const statusMap = {};
  reports.forEach(r => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // ---------- Priority Breakdown ----------
  const priorityMap = {};
  reports.forEach(r => {
    const p = r.priority || "Low";
    priorityMap[p] = (priorityMap[p] || 0) + 1;
  });
  const priorityData = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

  // Geo Reports for Map
  const geoReports = geocodedReports.filter(r => r.lat && r.lng);

  // Default center coordinates for Maharashtra, India
  const DEFAULT_MAHARASHTRA_CENTER = [19.7515, 75.7139];
  const DEFAULT_MAHARASHTRA_ZOOM = 6;

  // Calculate average latitude and longitude for centering the map based on reports
  const avgLat =
    geoReports.length > 0
      ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length
      : DEFAULT_MAHARASHTRA_CENTER[0];
  const avgLng =
    geoReports.length > 0
      ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length
      : DEFAULT_MAHARASHTRA_CENTER[1];

  // Theme colors
  const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];
  const statusColors = {
    Pending: "#FF0000",
    "In Progress": "#FFA500",
    Resolved: "#32CD32",
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      
      {/* KPI Overview */}
      {pageLoading ? (
        <p className="p-6 text-[#555555]">Loading reports...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
            <h3 className="text-sm text-[#555555] mb-2">Total Issues</h3>
            <p className="text-2xl font-bold text-[#333333]">{totalIssues}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
            <h3 className="text-sm text-[#555555] mb-2">Resolved</h3>
            <p className="text-2xl font-bold text-[#32CD32]">{resolvedCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
            <h3 className="text-sm text-[#555555] mb-2">Pending</h3>
            <p className="text-2xl font-bold text-[#FFB347]">{pendingCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
            <h3 className="text-sm text-[#555555] mb-2">Avg. Resolution Time</h3>
            <p className="text-2xl font-bold text-[#FFA500]">{avgResolutionTime}h</p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {!pageLoading && (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
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

      {/* Live Issues Map */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
        <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
        {mapLoading ? (
          <p className="text-[#555555]">Loading map...</p>
        ) : (
          <MapContainer 
            // Use default Maharashtra coordinates if no geo reports are found
            center={geoReports.length > 0 ? [avgLat, avgLng] : DEFAULT_MAHARASHTRA_CENTER} 
            zoom={geoReports.length > 0 ? 6 : DEFAULT_MAHARASHTRA_ZOOM} 
            className="h-[400px] w-full rounded-lg z-0"
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
                  Location: {r.location} <br />
                  Reported: {format(new Date(r.created_at), "PP")}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Breakdown Charts */}
      {!pageLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
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

          <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
            <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
            <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Priority</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}