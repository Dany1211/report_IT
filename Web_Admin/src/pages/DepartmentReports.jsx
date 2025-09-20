import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Eye, Edit3, PlusCircle, X } from "lucide-react";
import { AlertCircle, CheckCircle, Clock, Flame, XCircle } from "lucide-react"; // Import icons for KPI cards

// Helper function to return the correct gradient and icon styles for the StatCard
const getStatCardStyles = (title) => {
  switch (title) {
    case "Pending":
      return {
     bgGradient: "bg-gradient-to-br from-[#FCE6DF] to-[#F5A9A7]", // Soft red
        iconBg: "bg-[#F56565]", // Dark gray-blue for icon
      };
    case "Resolved":
      return {
        bgGradient: "bg-gradient-to-br from-[#E0F3E0] to-[#A3D9A3]", // Soft green
        iconBg: "bg-[#2D8C2D]",
      };
    case "In Progress":
      return {
  bgGradient: "bg-gradient-to-br from-[#FFFDEB] to-[#FFF59D]", // Soft yellow
  iconBg: "bg-[#FFDA03]",
      };
    case "Rejected":
      return {
        bgGradient: "bg-gradient-to-br from-[#F0F4F8] to-[#D9DEE3]", // Light gray for Rejected
        iconBg: "bg-[#A0B0C0]",
      };
    case "Total Reports":
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

// StatCard component with updated styling and horizontal layout
const StatCard = ({ title, value, icon, styles }) => (
  <div
    className={`p-6 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${styles.bgGradient}`}
  >
    {/* This container aligns the icon and title horizontally */}
    <div className="flex items-center space-x-4">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${styles.iconBg}`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-800 uppercase">{title}</p>
    </div>

    {/* The value remains below for visual emphasis */}
    <p className="text-4xl font-extrabold text-gray-900 mt-2">{value}</p>
  </div>
);

export default function DepartmentReports() {
  const [reports, setReports] = useState([]);
  const [selectedDept, setSelectedDept] = useState("Public Works Department");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState({ priority: "", status: "" });
  const [kpis, setKpis] = useState({ Pending: 0, "In Progress": 0, Resolved: 0, Rejected: 0 });

  // NEW STATE for viewing task
  const [viewTaskModal, setViewTaskModal] = useState(false);
  const [viewTaskText, setViewTaskText] = useState("");

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

  // Fetch reports + tasks
  const fetchDepartmentReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`*, tasks(*)`)
      .eq("assigned_to_dept", selectedDept);

    if (error) {
      console.error(error.message);
    } else {
      setReports(data || []);
      calculateKPIs(data || []);
    }
    setLoading(false);
  };

  // Calculate KPI counts
  const calculateKPIs = (data) => {
    const counts = { Pending: 0, "In Progress": 0, Resolved: 0, Rejected: 0 };
    data.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    setKpis(counts);
  };

  useEffect(() => {
    fetchDepartmentReports();
  }, [selectedDept]);

  // Assign or update task
  const handleSaveTask = async () => {
    if (!taskDescription.trim()) {
      setMessage("❌ Please enter a task description");
      return;
    }

    if (editMode) {
      const { error } = await supabase
        .from("tasks")
        .update({ task_description: taskDescription })
        .eq("report_id", currentReportId)
        .eq("department", selectedDept);

      if (error) {
        console.log("❌ Error updating task:", error.message);
        setMessage("❌ Failed to update task.");
      } else {
        setMessage("✅ Task updated successfully!");
      }
    } else {
      const { error } = await supabase.from("tasks").insert([
        {
          report_id: currentReportId,
          department: selectedDept,
          task_description: taskDescription,
          status: "Pending",
        },
      ]);

      if (error) {
        console.log("❌ Error assigning task:", error.message);
        setMessage("❌ Failed to assign task.");
      } else {
        await supabase.from("reports").update({ status: "In Progress" }).eq("id", currentReportId);
        setMessage("✅ Task assigned successfully!");
      }
    }

    setTaskDescription("");
    setEditMode(false);
    setShowModal(false);
    fetchDepartmentReports();
    setTimeout(() => setMessage(""), 4000);
  };

  // Apply filters
  const filteredReports = reports.filter((r) => {
    const matchPriority = filters.priority ? r.priority === filters.priority : true;
    const matchStatus = filters.status ? r.status === filters.status : true;
    return matchPriority && matchStatus;
  });

  // Helper function to get the correct icon for the StatCard
  const getIconForStatus = (status) => {
    switch (status) {
      case "Pending":
        return <AlertCircle size={24} />;
      case "Resolved":
        return <CheckCircle size={24} />;
      case "In Progress":
        return <Clock size={24} />;
      case "Rejected":
        return <XCircle size={24} />;
      case "Total Reports":
        return <Flame size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#E8EDF4]">
      <h1 className="text-3xl font-bold mb-6 text-[#1A202C]">
        {selectedDept} – Reports
      </h1>

      {/* KPI Cards (using the new StatCard component) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={getIconForStatus("Total Reports")}
          styles={getStatCardStyles("Total Reports")}
        />
        <StatCard
          title="Pending"
          value={kpis.Pending}
          icon={getIconForStatus("Pending")}
          styles={getStatCardStyles("Pending")}
        />
        <StatCard
          title="In Progress"
          value={kpis["In Progress"]}
          icon={getIconForStatus("In Progress")}
          styles={getStatCardStyles("In Progress")}
        />
        <StatCard
          title="Resolved"
          value={kpis.Resolved}
          icon={getIconForStatus("Resolved")}
          styles={getStatCardStyles("Resolved")}
        />
        <StatCard
          title="Rejected"
          value={kpis.Rejected}
          icon={getIconForStatus("Rejected")}
          styles={getStatCardStyles("Rejected")}
        />
      </div>

      {/* Notifications */}
      {message && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-500 text-white">
          {message}
        </div>
      )}

      {/* Department Selector + Filters in one line */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border border-[#A0B0C0] rounded-lg p-2 bg-white shadow-sm"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-[#A0B0C0] rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-[#A0B0C0] rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Reports Table */}
      {loading ? (
        <p>Loading reports...</p>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#A0B0C0]">
          <table className="w-full border-collapse text-[#4A5568]">
            <thead className="bg-[#E0E7F5] text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Issue</th>
                <th className="p-3">Location</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Task</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => {
                const task = report.tasks?.[0];
                return (
                  <tr
                    key={report.id}
                    className="border-t border-[#A0B0C0] hover:bg-[#F0F4F8] transition"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{report.issue_type}</td>
                    <td className="p-3">{report.location}</td>
                    <td className="p-3">{report.priority || "—"}</td>
                    <td className="p-3">{report.status}</td>
                    <td className="p-3 flex items-center gap-2">
                      {task ? (
                        <button
                          onClick={() => {
                            setViewTaskText(task.task_description);
                            setViewTaskModal(true);
                          }}
                          className="flex items-center gap-1 bg-[#4A5568] hover:bg-[#323a49] text-white px-3 py-1 rounded-lg shadow transition"
                        >
                          <Eye size={16} /> View
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setCurrentReportId(report.id);
                          setTaskDescription(task ? task.task_description : "");
                          setEditMode(!!task);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 bg-[#F56565] hover:bg-[#D64545] text-white px-3 py-1 rounded-lg shadow transition"
                      >
                        {task ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                        {task ? "Edit Task" : "Assign Task"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No reports assigned to this department yet.</p>
      )}

      {/* Modal for Assign/Edit Task */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96 border border-[#A0B0C0]">
            <h2 className="text-xl font-bold mb-4 text-[#1A202C]">
              {editMode ? "Edit Task" : "Assign Task"}
            </h2>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter task details..."
              className="w-full p-2 border border-[#A0B0C0] rounded-lg mb-4 text-[#4A5568]"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTaskDescription("");
                  setEditMode(false);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#E2E8F0] hover:bg-[#D1D8E3] text-[#4A5568]"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSaveTask}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#2D8C2D] text-white hover:bg-[#206620]"
              >
                {editMode ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                {editMode ? "Update" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Viewing Task */}
      {viewTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96 border border-[#A0B0C0]">
            <h2 className="text-xl font-bold mb-4 text-[#1A202C]">Task Details</h2>
            <p className="text-[#4A5568] mb-4 whitespace-pre-line">{viewTaskText}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setViewTaskModal(false)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#F56565] text-white hover:bg-[#D64545]"
              >
                <X size={16} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}