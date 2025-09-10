import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function DepartmentReports() {
  const [reports, setReports] = useState([]);
  const [selectedDept, setSelectedDept] = useState("Public Works Department"); // default dept
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const departments = [
    "Public Works Department",
    "Sanitation & Waste Management",
    "Electrical & Traffic Services",
    "Environmental & Health Services",
    "Parks & Facilities Management",
    "Police / Public Safety",
    "Animal Control Services",
    "Citizen Services / General Help",
  ];

  // Fetch reports for selected department
  const fetchDepartmentReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
        *,
        report_images ( image_url ),
        admin_report_images ( image_url, uploaded_by )
      `
      )
      .eq("assigned_to_dept", selectedDept);

    if (error) {
      console.error("❌ Error fetching dept reports:", error.message);
      setMessage("❌ Failed to fetch reports.");
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartmentReports();
  }, [selectedDept]);

  // Assign report to current department
  const handleAssignTask = async (reportId) => {
    const { error } = await supabase
      .from("reports")
      .update({ assigned_to_dept: selectedDept, status: "In Progress" })
      .eq("id", reportId);

    if (error) {
      console.error("❌ Error assigning task:", error.message);
      setMessage("❌ Failed to assign task.");
    } else {
      setMessage("✅ Task assigned to " + selectedDept);
      fetchDepartmentReports();
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      <h1 className="text-3xl font-bold mb-6 text-[#333333]">
        {selectedDept} – Reports
      </h1>

      {/* Message / Notification */}
      {message && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-500 text-white">
          {message}
        </div>
      )}

      {/* Department Selector */}
      <select
        value={selectedDept}
        onChange={(e) => setSelectedDept(e.target.value)}
        className="border border-[#FFE4B5] rounded-lg p-2 mb-6 bg-white shadow-sm"
      >
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#FFE4B5]">
          <table className="w-full border-collapse text-[#333333]">
            <thead className="bg-[#FFE4B5] text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Issue</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr
                  key={report.id}
                  className="border-t border-[#FFE4B5] hover:bg-[#FFF9F0] transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{report.issue_type}</td>
                  <td className="p-3">{report.location}</td>
                  <td className="p-3">{report.status}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleAssignTask(report.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-xl shadow"
                    >
                      Assign Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No reports assigned to this department yet.</p>
      )}
    </div>
  );
}
