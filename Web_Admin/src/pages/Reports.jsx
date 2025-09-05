import React from "react";

const Reports = () => {
  // Mock data (later connect API)
  const reports = [
    {
      id: 1,
      issue: "Pothole on Main Street",
      category: "Road",
      location: "Main St, Downtown",
      status: "Pending",
      date: "2025-09-01",
    },
    {
      id: 2,
      issue: "Streetlight not working",
      category: "Lighting",
      location: "2nd Ave, City Center",
      status: "In Progress",
      date: "2025-09-02",
    },
    {
      id: 3,
      issue: "Garbage overflow near park",
      category: "Sanitation",
      location: "Green Park Colony",
      status: "Resolved",
      date: "2025-09-04",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-red-100 text-red-600";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Resolved":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📌 Reports</h1>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Issue</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {report.id}
                </td>
                <td className="px-6 py-4">{report.issue}</td>
                <td className="px-6 py-4">{report.category}</td>
                <td className="px-6 py-4">{report.location}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{report.date}</td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
