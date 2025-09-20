import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { format } from "date-fns";
import { useLocation } from "react-router-dom"; // Add this hook
import { AlertCircle, CheckCircle, Clock, Flame, XCircle } from "lucide-react";

// Helper function to return the correct gradient and icon styles for the StatCard
const getStatCardStyles = (title) => {
  switch (title) {
    case "Pending":
      return {
        bgGradient: "bg-gradient-to-br from-[#F87171] to-[#DC2626]", // Warm deep red
        iconBg: "bg-[#B91C1C]", // Dark red for icon
      };
    case "Resolved":
      return {
        bgGradient: "bg-gradient-to-br from-green-200 to-green-400", // Green for Resolved
        iconBg: "bg-green-300",
      };
    case "In Progress":
      return {
        bgGradient: "bg-gradient-to-br from-orange-200 to-orange-400", // Orange for In Progress
        iconBg: "bg-orange-300",
      };
    case "Rejected":
      return {
        bgGradient: "bg-gradient-to-br from-gray-200 to-gray-400", // Gray for Rejected
        iconBg: "bg-gray-300",
      };
    case "Total Reports":
      return {
        bgGradient: "bg-gradient-to-br from-purple-200 to-purple-400", // Purple for Total
        iconBg: "bg-purple-300",
      };
    default:
      return {
        bgGradient: "bg-gradient-to-br from-gray-200 to-gray-400",
        iconBg: "bg-gray-300",
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

// Auto-assign priority based on reports in same location
// Auto-assign priority but keep admin's choice
const assignPriorityByLocation = (reports) => {
  const locationCount = {};
  reports.forEach((r) => {
    const key = r.location || "Unknown";
    locationCount[key] = (locationCount[key] || 0) + 1;
  });

  return reports.map((r) => {
    // If admin has already set priority, keep it
    if (r.priority && ["Low", "Medium", "High"].includes(r.priority)) {
      return r;
    }

    // Otherwise assign automatically
    let priority = "Low";
    if (locationCount[r.location || "Unknown"] >= 5) priority = "High";
    else if (locationCount[r.location || "Unknown"] >= 3) priority = "Medium";

    return { ...r, priority };
  });
};

// New helper function to suggest a department based on issue type
const suggestDepartment = (issue_type) => {
  switch (issue_type) {
    case "Potholes":
    case "Broken Sidewalks":
    case "Road Damage":
    case "Blocked Drains":
    case "Missing Signage":
    case "Construction Debris":
    case "Fallen Trees":
      return "Public Works Department";
    case "Overflowing Trash Bins":
    case "Illegal Dumping":
    case "Hazardous Waste":
      return "Sanitation & Waste Management";
    case "Streetlights":
    case "Traffic Signals":
      return "Electrical & Traffic Services";
    case "Noise Complaints":
    case "Water Leakage":
      return "Environmental & Health Services";
    case "Public Restroom Issues":
    case "Vandalism":
      return "Parks & Facilities Management";
    case "Abandoned Vehicles":
    case "Animal Control":
      return "Police / Public Safety";
    case "Other":
      return "Citizen Services / General Help";
    default:
      return "";
  }
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [initialReportCount, setInitialReportCount] = useState(0);

  // New state for sorting by date
  const [sortBy, setSortBy] = useState("latest"); // Default to latest first

  const location = useLocation(); // Add this hook

  const departments = [
    "Public Works Department",
    "Sanitation & Waste Management",
    "Electrical & Traffic Services",
    "Environmental & Health Services",
    "Parks & Facilities Management",
    "Police / Public Safety",
    "Animal Control Services",
    "Citizen Services / General Help"
  ];

  // Function to fetch all data
  const fetchReports = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        report_images ( image_url ),
        admin_report_images ( image_url, uploaded_by )
      `);

    if (error) {
      console.error("❌ Error fetching reports:", error.message);
      setMessage("❌ Failed to fetch reports.");
      setTimeout(() => setMessage(""), 5000);
    } else if (data) {
      setReports(assignPriorityByLocation(data));

      // Corrected logic for notifications
      if (data.length > initialReportCount) {
        setMessage("✅ New report added!");
      } else {
        setMessage("No new reports.");
      }
      setTimeout(() => setMessage(""), 5000); 
      setInitialReportCount(data.length);
    }
    setIsRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
      const fetchInitialReports = async () => {
          const { data, error } = await supabase
            .from("reports")
            .select(`
              *,
              report_images ( image_url ),
              admin_report_images ( image_url, uploaded_by )
            `);

          if (error) {
            console.error("❌ Error fetching reports:", error.message);
            // Don't set reports state if there's an error
          } else if (data) {
            setReports(assignPriorityByLocation(data));
            setInitialReportCount(data.length); // Set initial count
          }
        };

        fetchInitialReports();
  }, []);

  // New useEffect hook to mark feedback as read when the admin views a resolved report
  useEffect(() => {
    const markFeedbackAsRead = async () => {
      // Only update if a report is selected, is resolved, and feedback hasn't been read
      if (selectedReport && selectedReport.status === 'Resolved' && !selectedReport.feedback_read) {
        const { error } = await supabase
          .from('reports')
          .update({ feedback_read: true })
          .eq('id', selectedReport.id);

        if (error) {
          console.error('Error marking feedback as read:', error.message);
        } else {
          // Optimistically update local state to reflect the change immediately
          setReports(prevReports =>
            prevReports.map(r =>
              r.id === selectedReport.id ? { ...r, feedback_read: true } : r
            )
          );
        }
      }
    };
    markFeedbackAsRead();
  }, [selectedReport]);

  // New useEffect to handle navigation from the Analytics page
  useEffect(() => {
    if (location.state?.reportId && reports.length > 0) {
      const reportToSelect = reports.find(r => r.id === location.state.reportId);
      if (reportToSelect) {
        const index = reports.indexOf(reportToSelect);
        handleSelectReport(reportToSelect, index);
        window.history.replaceState({}, document.title); // Clear the state to prevent modal from reopening on refresh
      }
    }
  }, [location.state, reports]);

  // Dashboard stats
  const totalReports = reports.length;
  const pending = reports.filter((r) => r.status === "Pending").length;
  const inProgress = reports.filter((r) => r.status === "In Progress").length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const rejected = reports.filter((r) => r.status === "Rejected").length; // New rejected count

  // Filter and sort
  const filteredReports = reports
    .filter((report) => {
      const reportDate = new Date(report.created_at);
      const filterDate = dateFilter ? new Date(dateFilter) : null;
      return (
        (categoryFilter === "All" || report.issue_type === categoryFilter) &&
        (priorityFilter === "All" || report.priority === priorityFilter) &&
        (statusFilter === "All" || report.status === statusFilter) &&
        (searchQuery === "" ||
          report.location?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!filterDate || reportDate.toDateString() === filterDate.toDateString())
      );
    })
    .sort((a, b) => {
      // Sort reports based on the 'sortBy' state
      if (sortBy === 'latest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });

  // Status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-[#32CD32]/10 text-[#32CD32] px-2 py-1 rounded-lg text-sm";
      case "In Progress":
        return "bg-[#FFB347]/10 text-[#FFB347] px-2 py-1 rounded-lg text-sm";
      case "Pending":
        return "bg-[#FF4500]/10 text-[#FF4500] px-2 py-1 rounded-lg text-sm";
      case "Rejected": // New rejected style
        return "bg-gray-500/10 text-gray-500 px-2 py-1 rounded-lg text-sm";
      default:
        return "px-2 py-1 rounded-lg text-sm text-[#555]";
    }
  };

  // Save changes to Supabase
  const handleSaveChanges = async () => {
    if (!selectedReport) return;

    const requiresDept = ["In Progress", "Resolved"].includes(selectedReport.status);
    const requiresRemark = ["In Progress", "Resolved", "Rejected"].includes(selectedReport.status);

    if (requiresDept && !selectedDept) {
      setMessage("Please select a department.");
      return;
    }

    // New condition to check for a remark
    if (requiresRemark && !selectedReport.admin_remark) {
      setMessage("Please add a remark before saving changes.");
      return;
    }

    const { error } = await supabase
      .from("reports")
      .update({
        status: selectedReport.status,
        admin_remark: selectedReport.admin_remark,
        priority: selectedReport.priority,
        assigned_to_dept: selectedDept,
      })
      .eq("id", selectedReport.id);

    if (error) {
      console.error("❌ Error updating report:", error.message);
      setMessage("❌ Failed to save changes.");
    } else {
      await fetchReports();
      setSelectedReport(null);
      setSelectedDept("");
      setMessage("✅ Changes saved successfully!");
    }
  };

  // Handle report rejection
  const handleRejectReport = async () => {
    if (!selectedReport) return;

    if (!selectedReport.admin_remark) {
      setMessage("Please add a remark explaining the rejection.");
      return;
    }

    const { error } = await supabase
      .from("reports")
      .update({
        status: "Rejected",
        admin_remark: selectedReport.admin_remark,
      })
      .eq("id", selectedReport.id);

    if (error) {
      console.error("❌ Error rejecting report:", error.message);
      setMessage("❌ Failed to reject report.");
    } else {
      await fetchReports();
      setSelectedReport(null);
      setMessage("✅ Report rejected successfully!");
    }
  };

  // Upload admin image
  const handleAdminUpload = async (file) => {
    if (!file || !selectedReport) {
      setMessage("⚠ Please select a report and a file.");
      return;
    }

    const filePath = `reports/${selectedReport.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("admin-report-images")
      .upload(filePath, file);

    if (uploadError) {
      setMessage("❌ Upload failed.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("admin-report-images")
      .getPublicUrl(filePath);

    await supabase.from("admin_report_images").insert({
      report_id: selectedReport.id,
      image_url: urlData.publicUrl,
      uploaded_by: "admin",
    });

    setSelectedReport({
      ...selectedReport,
      admin_report_images: [
        ...(selectedReport.admin_report_images || []),
        { image_url: urlData.publicUrl, uploaded_by: "admin" },
      ],
    });
    setMessage("✅ Admin image uploaded successfully!");
  };

  // Delete admin image
  const handleDeleteAdminImage = async (imageUrl) => {
    if (!selectedReport) return;
    const fileName = imageUrl.split("/").pop();

    await supabase.storage.from("admin-report-images").remove([`reports/${fileName}`]);
    await supabase
      .from("admin_report_images")
      .delete()
      .eq("image_url", imageUrl)
      .eq("report_id", selectedReport.id);

    setSelectedReport({
      ...selectedReport,
      admin_report_images: selectedReport.admin_report_images.filter(
        (img) => img.image_url !== imageUrl
      ),
    });
    setMessage("✅ Admin image deleted successfully!");
  };

  // Set the selected report and also its assigned department
  const handleSelectReport = (report, index) => {
    setSelectedReport({ ...report, sequenceId: index + 1 });
    // Use the suggested dept if no department is already assigned
    setSelectedDept(report.assigned_to_dept || suggestDepartment(report.issue_type) || "");
  };

  // Conditional button style for rejection
  const getRejectButtonStyle = (status) => {
    const baseStyle = "px-4 py-2 rounded-xl shadow font-semibold transition-colors";
    const highlightStyle = "bg-red-500 hover:bg-red-600 text-white";
    const defaultStyle = "bg-gray-300 hover:bg-gray-400 text-black";
    return `${baseStyle} ${status === "Rejected" ? highlightStyle : defaultStyle}`;
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      <h1 className="text-3xl font-bold mb-6 text-[#333333]">
        Reports Dashboard
      </h1>

      {/* New report added notification */}
      {message && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-500 text-white">
          {message}
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard
          title="Total Reports"
          value={totalReports}
          icon={<Flame size={24} />}
          styles={getStatCardStyles("Total Reports")}
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={<AlertCircle size={24} />}
          styles={getStatCardStyles("Pending")}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<Clock size={24} />}
          styles={getStatCardStyles("In Progress")}
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={<CheckCircle size={24} />}
          styles={getStatCardStyles("Resolved")}
        />
        <StatCard
          title="Rejected"
          value={rejected}
          icon={<XCircle size={24} />}
          styles={getStatCardStyles("Rejected")}
        />
      </div>

      {/* Filters and Search Bar with Refresh Button */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-[#FFE4B5] rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Categories</option>
          {[...new Set(reports.map((r) => r.issue_type))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-[#FFE4B5] rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* New Sort By Filter */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-[#FFE4B5] rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="latest">Latest First</option>
          <option value="normal">Oldest First</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-[#FFE4B5] rounded-lg p-2 bg-white shadow-sm"
        />

        <input
          type="text"
          placeholder="Search by area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-[#FFE4B5] rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
        />

        {/* Refresh Button */}
        <button
          onClick={fetchReports}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded-lg shadow-sm font-semibold transition-colors ${
            isRefreshing
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Reports"}
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-[#FFE4B5]">
        <table className="w-full border-collapse text-[#333333]">
          <thead className="bg-[#FFE4B5] text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Issue</th>
              <th className="p-3">Location</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <tr
                  key={report.id}
                  className={`border-t border-[#FFE4B5] transition ${
                    report.status === 'Resolved' && !report.feedback_read
                      ? 'bg-yellow-100 hover:bg-yellow-200'
                      : 'hover:bg-[#FFF9F0]'
                  }`}
                >
                  <td className="p-3">
                    {index + 1}
                    {report.status === 'Resolved' && !report.feedback_read && (
                      <span className="ml-2 text-yellow-600">🔔</span>
                    )}
                  </td>
                  <td className="p-3">{report.issue_type}</td>
                  <td className="p-3">{report.location}</td>
                  <td className="p-3">{report.priority}</td>
                  <td className="p-3">
                    <span className={getStatusStyle(report.status)}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleSelectReport(report, index)}
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
                  colSpan="6"
                  className="p-4 text-center text-[#555555] italic"
                >
                  {dateFilter ? "No reports on this date." : "No reports found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn border border-[#FFE4B5] flex">
            {/* Left Column: Report Details */}
            <div className="flex-1 p-4 border-r border-[#FFE4B5] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-[#333333]">
                Report Details
              </h2>
              <div className="space-y-2 text-[#555555]">
                <p><strong>ID:</strong> {selectedReport.sequenceId}</p>
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
            </div>

            {/* Right Column: Images, Actions, and Forms */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-[#333333]">Actions & Media</h2>

              {/* Community Feedback */}
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold text-[#333333]">Community Feedback</h3>
                <div className="flex justify-start items-center gap-4">
                  <p className="text-green-600 font-bold">
                    Affected: {selectedReport.affected_count || 0}
                  </p>
                  <p className="text-red-600 font-bold">
                    False: {selectedReport.false_count || 0}
                  </p>
                </div>
                {selectedReport.status === "Resolved" && (
                  <p className="mt-2">
                    <strong>User Feedback:</strong> {selectedReport.user_feedback || "N/A"}
                  </p>
                )}
              </div>

              {/* User Uploaded Images */}
              {selectedReport.report_images?.length > 0 && (
                <div className="mt-4">
                  <label className="block font-semibold mb-1 text-[#333333]">
                    User Uploaded Images
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReport.report_images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.image_url}
                          alt={`User Image ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-[#FFE4B5]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setImagePreview(img.image_url)}
                            className="text-white text-xl"
                          >
                            👁
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Uploaded Images */}
              {selectedReport.admin_report_images?.length > 0 && (
                <div className="mt-4">
                  <label className="block font-semibold mb-1 text-[#333333]">
                    Admin Uploaded Images
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReport.admin_report_images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.image_url}
                          alt={`Admin Image ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-[#FFE4B5]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setImagePreview(img.image_url)}
                            className="text-white text-xl"
                          >
                            👁
                          </button>
                          <button
                            onClick={() => handleDeleteAdminImage(img.image_url)}
                            className="text-red-500 text-xl"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {/* Update Status */}
                <div>
                  <label className="block font-semibold mb-1 text-[#333333]">
                    Update Status
                  </label>
                  <select
                    value={selectedReport.status}
                    onChange={(e) =>
                      setSelectedReport({
                        ...selectedReport,
                        status: e.target.value,
                      })
                    }
                    className="border border-[#FFE4B5] rounded-lg p-2 w-full"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Admin can change priority */}
                <div>
                  <label className="block font-semibold mb-1 text-[#333333]">
                    Update Priority
                  </label>
                  <select
                    value={selectedReport.priority}
                    onChange={(e) =>
                      setSelectedReport({
                        ...selectedReport,
                        priority: e.target.value,
                      })
                    }
                    className="border border-[#FFE4B5] rounded-lg p-2 w-full"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Conditionally render Department Selection & Admin Photo Upload */}
                {["In Progress", "Resolved"].includes(selectedReport.status) && (
                  <>
                    {/* Department Selection */}
                    <div>
                      <label className="block font-semibold mb-1 text-[#333333]">
                        Assign to Department
                        {/* New suggested department message */}
                        {!selectedReport.assigned_to_dept && (
                          <span className="text-sm text-gray-500 ml-2">
                            (Suggested: {suggestDepartment(selectedReport.issue_type)})
                          </span>
                        )}
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        onFocus={() => setMessage("")}
                        className="border border-[#FFE4B5] rounded-lg p-2 w-full"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Upload Admin Photo */}
                    <div className="mt-3">
                      <label className="block font-semibold mb-1 text-[#333333]">
                        Upload Admin Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleAdminUpload(file);
                        }}
                        className="border border-[#FFE4B5] rounded-lg p-2 w-full"
                      />
                    </div>
                  </>
                )}

                {/* Remarks are now required for rejection */}
                {["In Progress","Rejected", "Resolved"].includes(selectedReport.status) && (
                  <div>
                    <label className="block font-semibold mb-1 text-[#333333]">
                      Remarks
                    </label>
                    <textarea
                      value={selectedReport.admin_remark || ""}
                      onChange={(e) =>
                        setSelectedReport({
                          ...selectedReport,
                          admin_remark: e.target.value,
                        })
                      }
                      className="border border-[#FFE4B5] rounded-lg p-2 w-full"
                      rows="3"
                      placeholder="Add remarks..."
                    />
                  </div>
                )}
              </div>

              {message && (
                <p className="mt-3 text-sm text-center text-red-500">{message}</p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-xl shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectReport}
                  className={getRejectButtonStyle(selectedReport.status)}
                >
                  {selectedReport.status === "Rejected" ? "Confirm Rejection" : "Reject"}
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
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-[90%] max-h-[90%] rounded-xl shadow-lg border border-[#FFE4B5]"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
}