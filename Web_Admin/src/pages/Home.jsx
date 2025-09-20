import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// Theme-based card styles
const getStatCardStyles = (title) => {
  switch (title) {
    case "Pending Issues":
      return {
        bgGradient: "bg-gradient-to-br from-[#FCE6DF] to-[#F5A9A7]", // Soft red
        iconBg: "bg-[#F56565]", // Dark gray-blue for icon
      };
    case "Resolved Issues":
      return {
        bgGradient: "bg-gradient-to-br from-[#E0F3E0] to-[#A3D9A3]", // Soft green
        iconBg: "bg-[#2D8C2D]",
      };
    case "In Progress":
    return {
  bgGradient: "bg-gradient-to-br from-[#FFFDEB] to-[#FFF59D]", // Soft yellow
  iconBg: "bg-[#FFDA03]",
};
    case "Total Issues":
      return {
        bgGradient: "bg-gradient-to-br from-[#E2E8F0] to-[#B8C4D4]", // Primary light gray-blue
        iconBg: "bg-[#4A5568]",
      };
    default:
      return {
        bgGradient: "bg-gradient-to-br from-[#F0F4F8] to-[#D9DEE3]",
        iconBg: "bg-[#A0B0C0]",
      };
  }
};

const StatCard = ({ title, value, icon, styles }) => (
  <div
    className={`p-6 rounded-2xl shadow-md transform transition-transform duration-300 hover:scale-105 ${styles.bgGradient}`}
  >
    <div className="flex items-center space-x-4">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${styles.iconBg}`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#4A5568] uppercase">{title}</p>
    </div>
    <p className="text-4xl font-extrabold text-[#1A202C] mt-2">{value}</p>
  </div>
);

// Badge colors for table
const getStatusColor = (status) => {
  if (!status) return "text-[#A0B0C0] bg-[#E2E8F0]";
  const s = status.trim().toLowerCase();
  switch (s) {
    case "pending":
      return "text-red-500 bg-red-100";
    case "in progress":
      return "text-orange-500 bg-orange-100";
    case "resolved":
      return "text-green-500 bg-green-100";
    default:
      return "text-[#4A5568] bg-[#E2E8F0]";
  }
};

const Table = ({ data }) => (
  <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-[#A0B0C0]">
    <table className="min-w-full text-[#4A5568]">
      <thead className="bg-[#E0E7F5]">
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
            className="border-t border-[#A0B0C0] hover:bg-[#F0F4F8] transition"
          >
            <td className="p-3 text-sm font-medium">{report.issue_type}</td>
            <td className="p-3">
              <span
                className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status}
              </span>
            </td>
            <td className="p-3 text-sm truncate max-w-xs">
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
      const { data, error } = await supabase
        .from("reports")
        .select("id, issue_type, status, location, created_at, description");
      if (!error) setReports(data || []);
      setLoading(false);
    };
    fetchReports();
  }, []);

  const pending = reports.filter((r) => r.status?.toLowerCase() === "pending").length;
  const resolved = reports.filter((r) => r.status?.toLowerCase() === "resolved").length;
  const progress = reports.filter((r) => r.status?.toLowerCase() === "in progress").length;
  const recent = [...reports]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15);

  return (
    <div className="min-h-screen w-full bg-[#E8EDF4]">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#1A202C] mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Issues"
            value={reports.length}
            icon={<Flame size={24} />}
            styles={getStatCardStyles("Total Issues")}
          />
          <StatCard
            title="Pending Issues"
            value={pending}
            icon={<AlertCircle size={24} />}
            styles={getStatCardStyles("Pending Issues")}
          />
          <StatCard
            title="In Progress"
            value={progress}
            icon={<Clock size={24} />}
            styles={getStatCardStyles("In Progress")}
          />
          <StatCard
            title="Resolved Issues"
            value={resolved}
            icon={<CheckCircle size={24} />}
            styles={getStatCardStyles("Resolved Issues")}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#1A202C] mb-4">
            Recent Reports
          </h2>
          {loading ? (
            <p className="text-[#4A5568]">Loading reports...</p>
          ) : reports.length > 0 ? (
            <>
              <Table data={recent} />
              <div className="mt-4">
                <button
                  onClick={() => navigate("/reports")}
                  className="bg-[#4A5568] hover:bg-[#323a49] text-white px-6 py-2 rounded-xl shadow font-semibold"
                >
                  View All Reports
                </button>
              </div>
            </>
          ) : (
            <p className="text-[#4A5568]">No reports available.</p>
          )}
        </div>
      </div>
    </div>
  );
}