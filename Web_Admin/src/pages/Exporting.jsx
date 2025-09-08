// import { useState, useEffect } from "react";
// import jsPDF from "jspdf";
// import { supabase } from "../supabaseClient";

// export default function Exporting() {
//   const [reports, setReports] = useState([]);
//   const [categoryFilter, setCategoryFilter] = useState("All");
//   const [areaFilter, setAreaFilter] = useState("All");
//   const [statusFilter, setStatusFilter] = useState("All"); // ✅ Added
//   const [searchQuery, setSearchQuery] = useState("");

//   const [selectedReports, setSelectedReports] = useState([]);
//   const [aiReport, setAiReport] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ✅ Fetch reports
//   useEffect(() => {
//     const fetchReports = async () => {
//       const { data, error } = await supabase.from("reports").select("*");
//       if (error) {
//         console.error("Error fetching reports:", error);
//       } else {
//         setReports(data || []);
//       }
//     };
//     fetchReports();
//   }, []);

//   // ✅ Status badge styles
//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "Resolved":
//         return "bg-[#32CD32]/10 text-[#32CD32] px-2 py-1 rounded-lg text-sm";
//       case "In Progress":
//         return "bg-[#FFB347]/10 text-[#FFB347] px-2 py-1 rounded-lg text-sm";
//       case "Pending":
//         return "bg-[#FF4500]/10 text-[#FF4500] px-2 py-1 rounded-lg text-sm";
//       default:
//         return "px-2 py-1 rounded-lg text-sm";
//     }
//   };

//   // ✅ Filtering
//   const filteredReports = reports.filter((r) => {
//     return (
//       (categoryFilter === "All" || r.issue_type === categoryFilter) &&
//       (areaFilter === "All" || r.location === areaFilter) &&
//       (statusFilter === "All" || r.status === statusFilter) && // ✅ Updated
//       (searchQuery === "" || r.location?.toLowerCase().includes(searchQuery.toLowerCase()))
//     );
//   });

//   // ✅ Toggle selection
//   const toggleSelection = (report) => {
//     setSelectedReports((prev) =>
//       prev.some((r) => r.id === report.id)
//         ? prev.filter((r) => r.id !== report.id)
//         : [...prev, report]
//     );
//   };

//   // ✅ CSV Export
//   const handleExportCSV = () => {
//     const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;
//     const headers = ["ID", "Reporter", "Email", "Issue", "Description", "Location", "Status", "Created At"];
//     const csvRows = [
//       headers.join(","),
//       ...dataToExport.map((r) =>
//         [r.id, r.reporter_name, r.reporter_email, r.issue_type, r.description, r.location, r.status, r.created_at].join(",")
//       ),
//     ];
//     const csvString = csvRows.join("\n");
//     const blob = new Blob([csvString], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = selectedReports.length > 0 ? `reports-selected.csv` : "reports.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   // ✅ PDF Export
//   const handleExportPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(14);

//     const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;

//     doc.text("Reports Summary", 10, 10);
//     dataToExport.forEach((r, i) => {
//       doc.text(
//         `${r.id}. ${r.issue_type} [${r.location}] (${r.status})`,
//         10,
//         20 + i * 10
//       );
//     });

//     doc.save(selectedReports.length > 0 ? "reports-selected.pdf" : "reports.pdf");
//   };

//   // ✅ AI Summary
//   const handleGenerateAIReport = async () => {
//     setLoading(true);
//     try {
//       const dataToSend = selectedReports.length > 0 ? selectedReports : filteredReports;

