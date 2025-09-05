import { useState } from "react";

export default function Reports() {
  const mockReports = [
    { id: 1, issue: "Pothole on Main Street", category: "Potholes", priority: "High", status: "In Progress" },
    { id: 2, issue: "Streetlight outage", category: "Streetlights", priority: "Medium", status: "Open" },
    { id: 3, issue: "Overflowing trash bin", category: "Trash", priority: "Low", status: "Resolved" },
    { id: 4, issue: "Graffiti on bus stop", category: "Graffiti", priority: "Medium", status: "In Progress" },
  ];

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = mockReports.filter((report) => {
    return (
      (categoryFilter === "All" || report.category === categoryFilter) &&
      (priorityFilter === "All" || report.priority === priorityFilter) &&
      (searchQuery === "" ||
        report.issue.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-[#32CD32] text-white px-2 py-1 rounded-lg text-sm";
      case "In Progress":
        return "bg-[#FFB347] text-[#333] px-2 py-1 rounded-lg text-sm";
      case "Open":
        return "bg-[#FF4500] text-white px-2 py-1 rounded-lg text-sm";
      default:
        return "px-2 py-1 rounded-lg text-sm";
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(to bottom, #FFF9F0, #FFF1C6)" }}>
      <h1 className="text-3xl font-bold mb-6 text-[#333333]">Reports</h1>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Categories</option>
          <option value="Potholes">Potholes</option>
          <option value="Streetlights">Streetlights</option>
          <option value="Trash">Trash</option>
          <option value="Graffiti">Graffiti</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Optional search bar */}
        <input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-[#333333]">
          <thead className="bg-[#FFE4B5] text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Issue</th>
              <th className="p-3">Category</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id} className="border-t hover:bg-[#FFF9F0] transition">
                  <td className="p-3">{report.id}</td>
                  <td className="p-3">{report.issue}</td>
                  <td className="p-3">{report.category}</td>
                  <td className="p-3">{report.priority}</td>
                  <td className="p-3">
                    <span className={getStatusStyle(report.status)}>{report.status}</span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-1 rounded-xl shadow"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-[#333]">Report Details</h2>
            <div className="space-y-2 text-[#555]">
              <p><strong>ID:</strong> {selectedReport.id}</p>
              <p><strong>Issue:</strong> {selectedReport.issue}</p>
              <p><strong>Category:</strong> {selectedReport.category}</p>
              <p><strong>Priority:</strong> {selectedReport.priority}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusStyle(selectedReport.status)}>
                  {selectedReport.status}
                </span>
              </p>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-2 rounded-xl shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
