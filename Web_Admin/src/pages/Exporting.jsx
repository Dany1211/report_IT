import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { supabase } from "../supabaseClient";

export default function Exporting() {
  const [reports, setReports] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedReports, setSelectedReports] = useState([]);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from("reports").select("*");
      if (error) {
        console.error("Error fetching reports:", error);
      } else {
        setReports(data || []);
      }
    };
    fetchReports();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-500/10 text-green-500 px-2 py-1 rounded-lg text-sm";
      case "In Progress":
        return "bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg text-sm";
      case "Pending":
        return "bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-sm";
      default:
        return "px-2 py-1 rounded-lg text-sm text-[#4A5568]";
    }
  };

  const filteredReports = reports
    .filter((r) => {
      return (
        (categoryFilter === "All" || r.issue_type === categoryFilter) &&
        (areaFilter === "All" || r.location === areaFilter) &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (searchQuery === "" ||
          r.location?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const toggleSelection = (report) => {
    setSelectedReports((prev) =>
      prev.some((r) => r.id === report.id)
        ? prev.filter((r) => r.id !== report.id)
        : [...prev, report]
    );
  };

  const handleExportCSV = () => {
    const dataToExport =
      selectedReports.length > 0 ? selectedReports : filteredReports;

    if (dataToExport.length === 0) return;

    const excludeKeys = ["id", "user_id", "reporter_id", "image_urls"];
    const headers = Object.keys(dataToExport[0]).filter(
      (key) => !excludeKeys.includes(key)
    );

    const csvRows = [
      headers.join(","), // header row
      ...dataToExport.map((r) =>
        headers
          .map((h) => {
            let val = r[h];
            if (h === "created_at") {
              val = new Date(val).toLocaleDateString(); // ✅ only date
            }
            if (typeof val === "string")
              val = `"${val.replace(/"/g, '""')}"`;
            return val ?? "";
          })
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download =
      selectedReports.length > 0 ? `reports-selected.csv` : "reports.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);

    const dataToExport =
      selectedReports.length > 0 ? selectedReports : filteredReports;

    doc.text("Reports Summary", 10, 10);
    doc.setFontSize(11);

    let y = 20;
    const excludeKeys = ["id", "user_id", "reporter_id", "image_urls"];

    dataToExport.forEach((r, index) => {
      doc.text(`#${index + 1}`, 10, y);
      y += 6;

      Object.keys(r).forEach((key) => {
        if (!excludeKeys.includes(key)) {
          let val = r[key];
          if (key === "created_at") {
            val = new Date(val).toLocaleDateString(); // ✅ only date
          }
          if (val == null) val = "N/A";

          doc.text(`${key}: ${val}`, 10, y);
          y += 6;

          if (y > 280) {
            doc.addPage();
            y = 20;
          }
        }
      });

      y += 8;
    });

    doc.save(
      selectedReports.length > 0 ? "reports-selected.pdf" : "reports.pdf"
    );
  };

  const handleGenerateAIReport = async () => {
    setLoading(true);
    try {
      const dataToSend =
        selectedReports.length > 0 ? selectedReports : filteredReports;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional city admin assistant. Write normally, like a human report. No symbols, no markdown. Be clear, structured, and plain.",
              },
              {
                role: "user",
                content: `Here are civic reports:\n\n${JSON.stringify(
                  dataToSend.map((r, index) => ({
                    id: index + 1,
                    reporter: r.reporter_name,
                    email: r.reporter_email,
                    issue: r.issue_type,
                    description: r.description,
                    location: r.location,
                    status: r.status,
                    created_at: new Date(r.created_at).toLocaleDateString(), // ✅ only date
                  })),
                  null,
                  2
                )}\n\nPlease provide a clear, long analysis covering:\n- Issue background\n- Community impact\n- Status justification\n- Recommended next steps\n- Risks if unresolved`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      let summary = data.choices[0].message.content;
      summary = summary.replace(/[#*]/g, ""); // clean
      setAiReport(summary);
    } catch (err) {
      console.error("AI Report Error:", err);
      setAiReport("❌ Failed to generate AI report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAIReport = () => {
    if (!aiReport) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("AI Generated Summary", 10, 10);
    doc.setFontSize(12);

    const cleanText = aiReport.replace(/[#*]/g, "");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 7;

    const splitText = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);

    let cursorY = 20;
    splitText.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin + 10;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    doc.save(
      selectedReports.length > 0 ? "ai-report-selected.pdf" : "ai-report.pdf"
    );
  };

  return (
    <div className="min-h-screen p-6 bg-[#E8EDF4]">
      <h1 className="text-3xl font-bold mb-6 text-[#1A202C]">
        Exporting & Integrations
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-[#A0B0C0] rounded-lg p-2 bg-white shadow-sm text-[#4A5568]"
        >
          <option value="All">All Categories</option>
          {[...new Set(reports.map((r) => r.issue_type))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="border border-[#A0B0C0] rounded-lg px-2 py-1 bg-white shadow-sm text-[#4A5568] w-48 overflow-hidden text-ellipsis"
        >
          <option value="All">All Areas</option>
          {[...new Set(reports.map((r) => r.location))].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#A0B0C0] rounded-lg p-2 bg-white shadow-sm text-[#4A5568]"
        >
          <option value="All">All Status</option>
          {[...new Set(reports.map((r) => r.status))].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-[#A0B0C0] rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm text-[#4A5568]"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6 border border-[#A0B0C0]">
        <table className="w-full border-collapse text-[#4A5568]">
          <thead className="bg-[#E0E7F5] text-left">
            <tr>
              <th className="p-3">Select</th>
              <th className="p-3">ID</th>
              <th className="p-3">Reporter</th>
              <th className="p-3">Email</th>
              <th className="p-3">Issue</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((r, index) => (
                <tr
                  key={r.id}
                  className="border-t border-[#A0B0C0] hover:bg-[#F0F4F8] transition"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.some((sel) => sel.id === r.id)}
                      onChange={() => toggleSelection(r)}
                    />
                  </td>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{r.reporter_name}</td>
                  <td className="p-3">{r.reporter_email}</td>
                  <td className="p-3">{r.issue_type}</td>
                  <td className="p-3">{r.location}</td>
                  <td className="p-3">
                    <span className={getStatusStyle(r.status)}>{r.status}</span>
                  </td>
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleDateString()}{/* ✅ only date */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="p-4 text-center text-[#4A5568] italic"
                >
                  No reports match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      {selectedReports.length > 0 && (
        <p className="mb-4 text-[#4A5568] font-medium">
          {selectedReports.length} report(s) selected.
        </p>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleExportCSV}
          className="bg-[#4A5568] hover:bg-[#323a49] text-white px-4 py-2 rounded-xl shadow"
        >
          Export {selectedReports.length > 0 ? "Selected" : "All"} CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-[#2D8C2D] hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
        >
          Export {selectedReports.length > 0 ? "Selected" : "All"} PDF
        </button>
        <button
          onClick={handleGenerateAIReport}
          className="bg-[#F56565] hover:bg-[#D64545] text-white px-4 py-2 rounded-xl shadow"
        >
          {loading
            ? "Generating..."
            : `AI Report (${selectedReports.length > 0 ? "Selected" : "All"})`}
        </button>
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="bg-white shadow-md p-4 rounded-xl border border-[#A0B0C0]">
          <h2 className="text-xl font-semibold mb-2 text-[#1A202C]">
            AI Generated Report
          </h2>
          <p className="whitespace-pre-line text-[#4A5568]">{aiReport}</p>
          <button
            onClick={handleDownloadAIReport}
            className="mt-4 bg-[#F56565] hover:bg-[#D64545] text-white px-4 py-2 rounded-xl shadow"
          >
            Download AI Report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}