//       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
//         },
//         body: JSON.stringify({
//           model: "openai/gpt-4o-mini",
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a professional city admin assistant. Always answer in plain text (no #, no *, no markdown). Expand responses with multiple paragraphs and detailed recommendations.",
//             },
//             {
//               role: "user",
//               content: `Here are civic reports:\n\n${JSON.stringify(
//                 dataToSend.map((r) => ({
//                   id: r.id,
//                   reporter: r.reporter_name,
//                   email: r.reporter_email,
//                   issue: r.issue_type,
//                   description: r.description,
//                   location: r.location,
//                   status: r.status, // ✅ Updated, removed priority
//                   created_at: r.created_at,
//                 })),
//                 null,
//                 2
//               )}\n\n
// Please provide a long, detailed analysis covering:
// - Issue context & background
// - Community impact
// - Status justification
// - Suggested action plan for city officials
// - Possible risks if unresolved
// Write in a structured but plain-text format.`,
//             },
//           ],
//         }),
//       });

//       const data = await response.json();
//       let summary = data.choices[0].message.content;
//       summary = summary.replace(/[#*]/g, "");
//       setAiReport(summary);
//     } catch (err) {
//       console.error("AI Report Error:", err);
//       setAiReport("❌ Failed to generate AI report.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ AI Report PDF
//   const handleDownloadAIReport = () => {
//     if (!aiReport) return;

//     const doc = new jsPDF();
//     doc.setFontSize(14);
//     doc.text("AI Generated Summary", 10, 10);
//     doc.setFontSize(12);

//     const cleanText = aiReport.replace(/[#*]/g, "");
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 10;
//     const lineHeight = 7;

//     const splitText = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);

//     let cursorY = 20;
//     splitText.forEach((line) => {
//       if (cursorY + lineHeight > pageHeight - margin) {
//         doc.addPage();
//         cursorY = margin + 10;
//       }
//       doc.text(line, margin, cursorY);
//       cursorY += lineHeight;
//     });

//     doc.save(selectedReports.length > 0 ? "ai-report-selected.pdf" : "ai-report.pdf");
//   };

//   return (
//     <div className="min-h-screen p-6 bg-[#FFF9F0]">
//       <h1 className="text-3xl font-bold mb-6 text-[#333]">Exporting & Integrations</h1>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           className="border rounded-lg p-2 bg-white shadow-sm"
//         >
//           <option value="All">All Categories</option>
//           {[...new Set(reports.map((r) => r.issue_type))].map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>

//         <select
//           value={areaFilter}
//           onChange={(e) => setAreaFilter(e.target.value)}
//           className="border rounded-lg p-2 bg-white shadow-sm"
//         >
//           <option value="All">All Areas</option>
//           {[...new Set(reports.map((r) => r.location))].map((a) => (
//             <option key={a} value={a}>{a}</option>
//           ))}
//         </select>

//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border rounded-lg p-2 bg-white shadow-sm"
//         >
//           <option value="All">All Statuses</option>
//           {[...new Set(reports.map((r) => r.status))].map((s) => (
//             <option key={s} value={s}>{s}</option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search by area..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
//         />
//       </div>

//       {/* Report Table */}
//       <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
//         <table className="w-full border-collapse text-[#333]">
//           <thead className="bg-[#FFE4B5] text-left">
//             <tr>
//               <th className="p-3">Select</th>
//               <th className="p-3">ID</th>
//               <th className="p-3">Reporter</th>
//               <th className="p-3">Email</th>
//               <th className="p-3">Issue</th>
//               <th className="p-3">Location</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Created</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredReports.length > 0 ? (
//               filteredReports.map((r) => (
//                 <tr key={r.id} className="border-t hover:bg-[#FFF9F0] transition">
//                   <td className="p-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedReports.some((sel) => sel.id === r.id)}
//                       onChange={() => toggleSelection(r)}
//                     />
//                   </td>
//                   <td className="p-3">{r.id}</td>
//                   <td className="p-3">{r.reporter_name}</td>
//                   <td className="p-3">{r.reporter_email}</td>
//                   <td className="p-3">{r.issue_type}</td>
//                   <td className="p-3">{r.location}</td>
//                   <td className="p-3">
//                     <span className={getStatusStyle(r.status)}>{r.status}</span>
//                   </td>
//                   <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" className="p-4 text-center text-gray-500">
//                   No reports match filters.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Selected count */}
//       {selectedReports.length > 0 && (
//         <p className="mb-4 text-[#333] font-medium">
//           {selectedReports.length} report(s) selected.
//         </p>
//       )}

//       {/* Export & AI buttons */}
//       <div className="flex gap-4 mb-6">
//         <button
//           onClick={handleExportCSV}
//           className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-2 rounded-xl shadow"
//         >
//           Export {selectedReports.length > 0 ? "Selected" : "All"} CSV
//         </button>
//         <button
//           onClick={handleExportPDF}
//           className="bg-[#32CD32] hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
//         >
//           Export {selectedReports.length > 0 ? "Selected" : "All"} PDF
//         </button>
//         <button
//           onClick={handleGenerateAIReport}
//           className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-4 py-2 rounded-xl shadow"
//         >
//           {loading ? "Generating..." : `AI Report (${selectedReports.length > 0 ? "Selected" : "All"})`}
//         </button>
//       </div>

//       {/* AI Report */}
//       {aiReport && (
//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h2 className="text-xl font-semibold mb-2">AI Generated Report</h2>
//           <p className="whitespace-pre-line text-[#444]">{aiReport}</p>
//           <button
//             onClick={handleDownloadAIReport}
//             className="mt-4 bg-[#8A2BE2] hover:bg-[#6a1bbd] text-white px-4 py-2 rounded-xl shadow"
//           >
//             Download AI Report (PDF)
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import jsPDF from "jspdf";
// import { supabase } from "../supabaseClient";

// export default function Exporting() {
//   const [reports, setReports] = useState([]);
//   const [categoryFilter, setCategoryFilter] = useState("All");
//   const [areaFilter, setAreaFilter] = useState("All");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [selectedReports, setSelectedReports] = useState([]);
//   const [aiReport, setAiReport] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchReports = async () => {
//       const { data, error } = await supabase.from("reports").select("*");
//       if (error) {
//         console.error("Error fetching reports:", error);
//       } else {
//         setReports(data || []);
//       }
//     };
//     fetchReports();
//   }, []);

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "Resolved":
//         return "bg-[#32CD32]/10 text-[#32CD32] px-2 py-1 rounded-lg text-sm";
//       case "In Progress":
//         return "bg-[#FFB347]/10 text-[#FFB347] px-2 py-1 rounded-lg text-sm";
//       case "Pending":
//         return "bg-[#FF4500]/10 text-[#FF4500] px-2 py-1 rounded-lg text-sm";
//       default:
//         return "px-2 py-1 rounded-lg text-sm";
//     }
//   };

//   const filteredReports = reports.filter((r) => {
//     return (
//       (categoryFilter === "All" || r.issue_type === categoryFilter) &&
//       (areaFilter === "All" || r.location === areaFilter) &&
//       (statusFilter === "All" || r.status === statusFilter) &&
//       (searchQuery === "" || r.location?.toLowerCase().includes(searchQuery.toLowerCase()))
//     );
//   });

//   const toggleSelection = (report) => {
//     setSelectedReports((prev) =>
//       prev.some((r) => r.id === report.id)
//         ? prev.filter((r) => r.id !== report.id)
//         : [...prev, report]
//     );
//   };

//   const handleExportCSV = () => {
//     const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;
//     const headers = ["ID", "Reporter", "Email", "Issue", "Description", "Location", "Status", "Created At"];
//     const csvRows = [
//       headers.join(","),
//       ...dataToExport.map((r, index) =>
//         [
//           index + 1,
//           r.reporter_name,
//           r.reporter_email,
//           r.issue_type,
//           r.description,
//           r.location,
//           r.status,
//           r.created_at
//         ].join(",")
//       ),
//     ];
//     const csvString = csvRows.join("\n");
//     const blob = new Blob([csvString], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = selectedReports.length > 0 ? `reports-selected.csv` : "reports.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleExportPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(14);

//     const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;
//     doc.text("Reports Summary", 10, 10);
//     dataToExport.forEach((r, index) => {
//       doc.text(
//         `${index + 1}. ${r.issue_type} [${r.location}] (${r.status})`,
//         10,
//         20 + index * 10
//       );
//     });

//     doc.save(selectedReports.length > 0 ? "reports-selected.pdf" : "reports.pdf");
//   };

//   const handleGenerateAIReport = async () => {
//     setLoading(true);
//     try {
//       const dataToSend = selectedReports.length > 0 ? selectedReports : filteredReports;

//       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
//         },
//         body: JSON.stringify({
//           model: "openai/gpt-4o-mini",
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a professional city admin assistant. Always answer in plain text (no #, no *, no markdown). Expand responses with multiple paragraphs and detailed recommendations.",
//             },
//             {
//               role: "user",
//               content: `Here are civic reports:\n\n${JSON.stringify(
//                 dataToSend.map((r, index) => ({
//                   id: index + 1,
//                   reporter: r.reporter_name,
//                   email: r.reporter_email,
//                   issue: r.issue_type,
//                   description: r.description,
//                   location: r.location,
//                   status: r.status,
//                   created_at: r.created_at,
//                 })),
//                 null,
//                 2
//               )}\n\nPlease provide a long, detailed analysis covering:
// - Issue context & background
// - Community impact
// - Status justification
// - Suggested action plan for city officials
// - Possible risks if unresolved
// Write in a structured but plain-text format.`,
//             },
//           ],
//         }),
//       });

//       const data = await response.json();
//       let summary = data.choices[0].message.content;
//       summary = summary.replace(/[#*]/g, "");
//       setAiReport(summary);
//     } catch (err) {
//       console.error("AI Report Error:", err);
//       setAiReport("❌ Failed to generate AI report.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadAIReport = () => {
//     if (!aiReport) return;

//     const doc = new jsPDF();
//     doc.setFontSize(14);
//     doc.text("AI Generated Summary", 10, 10);
//     doc.setFontSize(12);

//     const cleanText = aiReport.replace(/[#*]/g, "");
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();
//     const margin = 10;
//     const lineHeight = 7;

//     const splitText = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);

//     let cursorY = 20;
//     splitText.forEach((line) => {
//       if (cursorY + lineHeight > pageHeight - margin) {
//         doc.addPage();
//         cursorY = margin + 10;
//       }
//       doc.text(line, margin, cursorY);
//       cursorY += lineHeight;
//     });

//     doc.save(selectedReports.length > 0 ? "ai-report-selected.pdf" : "ai-report.pdf");
//   };

//   return (
//     <div className="min-h-screen p-6 bg-[#FFF9F0]">
//       <h1 className="text-3xl font-bold mb-6 text-[#333]">Exporting & Integrations</h1>

//       <div className="flex flex-wrap gap-4 mb-6">
//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           className="border rounded-lg p-2 bg-white shadow-sm"
//         >
//           <option value="All">All Categories</option>
//           {[...new Set(reports.map((r) => r.issue_type))].map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>

//         <select
//           value={areaFilter}
//           onChange={(e) => setAreaFilter(e.target.value)}
//           className="border rounded-lg p-2 bg-white shadow-sm"
//         >
//           <option value="All">All Areas</option>
//           {[...new Set(reports.map((r) => r.location))].map((a) => (
//             <option key={a} value={a}>{a}</option>
//           ))}
//         </select>

//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border rounded-lg p-2 bg-white shadow-sm"
//         >
//           <option value="All">All Statuses</option>
//           {[...new Set(reports.map((r) => r.status))].map((s) => (
//             <option key={s} value={s}>{s}</option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Search by area..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
//         />
//       </div>

//       <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
//         <table className="w-full border-collapse text-[#333]">
//           <thead className="bg-[#FFE4B5] text-left">
//             <tr>
//               <th className="p-3">Select</th>
//               <th className="p-3">ID</th>
//               <th className="p-3">Reporter</th>
//               <th className="p-3">Email</th>
//               <th className="p-3">Issue</th>
//               <th className="p-3">Location</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Created</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredReports.length > 0 ? (
//               filteredReports.map((r, index) => (
//                 <tr key={r.id} className="border-t hover:bg-[#FFF9F0] transition">
//                   <td className="p-3">
//                     <input
//                       type="checkbox"
//                       checked={selectedReports.some((sel) => sel.id === r.id)}
//                       onChange={() => toggleSelection(r)}
//                     />
//                   </td>
//                   <td className="p-3">{index + 1}</td>
//                   <td className="p-3">{r.reporter_name}</td>
//                   <td className="p-3">{r.reporter_email}</td>
//                   <td className="p-3">{r.issue_type}</td>
//                   <td className="p-3">{r.location}</td>
//                   <td className="p-3">
//                     <span className={getStatusStyle(r.status)}>{r.status}</span>
//                   </td>
//                   <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" className="p-4 text-center text-gray-500">
//                   No reports match filters.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {selectedReports.length > 0 && (
//         <p className="mb-4 text-[#333] font-medium">
//           {selectedReports.length} report(s) selected.
//         </p>
//       )}

//       <div className="flex gap-4 mb-6">
//         <button
//           onClick={handleExportCSV}
//           className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-2 rounded-xl shadow"
//         >
//           Export {selectedReports.length > 0 ? "Selected" : "All"} CSV
//         </button>
//         <button
//           onClick={handleExportPDF}
//           className="bg-[#32CD32] hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
//         >
//           Export {selectedReports.length > 0 ? "Selected" : "All"} PDF
//         </button>
//         <button
//           onClick={handleGenerateAIReport}
//           className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-4 py-2 rounded-xl shadow"
//         >
//           {loading ? "Generating..." : `AI Report (${selectedReports.length > 0 ? "Selected" : "All"})`}
//         </button>
//       </div>

//       {aiReport && (
//         <div className="bg-white shadow-md p-4 rounded-xl">
//           <h2 className="text-xl font-semibold mb-2">AI Generated Report</h2>
//           <p className="whitespace-pre-line text-[#444]">{aiReport}</p>
//           <button
//             onClick={handleDownloadAIReport}
//             className="mt-4 bg-[#8A2BE2] hover:bg-[#6a1bbd] text-white px-4 py-2 rounded-xl shadow"
//           >
//             Download AI Report (PDF)
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


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
        return "bg-[#32CD32]/10 text-[#32CD32] px-2 py-1 rounded-lg text-sm";
      case "In Progress":
        return "bg-[#FFB347]/10 text-[#FFB347] px-2 py-1 rounded-lg text-sm";
      case "Pending":
        return "bg-[#FF4500]/10 text-[#FF4500] px-2 py-1 rounded-lg text-sm";
      default:
        return "px-2 py-1 rounded-lg text-sm";
    }
  };

  const filteredReports = reports
    .filter((r) => {
      return (
        (categoryFilter === "All" || r.issue_type === categoryFilter) &&
        (areaFilter === "All" || r.location === areaFilter) &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (searchQuery === "" || r.location?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // ✅ Sort by created_at ascending

  const toggleSelection = (report) => {
    setSelectedReports((prev) =>
      prev.some((r) => r.id === report.id)
        ? prev.filter((r) => r.id !== report.id)
        : [...prev, report]
    );
  };

  const handleExportCSV = () => {
    const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;
    const headers = ["ID", "Reporter", "Email", "Issue", "Description", "Location", "Status", "Created At"];
    const csvRows = [
      headers.join(","),
      ...dataToExport.map((r, index) =>
        [
          index + 1,
          r.reporter_name,
          r.reporter_email,
          r.issue_type,
          r.description,
          r.location,
          r.status,
          r.created_at
        ].join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = selectedReports.length > 0 ? `reports-selected.csv` : "reports.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);

    const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;
    doc.text("Reports Summary", 10, 10);
    dataToExport.forEach((r, index) => {
      doc.text(
        `${index + 1}. ${r.issue_type} [${r.location}] (${r.status})`,
        10,
        20 + index * 10
      );
    });

    doc.save(selectedReports.length > 0 ? "reports-selected.pdf" : "reports.pdf");
  };

  const handleGenerateAIReport = async () => {
    setLoading(true);
    try {
      const dataToSend = selectedReports.length > 0 ? selectedReports : filteredReports;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                "You are a professional city admin assistant. Always answer in plain text (no #, no *, no markdown). Expand responses with multiple paragraphs and detailed recommendations.",
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
                  created_at: r.created_at,
                })),
                null,
                2
              )}\n\nPlease provide a long, detailed analysis covering:
- Issue context & background
- Community impact
- Status justification
- Suggested action plan for city officials
- Possible risks if unresolved
Write in a structured but plain-text format.`,
            },
          ],
        }),
      });

      const data = await response.json();
      let summary = data.choices[0].message.content;
      summary = summary.replace(/[#*]/g, "");
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

    doc.save(selectedReports.length > 0 ? "ai-report-selected.pdf" : "ai-report.pdf");
  };

  return (
    <div className="min-h-screen p-6 bg-[#FFF9F0]">
      <h1 className="text-3xl font-bold mb-6 text-[#333]">Exporting & Integrations</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Categories</option>
          {[...new Set(reports.map((r) => r.issue_type))].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Areas</option>
          {[...new Set(reports.map((r) => r.location))].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg p-2 bg-white shadow-sm"
        >
          <option value="All">All Statuses</option>
          {[...new Set(reports.map((r) => r.status))].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
        />
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
        <table className="w-full border-collapse text-[#333]">
          <thead className="bg-[#FFE4B5] text-left">
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
                <tr key={r.id} className="border-t hover:bg-[#FFF9F0] transition">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedReports.some((sel) => sel.id === r.id)}
                      onChange={() => toggleSelection(r)}
                    />
                  </td>
                  <td className="p-3">{index + 1}</td> {/* ✅ Sequence number */}
                  <td className="p-3">{r.reporter_name}</td>
                  <td className="p-3">{r.reporter_email}</td>
                  <td className="p-3">{r.issue_type}</td>
                  <td className="p-3">{r.location}</td>
                  <td className="p-3">
                    <span className={getStatusStyle(r.status)}>{r.status}</span>
                  </td>
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No reports match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReports.length > 0 && (
        <p className="mb-4 text-[#333] font-medium">
          {selectedReports.length} report(s) selected.
        </p>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleExportCSV}
          className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-2 rounded-xl shadow"
        >
          Export {selectedReports.length > 0 ? "Selected" : "All"} CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-[#32CD32] hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow"
        >
          Export {selectedReports.length > 0 ? "Selected" : "All"} PDF
        </button>
        <button
          onClick={handleGenerateAIReport}
          className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-4 py-2 rounded-xl shadow"
        >
          {loading ? "Generating..." : `AI Report (${selectedReports.length > 0 ? "Selected" : "All"})`}
        </button>
      </div>

      {aiReport && (
        <div className="bg-white shadow-md p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">AI Generated Report</h2>
          <p className="whitespace-pre-line text-[#444]">{aiReport}</p>
          <button
            onClick={handleDownloadAIReport}
            className="mt-4 bg-[#8A2BE2] hover:bg-[#6a1bbd] text-white px-4 py-2 rounded-xl shadow"
          >
            Download AI Report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
