import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // adjust path if needed
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*");

      if (error) {
        console.error("Error fetching reports:", error);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  if (loading) {
    return <p className="p-6">Loading analytics...</p>;
  }

  // ---------- KPI Overview ----------
  const totalIssues = reports.length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const avgResolutionTime = 4.5; // placeholder until resolved_at column exists

  // ---------- Monthly Trend ----------
  const monthlyMap = {};
  reports.forEach(r => {
    const month = format(new Date(r.created_at), "MMM");
    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, reported: 0, resolved: 0 };
    }
    monthlyMap[month].reported++;
    if (r.status === "Resolved") {
      monthlyMap[month].resolved++;
    }
  });
  const issuesTrend = Object.values(monthlyMap);

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

  // ---------- Priority (placeholder until column exists) ----------
  const priorityData = [
    { name: "High", value: 0 },
    { name: "Medium", value: 0 },
    { name: "Low", value: 0 },
  ];

  // ---------- Resolution Time Trend (placeholder) ----------
  const resolutionTimeTrend = [
    { week: "Week 1", avgTime: 0 },
    { week: "Week 2", avgTime: 0 },
  ];

  // Theme colors
  const COLORS = ["#facc15", "#3b82f6", "#6b7280", "#ef4444"];

  return (
    <div className="space-y-10 p-6 bg-gray-50 min-h-screen">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Total Issues</h3>
          <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Resolved</h3>
          <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Avg. Resolution Time</h3>
          <p className="text-2xl font-bold text-blue-600">{avgResolutionTime}h</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Reported vs Resolved (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={issuesTrend} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip />
            <Legend />
            <Bar dataKey="reported" fill="#facc15" radius={[6, 6, 0, 0]} />
            <Bar dataKey="resolved" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Issues by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Issues by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Issues by Priority</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Avg. Resolution Time (Weekly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={resolutionTimeTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#374151" />
            <YAxis stroke="#374151" label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgTime" stroke="#facc15" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
