// import StatCard from "../components/StateCArd";
// import Table from "../components/Tables"; // Correctly import the Tables component
// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// export default function Home() {
//   // This is where you would fetch your data from Supabase.
//   // For now, we'll use some mock data to make the Table component functional.
//   const mockReports = [
//     {
//       id: 1,
//       issue: "Pothole on Main Street",
//       status: "In Progress",
//       location: "37.7749° N, 122.4194° W",
//     },
//     {
//       id: 2,
//       issue: "Streetlight outage",
//       status: "Open",
//       location: "37.7818° N, 122.4085° W",
//     },
//     {
//       id: 3,
//       issue: "Overflowing trash bin",
//       status: "Resolved",
//       location: "37.7788° N, 122.4124° W",
//     },
//     {
//       id: 4,
//       issue: "Graffiti on bus stop",
//       status: "In Progress",
//       location: "37.7766° N, 122.4098° W",
//     },
//   ];

//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

//       {/* Stat Cards Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Open Issues"
//           value="42"
//           icon={<AlertCircle size={20} />}
//         />
//         <StatCard
//           title="Resolved This Week"
//           value="128"
//           icon={<CheckCircle size={20} />}
//         />
//         <StatCard
//           title="Avg. Resolution Time"
//           value="5h 20m"
//           icon={<Clock size={20} />}
//         />
//         <StatCard
//           title="High Priority Issues"
//           value="7"
//           icon={<Flame size={20} />}
//         />
//       </div>

//       {/* Adding a space below the stat cards */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold text-gray-700 mb-4">
//           Recent Reports
//         </h2>
//         <Table data={mockReports} />
//       </div>
//     </div>
//   );
// }

// import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// // StatCard component with new styling
// const StatCard = ({ title, value, icon }) => (
//   <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
//     <div>
//       <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
//       <p className="text-2xl font-semibold text-[#333333] mt-1">{value}</p>
//     </div>
//     <div className="text-[#FFA500] bg-[#FFE4B5] rounded-full p-3 flex items-center justify-center">
//       {icon}
//     </div>
//   </div>
// );

// // Helper function to get status colors
// const getStatusColor = (status) => {
//   switch (status) {
//     case "Open":
//       return "text-[#FF4500] bg-[#FF4500]/10";
//     case "In Progress":
//       return "text-[#FFB347] bg-[#FFB347]/10";
//     case "Resolved":
//       return "text-[#32CD32] bg-[#32CD32]/10";
//     default:
//       return "text-gray-500 bg-gray-500/10";
//   }
// };

// // Table component with new styling
// const Table = ({ data }) => (
//   <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
//     <table className="min-w-full divide-y divide-gray-200">
//       <thead className="bg-[#FFF9F0]">
//         <tr>
//           <th
//             scope="col"
//             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//           >
//             Issue
//           </th>
//           <th
//             scope="col"
//             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//           >
//             Status
//           </th>
//           <th
//             scope="col"
//             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//           >
//             Location
//           </th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-gray-200">
//         {data.map((report) => (
//           <tr key={report.id}>
//             <td className="px-6 py-4 whitespace-nowrap">
//               <div className="text-sm font-medium text-[#555555]">{report.issue}</div>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap">
//               <span
//                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
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

// // Main App component
// export default function App() {
//   const mockReports = [
//     {
//       id: 1,
//       issue: "Pothole on Main Street",
//       status: "In Progress",
//       location: "37.7749° N, 122.4194° W",
//     },
//     {
//       id: 2,
//       issue: "Streetlight outage",
//       status: "Open",
//       location: "37.7818° N, 122.4085° W",
//     },
//     {
//       id: 3,
//       issue: "Overflowing trash bin",
//       status: "Resolved",
//       location: "37.7788° N, 122.4124° W",
//     },
//     {
//       id: 4,
//       issue: "Graffiti on bus stop",
//       status: "In Progress",
//       location: "37.7766° N, 122.4098° W",
//     },
//   ];

//   return (
//     <div className="min-h-screen p-8 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
//       <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

//       {/* Stat Cards Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Open Issues"
//           value="42"
//           icon={<AlertCircle size={20} />}
//         />
//         <StatCard
//           title="Resolved This Week"
//           value="128"
//           icon={<CheckCircle size={20} />}
//         />
//         <StatCard
//           title="Avg. Resolution Time"
//           value="5h 20m"
//           icon={<Clock size={20} />}
//         />
//         <StatCard
//           title="High Priority Issues"
//           value="7"
//           icon={<Flame size={20} />}
//         />
//       </div>

//       {/* Adding a space below the stat cards */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold text-[#555555] mb-4">
//           Recent Reports
//         </h2>
//         <Table data={mockReports} />
//       </div>
//     </div>
//   );
// }


import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// StatCard component with new styling
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold text-[#333333] mt-1">{value}</p>
    </div>
    <div className="text-[#FFA500] bg-[#FFE4B5] rounded-full p-3 flex items-center justify-center">
      {icon}
    </div>
  </div>
);

// Helper function to get status colors
const getStatusColor = (status) => {
  switch (status) {
    case "Open":
      return "text-[#FF4500] bg-[#FF4500]/10";
    case "In Progress":
      return "text-[#FFB347] bg-[#FFB347]/10";
    case "Resolved":
      return "text-[#32CD32] bg-[#32CD32]/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

// Table component with new styling
const Table = ({ data }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-[#FFF9F0]">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Issue
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Location
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((report) => (
          <tr key={report.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-[#555555]">{report.issue}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#555555]">
              {report.location}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Main App component
export default function App() {
  const mockReports = [
    {
      id: 1,
      issue: "Pothole on Main Street",
      status: "In Progress",
      location: "37.7749° N, 122.4194° W",
    },
    {
      id: 2,
      issue: "Streetlight outage",
      status: "Open",
      location: "37.7818° N, 122.4085° W",
    },
    {
      id: 3,
      issue: "Overflowing trash bin",
      status: "Resolved",
      location: "37.7788° N, 122.4124° W",
    },
    {
      id: 4,
      issue: "Graffiti on bus stop",
      status: "In Progress",
      location: "37.7766° N, 122.4098° W",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Open Issues"
            value="42"
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            title="Resolved This Week"
            value="128"
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="Avg. Resolution Time"
            value="5h 20m"
            icon={<Clock size={20} />}
          />
          <StatCard
            title="High Priority Issues"
            value="7"
            icon={<Flame size={20} />}
          />
        </div>

        {/* Adding a space below the stat cards */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#555555] mb-4">
            Recent Reports
          </h2>
          <Table data={mockReports} />
        </div>
      </div>
    </div>
  );
}
