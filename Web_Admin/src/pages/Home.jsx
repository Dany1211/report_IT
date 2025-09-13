// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // StatCard component
// const StatCard = ({ title, value, icon, color }) => (
//   <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-[#FFE4B5]">
//     <div>
//       <h3 className="text-[#555555] text-sm font-medium">{title}</h3>
//       <p className="text-2xl font-semibold text-[#333333] mt-1">{value}</p>
//     </div>
//     <div className={`text-white rounded-full p-3 flex items-center justify-center shadow-md ${color}`}>
//       {icon}
//     </div>
//   </div>
// );

// // Status color helper
// const getStatusColor = (status) => {
//   if (!status) return "text-gray-500 bg-gray-500/10";
//   const normalized = status.trim().toLowerCase();
//   switch (normalized) {
//     case "pending":
//       return "text-[#FF4500] bg-[#FF4500]/20"; // 🔴 red
//     case "in progress":
//       return "text-[#FFA500] bg-[#FFA500]/20"; // 🟠 orange
//     case "resolved":
//       return "text-[#32CD32] bg-[#32CD32]/20"; // 🟢 green
//     default:
//       return "text-gray-500 bg-gray-500/10";
//   }
// };

// const getStatCardColor = (title) => {
//   const normalized = title.trim().toLowerCase();
//   switch (normalized) {
//     case "pending issues":
//       return "bg-[#FF4500]";
//     case "resolved issues":
//       return "bg-[#32CD32]";
//     case "in progress":
//       return "bg-[#FFA500]";
//     case "total issues":
//       return "bg-[#FFB347]";
//     default:
//       return "bg-gray-500";
//   }
// };

// // Table component
// const Table = ({ data }) => (
//   <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
//     <table className="min-w-full border-collapse text-[#333]">
//       <thead className="bg-[#FFE4B5] text-left">
//         <tr>
//           <th className="p-2 text-sm font-semibold">Issue</th>
//           <th className="p-2 text-sm font-semibold">Status</th>
//           <th className="p-2 text-sm font-semibold">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((report) => (
//           <tr
//             key={report.id}
//             className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
//           >
//             <td className="p-2 text-sm font-medium text-[#333]">
//               {report.issue_type}
//             </td>
//             <td className="p-2">
//               <span
//                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusColor(
//                   report.status
//                 )}`}
//               >
//                 {report.status}
//               </span>
//             </td>
//             <td
//               className="p-2 text-sm text-[#555] max-w-sm overflow-hidden"
//             >
//               {report.location}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// export default function Dashboard() {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // fetch ALL reports from supabase
//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);

//       const { data, error } = await supabase
//         .from("reports")
//         .select("id, issue_type, status, location, created_at")
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("Error fetching reports:", error.message);
//       } else {
//         setReports(data || []);
//       }

//       setLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // calculate stats
//   const pendingCount = reports.filter((r) => r.status?.trim().toLowerCase() === "pending").length;
//   const resolvedCount = reports.filter((r) => r.status?.trim().toLowerCase() === "resolved").length;
//   const inProgressCount = reports.filter((r) => r.status?.trim().toLowerCase() === "in progress").length;

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
//       <div className="p-8">
//         <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <StatCard
//             title="Pending Issues"
//             value={pendingCount}
//             icon={<AlertCircle size={20} />}
//             color={getStatCardColor("Pending Issues")}
//           />
//           <StatCard
//             title="Resolved Issues"
//             value={resolvedCount}
//             icon={<CheckCircle size={20} />}
//             color={getStatCardColor("Resolved Issues")}
//           />
//           <StatCard
//             title="In Progress"
//             value={inProgressCount}
//             icon={<Clock size={20} />}
//             color={getStatCardColor("In Progress")}
//           />
//           <StatCard
//             title="Total Issues"
//             value={reports.length}
//             icon={<Flame size={20} />}
//             color={getStatCardColor("Total Issues")}
//           />
//         </div>

