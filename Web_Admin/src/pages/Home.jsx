// import { useState, useEffect } from "react";
// import { supabase } from "../supabaseClient"; // make sure path is correct
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // StatCard component
// const StatCard = ({ title, value, icon }) => (
//   <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-[#FFE4B5]">
//     <div>
//       <h3 className="text-[#555555] text-sm font-medium">{title}</h3>
//       <p className="text-2xl font-semibold text-[#333333] mt-1">{value}</p>
//     </div>
//     <div className="text-white bg-[#FFA500] rounded-full p-3 flex items-center justify-center shadow-md">
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
//       return "text-[#FFB347] bg-[#FFB347]/20"; // soft orange
//     case "in progress":
//       return "text-[#FFA500] bg-[#FFA500]/20"; // bright warm orange
//     case "resolved":
//       return "text-[#32CD32] bg-[#32CD32]/20"; // green
//     default:
//       return "text-gray-500 bg-gray-500/10";
//   }
// };

// // Table component
// const Table = ({ data }) => (
//   <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-[#FFE4B5]">
//     <table className="min-w-full divide-y divide-[#FFE4B5]">
//       <thead className="bg-[#FFF9F0]">
//         <tr>
//           <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
//             Issue
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
//             Status
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-[#555555] uppercase tracking-wider">
//             Location
//           </th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-[#FFF1C6]">
//         {data.map((report) => (
//           <tr key={report.id} className="hover:bg-[#FFF9F0] transition">
//             <td className="px-6 py-4 whitespace-nowrap">
//               <div className="text-sm font-medium text-[#333333]">
//                 {report.issue_type}
//               </div>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap">
//               <span
//                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
//                   report.status
//                 )}`}
//               >
//                 {report.status}
//               </span>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555555]">
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

//   // fetch reports from supabase
//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("reports")
//         .select("id, issue_type, status, location, created_at")
//         .order("created_at", { ascending: false })
//         .limit(10);

//       if (error) {
//         console.error("Error fetching reports:", error.message);
//       } else {
//         console.log("Fetched reports:", data); // ✅ Inspect this in browser console
//         setReports(data);
//       }
//       setLoading(false);
//     };

//     fetchReports();
//   }, []);

//   // calculate stats robustly
//   const pendingCount = reports.filter((r) => r.status?.trim().toLowerCase() === "pending").length;
//   const resolvedCount = reports.filter((r) => r.status?.trim().toLowerCase() === "resolved").length;
//   const inProgressCount = reports.filter((r) => r.status?.trim().toLowerCase() === "in progress").length;

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#fff1c6] overflow-hidden">
//       <div className="p-8">
//         <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <StatCard
//             title="Pending Issues"
//             value={pendingCount}
//             icon={<AlertCircle size={20} />}
//           />
//           <StatCard
//             title="Resolved Issues"
//             value={resolvedCount}
//             icon={<CheckCircle size={20} />}
//           />
//           <StatCard
//             title="In Progress"
//             value={inProgressCount}
//             icon={<Clock size={20} />}
//           />
//           <StatCard
//             title="Total Issues"
//             value={reports.length}
//             icon={<Flame size={20} />}
//           />
//         </div>

//         {/* Recent Reports */}
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-[#333333] mb-4">
//             Recent Reports
//           </h2>
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

import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// StatCard component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between border border-[#FFE4B5]">
    <div>
      <h3 className="text-[#555555] text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold text-[#333333] mt-1">{value}</p>
    </div>
    <div className="text-white bg-[#FFA500] rounded-full p-3 flex items-center justify-center shadow-md">
      {icon}
    </div>
  </div>
);

// Status color helper
const getStatusColor = (status) => {
  if (!status) return "text-gray-500 bg-gray-500/10";
  const normalized = status.trim().toLowerCase();
  switch (normalized) {
    case "pending":
      return "text-[#FF4500] bg-[#FF4500]/20"; // 🔴 red
    case "in progress":
      return "text-[#FFA500] bg-[#FFA500]/20"; // 🟠 orange
    case "resolved":
      return "text-[#32CD32] bg-[#32CD32]/20"; // 🟢 green
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

// Table component
const Table = ({ data }) => (
  <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
    <table className="w-full border-collapse text-[#333]">
      <thead className="bg-[#FFE4B5] text-left">
        <tr>
          <th className="p-3 text-sm font-semibold">Issue</th>
          <th className="p-3 text-sm font-semibold">Status</th>
          <th className="p-3 text-sm font-semibold">Location</th>
        </tr>
      </thead>
      <tbody>
        {data.map((report) => (
          <tr
            key={report.id}
            className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
          >
            <td className="p-3 text-sm font-medium text-[#333]">
              {report.issue_type}
            </td>
            <td className="p-3">
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status}
              </span>
            </td>
            <td className="p-3 text-sm text-[#555]">{report.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch ALL reports from supabase
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("reports")
        .select("id, issue_type, status, location, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error.message);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    fetchReports();
  }, []);

  // calculate stats
  const pendingCount = reports.filter((r) => r.status?.trim().toLowerCase() === "pending").length;
  const resolvedCount = reports.filter((r) => r.status?.trim().toLowerCase() === "resolved").length;
  const inProgressCount = reports.filter((r) => r.status?.trim().toLowerCase() === "in progress").length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Pending Issues" value={pendingCount} icon={<AlertCircle size={20} />} />
          <StatCard title="Resolved Issues" value={resolvedCount} icon={<CheckCircle size={20} />} />
          <StatCard title="In Progress" value={inProgressCount} icon={<Clock size={20} />} />
          <StatCard title="Total Issues" value={reports.length} icon={<Flame size={20} />} />
        </div>

        {/* All Reports Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#333333] mb-4">All Reports</h2>
          {loading ? (
            <p className="text-[#555555]">Loading reports...</p>
          ) : reports.length > 0 ? (
            <Table data={reports} />
          ) : (
            <p className="text-[#555555]">No reports available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
