import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function Analytics() {
  // Mock Data (replace with backend API later)
  const issuesTrend = [
    { month: "Jan", reported: 120, resolved: 100 },
    { month: "Feb", reported: 140, resolved: 110 },
    { month: "Mar", reported: 180, resolved: 150 },
    { month: "Apr", reported: 200, resolved: 170 },
  ];

  const categoryData = [
    { name: "Potholes", value: 45 },
    { name: "Streetlights", value: 30 },
    { name: "Trash", value: 25 },
    { name: "Graffiti", value: 15 },
  ];

  const statusData = [
    { name: "Resolved", value: 150 },
    { name: "Pending", value: 60 },
    { name: "In Progress", value: 40 },
  ];

  const priorityData = [
    { name: "High", value: 20 },
    { name: "Medium", value: 50 },
    { name: "Low", value: 30 },
  ];

  const resolutionTimeTrend = [
    { week: "Week 1", avgTime: 6 },
    { week: "Week 2", avgTime: 5 },
    { week: "Week 3", avgTime: 4.5 },
    { week: "Week 4", avgTime: 4 },
  ];

  // Theme colors
  const COLORS = ["#facc15", "#3b82f6", "#6b7280", "#ef4444"];

  return (
    <div className="space-y-10 p-6 bg-gray-50 min-h-screen">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Total Issues</h3>
          <p className="text-2xl font-bold text-gray-900">250</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Resolved</h3>
          <p className="text-2xl font-bold text-green-600">150</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-500">60</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center">
          <h3 className="text-gray-500">Avg. Resolution Time</h3>
          <p className="text-2xl font-bold text-blue-600">4.5h</p>
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
