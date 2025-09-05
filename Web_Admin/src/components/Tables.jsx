// Table.jsx
import React from "react";
import { Eye } from "lucide-react";

function Table({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 mt-10">No reports available</p>;
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full text-sm text-left">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Issue</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((report, index) => (
            <tr
              key={report.id}
              className="bg-white hover:bg-gray-100 transition rounded-md shadow-sm"
            >
              <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{report.id}</td>
              <td className="px-4 py-3">{report.issue}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    report.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {report.status}
                </span>
              </td>
              <td className="px-4 py-3">{report.location}</td>
              <td className="px-4 py-3 text-center">
                <button
                  className="p-2 rounded hover:bg-gray-200 text-gray-600"
                  title="View More"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
