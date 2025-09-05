import React from "react";

function Table({ data }) {
  if (!data || data.length === 0) {
    return <p>No reports available</p>;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "20px",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          <th style={cellStyle}>ID</th>
          <th style={cellStyle}>Issue</th>
          <th style={cellStyle}>Status</th>
          <th style={cellStyle}>Location</th>
        </tr>
      </thead>
      <tbody>
        {data.map((report) => (
          <tr key={report.id}>
            <td style={cellStyle}>{report.id}</td>
            <td style={cellStyle}>{report.issue}</td>
            <td style={cellStyle}>{report.status}</td>
            <td style={cellStyle}>{report.location}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Shared cell styling
const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

export default Table;
