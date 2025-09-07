import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // make sure path is correct
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// StatCard component
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

// Status color helper
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "text-[#FF4500] bg-[#FF4500]/10";
    case "In Progress":
      return "text-[#FFB347] bg-[#FFB347]/10";
    case "Resolved":
      return "text-[#32CD32] bg-[#32CD32]/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

// Table component
const Table = ({ data }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-[#FFF9F0]">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Issue
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((report) => (
          <tr key={report.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-[#555555]">
                {report.issue_type}
              </div>
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

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch reports from supabase
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("id, issue_type, status, location, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching reports:", error.message);
      } else {
        setReports(data);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  // calculate stats
  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;
  const inProgressCount = reports.filter((r) => r.status === "In Progress").length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6] overflow-hidden">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#333333] mb-6">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Issues"
            value={pendingCount}
            icon={<AlertCircle size={20} />}
          />
          <StatCard
            title="Resolved Issues"
            value={resolvedCount}
            icon={<CheckCircle size={20} />}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={<Clock size={20} />}
          />
          <StatCard
            title="Total Issues"
            value={reports.length}
            icon={<Flame size={20} />}
          />
        </div>

        {/* Recent Reports */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#555555] mb-4">
            Recent Reports
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading reports...</p>
          ) : reports.length > 0 ? (
            <Table data={reports} />
          ) : (
            <p className="text-gray-500">No reports available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
