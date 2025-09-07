import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// Auto-assign priority based on reports in same location
const assignPriorityByLocation = (reports) => {
  const locationCount = {};
  reports.forEach((r) => {
    const key = r.location || "Unknown";
    locationCount[key] = (locationCount[key] || 0) + 1;
  });

  return reports.map((r) => {
    const count = locationCount[r.location || "Unknown"];
    let priority = "Low";
    if (count >= 5) priority = "High";
    else if (count >= 3) priority = "Medium";
    return { ...r, priority };
  });
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch reports from Supabase (with images)
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          report_images ( image_url )
        `);

      if (error) {
        console.error("❌ Error fetching reports:", error.message);
      } else {
        setReports(assignPriorityByLocation(data));
      }
    };

    fetchReports();
  }, []);

  // Dashboard stats
  const totalReports = reports.length;
  const pending = reports.filter((r) => r.status === "Pending").length;
  const inProgress = reports.filter((r) => r.status === "In Progress").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  // Filtering logic
  const filteredReports = reports.filter((report) => {
    return (
      (categoryFilter === "All" || report.issue_type === categoryFilter) &&
      (priorityFilter === "All" || report.priority === priorityFilter) &&
      (searchQuery === "" ||
        report.location?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-600 px-2 py-1 rounded-lg text-sm";
      case "In Progress":
        return "bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-sm";
      case "Pending":
        return "bg-red-100 text-red-600 px-2 py-1 rounded-lg text-sm";
      default:
        return "px-2 py-1 rounded-lg text-sm";
    }
  };

  // Save changes to Supabase
  const handleSaveChanges = async () => {
    if (!selectedReport) return;
    const { data, error } = await supabase
      .from("reports")
      .update({
        status: selectedReport.status,
        admin_remark: selectedReport.admin_remark,
      })
      .eq("id", selectedReport.id)
      .select();

    if (error) {
      console.error("❌ Error updating report:", error.message);
    } else {
      console.log("✅ Updated:", data);
      const updated = reports.map((r) =>
        r.id === selectedReport.id ? { ...selectedReport } : r
      );
      setReports(assignPriorityByLocation(updated));
      setSelectedReport(null);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Reports Dashboard
      </h1>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Total Reports</h3>
          <p className="text-2xl font-bold text-gray-700">{totalReports}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Pending</h3>
          <p className="text-2xl font-bold text-red-500">{pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">In Progress</h3>
          <p className="text-2xl font-bold text-yellow-500">{inProgress}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Resolved</h3>
          <p className="text-2xl font-bold text-green-500">{resolved}</p>
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
          placeholder="Search by location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
        />
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <table className="w-full border-collapse text-gray-800">
          <thead className="bg-yellow-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Issue</th>
              <th className="p-3">Location</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Image</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t hover:bg-yellow-50 transition"
                >
                  <td className="p-3">{report.id.slice(0, 8)}...</td>
                  <td className="p-3">{report.issue_type}</td>
                  <td className="p-3">{report.location}</td>
                  <td className="p-3">{report.priority}</td>
                  <td className="p-3">
                    <span className={getStatusStyle(report.status)}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {report.report_images?.length > 0 ? (
                      <img
                        src={report.report_images[0].image_url}
                        alt="thumbnail"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-xl shadow"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-4 text-center text-gray-500 italic"
                >
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Report Details */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Report Details
            </h2>
            <div className="space-y-2 text-gray-600">
              <p><strong>ID:</strong> {selectedReport.id}</p>
              <p><strong>Issue:</strong> {selectedReport.issue_type}</p>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Location:</strong> {selectedReport.location}</p>
              <p><strong>Priority:</strong> {selectedReport.priority}</p>
              <p><strong>Reporter:</strong> {selectedReport.reporter_name}</p>
              <p><strong>Email:</strong> {selectedReport.reporter_email}</p>
              <p><strong>Submitted:</strong> {selectedReport.created_at}</p>
              <p><strong>Remarks:</strong> {selectedReport.admin_remark || "N/A"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusStyle(selectedReport.status)}>
                  {selectedReport.status}
                </span>
              </p>
            </div>

            {/* Uploaded Images Gallery */}
            {selectedReport.report_images?.length > 0 && (
              <div className="mt-4">
                <label className="block font-semibold mb-1">Uploaded Images</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.report_images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image_url}
                      alt={`Report Image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Admin Controls */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Update Status</label>
                <select
                  value={selectedReport.status}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      status: e.target.value,
                    })
                  }
                  className="border rounded-lg p-2 w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Photo Upload (only for In Progress / Resolved) */}
              {["In Progress", "Resolved"].includes(selectedReport.status) && (
                <div className="mt-3">
                  <label className="block font-semibold mb-1">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const filePath = `reports/${selectedReport.id}-${Date.now()}-${file.name}`;

                      const { error: uploadError } = await supabase.storage
                        .from("report-photos")
                        .upload(filePath, file);

                      if (uploadError) {
                        console.error("❌ Upload failed:", uploadError.message);
                        return;
                      }

                      const { data: urlData } = supabase.storage
                        .from("report-photos")
                        .getPublicUrl(filePath);

                      const publicUrl = urlData.publicUrl;

                      const { error: insertError } = await supabase
                        .from("report_images")
                        .insert({
                          report_id: selectedReport.id,
                          image_url: publicUrl,
                          uploaded_by: "admin",
                        });

                      if (insertError) {
                        console.error("❌ Error saving to report_images:", insertError.message);
                        return;
                      }

                      setSelectedReport({
                        ...selectedReport,
                        report_images: [
                          ...(selectedReport.report_images || []),
                          { image_url: publicUrl, uploaded_by: "admin" },
                        ],
                      });
                    }}
                    className="border rounded-lg p-2 w-full"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Remarks</label>
                <textarea
                  value={selectedReport.admin_remark || ""}
                  onChange={(e) =>
                    setSelectedReport({
                      ...selectedReport,
                      admin_remark: e.target.value,
                    })
                  }
                  className="border rounded-lg p-2 w-full"
                  rows="3"
                  placeholder="Add remarks..."
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal animation */}
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