//         {/* All Reports Table */}
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-[#333333] mb-4">All Reports</h2>
//           {loading ? (
//             <p className="text-[#555555]">Loading reports...</p>
//           ) : reports.length > 0 ? (
//             <Table data={reports} />
//           ) : (
//             <p className="text-[#555555]">No reports available.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // StatCard component
// const StatCard = ({ title, value, icon, color }) => (
//   <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-[#FFE4B5]">
//     <div>
//       <h3 className="text-[#555555] text-sm font-medium">{title}</h3>
//       <p className="text-2xl font-semibold text-[#333333] mt-1">{value}</p>
//     </div>
//     <div className={`text-white rounded-full p-3 flex items-center justify-center shadow-md ${color}`}>
//       {icon}
//     </div>
//   </div>
// );

// // Status color helper
// const getStatusColor = (status) => {
//   if (!status) return "text-gray-500 bg-gray-500/10";
//   const normalized = status.trim().toLowerCase();
//   switch (normalized) {
//     case "pending":
//       return "text-[#FF4500] bg-[#FF4500]/20"; // 🔴 red
//     case "in progress":
//       return "text-[#FFA500] bg-[#FFA500]/20"; // 🟠 orange
//     case "resolved":
//       return "text-[#32CD32] bg-[#32CD32]/20"; // 🟢 green
//     default:
//       return "text-gray-500 bg-gray-500/10";
//   }
// };

// const getStatCardColor = (title) => {
//   const normalized = title.trim().toLowerCase();
//   switch (normalized) {
//     case "pending issues":
//       return "bg-[#FF4500]";
//     case "resolved issues":
//       return "bg-[#32CD32]";
//     case "in progress":
//       return "bg-[#FFA500]";
//     case "total issues":
//       return "bg-[#FFB347]";
//     default:
//       return "bg-gray-500";
//   }
// };

// // Table component
// const Table = ({ data }) => (
//   <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
//     <table className="min-w-full border-collapse text-[#333]">
//       <thead className="bg-[#FFE4B5] text-left">
//         <tr>
//           <th className="p-2 text-sm font-semibold">Issue</th>
//           <th className="p-2 text-sm font-semibold">Status</th>
//           <th className="p-2 text-sm font-semibold">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((report) => (
//           <tr
//             key={report.id}
//             className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
//           >
//             <td className="p-2 text-sm font-medium text-[#333]">
//               {report.issue_type}
//             </td>
//             <td className="p-2">
//               <span
//                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusColor(
//                   report.status
//                 )}`}
//               >
//                 {report.status}
//               </span>
//             </td>
//             <td
//               className="p-2 text-sm text-[#555] max-w-sm overflow-hidden"
//             >
//               {report.location}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// export default function Dashboard() {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // fetch ALL reports from supabase for the stats, and recent for the table
//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);

//       const { data: allReports, error } = await supabase
//         .from("reports")
//         .select("id, issue_type, status, location, created_at, description");

//       if (error) {
//         console.error("Error fetching reports:", error.message);
//       } else {
//         setReports(allReports || []);
//       }

//       setLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // calculate stats
//   const pendingCount = reports.filter((r) => r.status?.trim().toLowerCase() === "pending").length;
//   const resolvedCount = reports.filter((r) => r.status?.trim().toLowerCase() === "resolved").length;
//   const inProgressCount = reports.filter((r) => r.status?.trim().toLowerCase() === "in progress").length;
  
//   // Sort reports to get the 15 most recent for the table
//   const recentReports = reports
//     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//     .slice(0, 15);

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
//       <div className="p-8">
//         <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <StatCard
//             title="Pending Issues"
//             value={pendingCount}
//             icon={<AlertCircle size={20} />}
//             color={getStatCardColor("Pending Issues")}
//           />
//           <StatCard
//             title="Resolved Issues"
//             value={resolvedCount}
//             icon={<CheckCircle size={20} />}
//             color={getStatCardColor("Resolved Issues")}
//           />
//           <StatCard
//             title="In Progress"
//             value={inProgressCount}
//             icon={<Clock size={20} />}
//             color={getStatCardColor("In Progress")}
//           />
//           <StatCard
//             title="Total Issues"
//             value={reports.length}
//             icon={<Flame size={20} />}
//             color={getStatCardColor("Total Issues")}
//           />
//         </div>

//         {/* Recent Reports Table */}
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-[#333333] mb-4">Recent Reports</h2>
//           {loading ? (
//             <p className="text-[#555555]">Loading reports...</p>
//           ) : reports.length > 0 ? (
//             <>
//               <Table data={recentReports} />
//               <div className="mt-4 flex justify-start">
//                 <button
//                   onClick={() => navigate('/reports')}
//                   className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl shadow font-semibold"
//                 >
//                   View All Reports
//                 </button>
//               </div>
//             </>
//           ) : (
//             <p className="text-[#555555]">No reports available.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // Helper function to return the correct gradient and icon styles for the StatCard
// const getStatCardStyles = (title) => {
//   switch (title) {
//     case 'Pending Issues':
//       return {
//         bgGradient: 'bg-gradient-to-br from-orange-200 to-orange-400',
//         iconBg: 'bg-orange-300'
//       };
//     case 'Resolved Issues':
//       return {
//         bgGradient: 'bg-gradient-to-br from-green-200 to-green-400',
//         iconBg: 'bg-green-300'
//       };
//     case 'In Progress':
//       return {
//         bgGradient: 'bg-gradient-to-br from-sky-200 to-sky-400',
//         iconBg: 'bg-sky-300'
//       };
//     case 'Total Issues':
//       return {
//         bgGradient: 'bg-gradient-to-br from-purple-200 to-purple-400',
//         iconBg: 'bg-purple-300'
//       };
//     default:
//       return {
//         bgGradient: 'bg-gradient-to-br from-gray-200 to-gray-400',
//         iconBg: 'bg-gray-300'
//       };
//   }
// };

// // StatCard component with updated styling
// const StatCard = ({ title, value, icon, styles }) => (
//   <div className={`p-6 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${styles.bgGradient}`}>
//     <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white ${styles.iconBg}`}>
//       {icon}
//     </div>
//     <p className="text-sm font-semibold text-gray-800 uppercase">{title}</p>
//     <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
//   </div>
// );


// // Status color helper for the table
// const getStatusColor = (status) => {
//   if (!status) return "text-gray-500 bg-gray-500/10";
//   const normalized = status.trim().toLowerCase();
//   switch (normalized) {
//     case "pending":
//       return "text-[#FF4500] bg-[#FF4500]/20";
//     case "in progress":
//       return "text-[#FFA500] bg-[#FFA500]/20";
//     case "resolved":
//       return "text-[#32CD32] bg-[#32CD32]/20";
//     default:
//       return "text-gray-500 bg-gray-500/10";
//   }
// };

// // Table component
// const Table = ({ data }) => (
//   <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
//     <table className="min-w-full border-collapse text-[#333]">
//       <thead className="bg-[#FFE4B5] text-left">
//         <tr>
//           <th className="p-2 text-sm font-semibold">Issue</th>
//           <th className="p-2 text-sm font-semibold">Status</th>
//           <th className="p-2 text-sm font-semibold">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((report) => (
//           <tr
//             key={report.id}
//             className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
//           >
//             <td className="p-2 text-sm font-medium text-[#333]">
//               {report.issue_type}
//             </td>
//             <td className="p-2">
//               <span
//                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusColor(
//                   report.status
//                 )}`}
//               >
//                 {report.status}
//               </span>
//             </td>
//             <td
//               className="p-2 text-sm text-[#555] max-w-sm overflow-hidden"
//             >
//               {report.location}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// export default function Dashboard() {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // fetch ALL reports from supabase for the stats, and recent for the table
//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);

//       const { data: allReports, error } = await supabase
//         .from("reports")
//         .select("id, issue_type, status, location, created_at, description");

//       if (error) {
//         console.error("Error fetching reports:", error.message);
//       } else {
//         setReports(allReports || []);
//       }

//       setLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // calculate stats
//   const pendingCount = reports.filter((r) => r.status?.trim().toLowerCase() === "pending").length;
//   const resolvedCount = reports.filter((r) => r.status?.trim().toLowerCase() === "resolved").length;
//   const inProgressCount = reports.filter((r) => r.status?.trim().toLowerCase() === "in progress").length;
  
//   // Sort reports to get the 15 most recent for the table
//   const recentReports = reports
//     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//     .slice(0, 15);

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
//       <div className="p-8">
//         <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <StatCard
//             title="Pending Issues"
//             value={pendingCount}
//             icon={<AlertCircle size={24} />}
//             styles={getStatCardStyles("Pending Issues")}
//           />
//           <StatCard
//             title="Resolved Issues"
//             value={resolvedCount}
//             icon={<CheckCircle size={24} />}
//             styles={getStatCardStyles("Resolved Issues")}
//           />
//           <StatCard
//             title="In Progress"
//             value={inProgressCount}
//             icon={<Clock size={24} />}
//             styles={getStatCardStyles("In Progress")}
//           />
//           <StatCard
//             title="Total Issues"
//             value={reports.length}
//             icon={<Flame size={24} />}
//             styles={getStatCardStyles("Total Issues")}
//           />
//         </div>

//         {/* Recent Reports Table */}
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-[#333333] mb-4">Recent Reports</h2>
//           {loading ? (
//             <p className="text-[#555555]">Loading reports...</p>
//           ) : reports.length > 0 ? (
//             <>
//               <Table data={recentReports} />
//               <div className="mt-4 flex justify-start">
//                 <button
//                   onClick={() => navigate('/reports')}
//                   className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl shadow font-semibold"
//                 >
//                   View All Reports
//                 </button>
//               </div>
//             </>
//           ) : (
//             <p className="text-[#555555]">No reports available.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // Helper function to return the correct gradient and icon styles for the StatCard
// const getStatCardStyles = (title) => {
//   switch (title) {
//     case 'Pending Issues':
//       return {
//         bgGradient: 'bg-gradient-to-br from-[#FF6B6B] to-[#E55757]', // Red for Pending
//         iconBg: 'bg-[#C24141]'
//       };
//     case 'Resolved Issues':
//       return {
//         bgGradient: 'bg-gradient-to-br from-green-200 to-green-400', // Green for Resolved
//         iconBg: 'bg-green-300'
//       };
//     case 'In Progress':
//       return {
//         bgGradient: 'bg-gradient-to-br from-orange-200 to-orange-400', // Orange for In Progress
//         iconBg: 'bg-orange-300'
//       };
//     case 'Total Issues':
//       return {
//         bgGradient: 'bg-gradient-to-br from-purple-200 to-purple-400', // Purple for Total
//         iconBg: 'bg-purple-300'
//       };
//     default:
//       return {
//         bgGradient: 'bg-gradient-to-br from-gray-200 to-gray-400',
//         iconBg: 'bg-gray-300'
//       };
//   }
// };

// // StatCard component with updated styling and horizontal layout
// const StatCard = ({ title, value, icon, styles }) => (
//   <div className={`p-6 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${styles.bgGradient}`}>
//     {/* This container aligns the icon and title horizontally */}
//     <div className="flex items-center space-x-4">
//       <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${styles.iconBg}`}>
//         {icon}
//       </div>
//       <p className="text-sm font-semibold text-gray-800 uppercase">{title}</p>
//     </div>

//     {/* The value remains below for visual emphasis */}
//     <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
//   </div>
// );


// // Status color helper for the table
// const getStatusColor = (status) => {
//   if (!status) return "text-gray-500 bg-gray-500/10";
//   const normalized = status.trim().toLowerCase();
//   switch (normalized) {
//     case "pending":
//       return "text-[#FF4500] bg-[#FF4500]/20";
//     case "in progress":
//       return "text-[#FFA500] bg-[#FFA500]/20";
//     case "resolved":
//       return "text-[#32CD32] bg-[#32CD32]/20";
//     default:
//       return "text-gray-500 bg-gray-500/10";
//   }
// };

// // Table component
// const Table = ({ data }) => (
//   <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
//     <table className="min-w-full border-collapse text-[#333]">
//       <thead className="bg-[#FFE4B5] text-left">
//         <tr>
//           <th className="p-2 text-sm font-semibold">Issue</th>
//           <th className="p-2 text-sm font-semibold">Status</th>
//           <th className="p-2 text-sm font-semibold">Location</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((report) => (
//           <tr
//             key={report.id}
//             className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
//           >
//             <td className="p-2 text-sm font-medium text-[#333]">
//               {report.issue_type}
//             </td>
//             <td className="p-2">
//               <span
//                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusColor(
//                   report.status
//                 )}`}
//               >
//                 {report.status}
//               </span>
//             </td>
//             <td
//               className="p-2 text-sm text-[#555] max-w-sm overflow-hidden"
//             >
//               {report.location}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// export default function Dashboard() {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // fetch ALL reports from supabase for the stats, and recent for the table
//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);

//       const { data: allReports, error } = await supabase
//         .from("reports")
//         .select("id, issue_type, status, location, created_at, description");

//       if (error) {
//         console.error("Error fetching reports:", error.message);
//       } else {
//         setReports(allReports || []);
//       }

//       setLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // calculate stats
//   const pendingCount = reports.filter((r) => r.status?.trim().toLowerCase() === "pending").length;
//   const resolvedCount = reports.filter((r) => r.status?.trim().toLowerCase() === "resolved").length;
//   const inProgressCount = reports.filter((r) => r.status?.trim().toLowerCase() === "in progress").length;
  
//   // Sort reports to get the 15 most recent for the table
//   const recentReports = reports
//     .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//     .slice(0, 15);

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
//       <div className="p-8">
//         <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <StatCard
//             title="Pending Issues"
//             value={pendingCount}
//             icon={<AlertCircle size={24} />}
//             styles={getStatCardStyles("Pending Issues")}
//           />
//           <StatCard
//             title="Resolved Issues"
//             value={resolvedCount}
//             icon={<CheckCircle size={24} />}
//             styles={getStatCardStyles("Resolved Issues")}
//           />
//           <StatCard
//             title="In Progress"
//             value={inProgressCount}
//             icon={<Clock size={24} />}
//             styles={getStatCardStyles("In Progress")}
//           />
//           <StatCard
//             title="Total Issues"
//             value={reports.length}
//             icon={<Flame size={24} />}
//             styles={getStatCardStyles("Total Issues")}
//           />
//         </div>

//         {/* Recent Reports Table */}
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-[#333333] mb-4">Recent Reports</h2>
//           {loading ? (
//             <p className="text-[#555555]">Loading reports...</p>
//           ) : reports.length > 0 ? (
//             <>
//               <Table data={recentReports} />
//               <div className="mt-4 flex justify-start">
//                 <button
//                   onClick={() => navigate('/reports')}
//                   className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl shadow font-semibold"
//                 >
//                   View All Reports
//                 </button>
//               </div>
//             </>
//           ) : (
//             <p className="text-[#555555]">No reports available.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// Helper function to return the correct gradient and icon styles for the StatCard
const getStatCardStyles = (title) => {
  switch (title) {
    case "Pending Issues":
      return {
        bgGradient: "bg-gradient-to-br from-[#F87171] to-[#DC2626]", // Warm deep red
        iconBg: "bg-[#B91C1C]", // Dark red for icon
      };
    case "Resolved Issues":
      return {
        bgGradient: "bg-gradient-to-br from-green-200 to-green-400", // Green for Resolved
        iconBg: "bg-green-300",
      };
    case "In Progress":
      return {
        bgGradient: "bg-gradient-to-br from-orange-200 to-orange-400", // Orange for In Progress
        iconBg: "bg-orange-300",
      };
    case "Total Issues":
      return {
        bgGradient: "bg-gradient-to-br from-purple-200 to-purple-400", // Purple for Total
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

// Status color helper for the table
const getStatusColor = (status) => {
  if (!status) return "text-gray-500 bg-gray-500/10";
  const normalized = status.trim().toLowerCase();
  switch (normalized) {
    case "pending":
      return "text-[#DC2626] bg-[#FCA5A5]/30"; // Softer warm red
    case "in progress":
      return "text-[#D97706] bg-[#FBBF24]/30"; // Golden orange
    case "resolved":
      return "text-[#15803D] bg-[#86EFAC]/30"; // Softer green
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

// Table component
const Table = ({ data }) => (
  <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
    <table className="min-w-full border-collapse text-[#333]">
      <thead className="bg-[#FFE4B5] text-left">
        <tr>
          <th className="p-2 text-sm font-semibold">Issue</th>
          <th className="p-2 text-sm font-semibold">Status</th>
          <th className="p-2 text-sm font-semibold">Location</th>
        </tr>
      </thead>
      <tbody>
        {data.map((report) => (
          <tr
            key={report.id}
            className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
          >
            <td className="p-2 text-sm font-medium text-[#333]">
              {report.issue_type}
            </td>
            <td className="p-2">
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status}
              </span>
            </td>
            <td className="p-2 text-sm text-[#555] max-w-sm overflow-hidden">
              {report.location}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);

      const { data: allReports, error } = await supabase
        .from("reports")
        .select("id, issue_type, status, location, created_at, description");

      if (error) {
        console.error("Error fetching reports:", error.message);
      } else {
        setReports(allReports || []);
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  const pendingCount = reports.filter(
    (r) => r.status?.trim().toLowerCase() === "pending"
  ).length;
  const resolvedCount = reports.filter(
    (r) => r.status?.trim().toLowerCase() === "resolved"
  ).length;
  const inProgressCount = reports.filter(
    (r) => r.status?.trim().toLowerCase() === "in progress"
  ).length;

  const recentReports = reports
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

        {/* Stat Cards in the new order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Issues"
            value={reports.length}
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
            title="In Progress"
            value={inProgressCount}
            icon={<Clock size={24} />}
            styles={getStatCardStyles("In Progress")}
          />
          <StatCard
            title="Resolved Issues"
            value={resolvedCount}
            icon={<CheckCircle size={24} />}
            styles={getStatCardStyles("Resolved Issues")}
          />
        </div>

        {/* Recent Reports Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#333333] mb-4">
            Recent Reports
          </h2>
          {loading ? (
            <p className="text-[#555555]">Loading reports...</p>
          ) : reports.length > 0 ? (
            <>
              <Table data={recentReports} />
              <div className="mt-4 flex justify-start">
                <button
                  onClick={() => navigate("/reports")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl shadow font-semibold"
                >
                  View All Reports
                </button>
              </div>
            </>
          ) : (
            <p className="text-[#555555]">No reports available.</p>
          )}
        </div>
      </div>
    </div>
  );
}