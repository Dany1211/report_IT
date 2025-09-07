import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // adjust import path

// ✅ Assign priority by area (or fallback to location if area is null)
const assignPriorityByArea = (reports) => {
  const areaCount = {};
  reports.forEach((r) => {
    const key = r.area || r.location;
    areaCount[key] = (areaCount[key] || 0) + 1;
  });

  return reports.map((r) => {
    const key = r.area || r.location;
    let priority = "Low";
    if (areaCount[key] >= 5) {
      priority = "High";
    } else if (areaCount[key] >= 3) {
      priority = "Medium";
    }
    return { ...r, priority };
  });
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // ✅ Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, reporter_id, reporter_name, reporter_email, issue_type, description, area, location, remarks, status, created_at");

      if (error) {
        console.error("Error fetching reports:", error.message);
      } else {
        setReports(assignPriorityByArea(data));
      }
    };

    fetchReports();
  }, []);

  // Dashboard stats
  const totalReports = reports.length;
  const openReports = reports.filter((r) => r.status === "Pending").length;
  const inProgressReports = reports.filter((r) => r.status === "In Progress").length;
  const resolvedReports = reports.filter((r) => r.status === "Resolved").length;

  // Filtering
  const filteredReports = reports.filter((report) => {
    return (
      (categoryFilter === "All" || report.issue_type === categoryFilter) &&
      (priorityFilter === "All" || report.priority === priorityFilter) &&
      (searchQuery === "" ||
        report.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.area?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Badge styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-[#32CD32]/10 text-[#32CD32] px-2 py-1 rounded-lg text-sm";
      case "In Progress":
        return "bg-[#FFB347]/10 text-[#FFB347] px-2 py-1 rounded-lg text-sm";
      case "Pending":
        return "bg-[#FF4500]/10 text-[#FF4500] px-2 py-1 rounded-lg text-sm";
      default:
        return "px-2 py-1 rounded-lg text-sm";
    }
  };

  // ✅ Save changes
  const handleSaveChanges = async () => {
    const { error } = await supabase
      .from("reports")
      .update({
        status: selectedReport.status,
        remarks: selectedReport.remarks,
      })
      .eq("id", selectedReport.id);

    if (error) {
      console.error("Error updating report:", error.message);
    } else {
      // Refresh state
      const updated = reports.map((r) =>
        r.id === selectedReport.id ? { ...selectedReport } : r
      );
      setReports(assignPriorityByArea(updated));
      setSelectedReport(null);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(to bottom, #FFF9F0, #FFF1C6)" }}>
      <h1 className="text-3xl font-bold mb-6 text-[#333333]">Reports</h1>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Reports</h3>
          <p className="text-2xl font-bold text-[#333]">{totalReports}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Pending</h3>
          <p className="text-2xl font-bold text-[#FF4500]">{openReports}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">In Progress</h3>
          <p className="text-2xl font-bold text-[#FFB347]">{inProgressReports}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Resolved</h3>
          <p className="text-2xl font-bold text-[#32CD32]">{resolvedReports}</p>
        </div>
      </div>

      {/* Filters */}
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

        <input
          type="text"
          placeholder="Search by area or location..."
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
              <th className="p-3">Area</th>
              <th className="p-3">Location</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id} className="border-t hover:bg-[#FFF9F0] transition">
                  <td className="p-3">{report.id.slice(0, 8)}...</td>
                  <td className="p-3">{report.issue_type}</td>
                  <td className="p-3">{report.area || "N/A"}</td>
                  <td className="p-3">{report.location}</td>
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
                <td colSpan="7" className="p-4 text-center text-gray-500">
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
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-[#333]">Report Details</h2>
            <div className="space-y-2 text-[#555]">
              <p><strong>ID:</strong> {selectedReport.id}</p>
              <p><strong>Issue:</strong> {selectedReport.issue_type}</p>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Area:</strong> {selectedReport.area || "N/A"}</p>
              <p><strong>Location:</strong> {selectedReport.location}</p>
              <p><strong>Priority:</strong> {selectedReport.priority}</p>
              <p><strong>Reporter:</strong> {selectedReport.reporter_name}</p>
              <p><strong>Email:</strong> {selectedReport.reporter_email}</p>
              <p><strong>Submitted At:</strong> {selectedReport.created_at}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusStyle(selectedReport.status)}>
                  {selectedReport.status}
                </span>
              </p>
            </div>

            {/* Admin Actions */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Update Status</label>
                <select
                  value={selectedReport.status}
                  onChange={(e) => setSelectedReport({ ...selectedReport, status: e.target.value })}
                  className="border rounded-lg p-2 w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes</label>
                <textarea
                  value={selectedReport.remarks || ""}
                  onChange={(e) => setSelectedReport({ ...selectedReport, remarks: e.target.value })}
                  className="border rounded-lg p-2 w-full"
                  rows="3"
                  placeholder="Add remarks or update notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-xl shadow"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-2 rounded-xl shadow"
              >
                Save Changes
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
