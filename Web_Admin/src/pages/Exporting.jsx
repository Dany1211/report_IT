import { useState } from "react";
import jsPDF from "jspdf";

export default function Exporting() {
    const demoReports = [
        { id: 1, issue: "Pothole on Main Street", description: "Large pothole near the traffic light, causing cars to swerve.", category: "Potholes", area: "Downtown", priority: "High", status: "In Progress" },
        { id: 2, issue: "Streetlight outage", description: "Streetlight not working outside the library, area is dark at night.", category: "Streetlights", area: "Downtown", priority: "Medium", status: "Pending" },
        { id: 3, issue: "Overflowing trash bin", description: "Trash bin on 3rd Ave is overflowing.", category: "Trash", area: "Uptown", priority: "High", status: "Resolved" },
        { id: 4, issue: "Graffiti on bus stop", description: "Graffiti on the bus stop shelter at Elm Street.", category: "Graffiti", area: "Midtown", priority: "Low", status: "In Progress" },
    ];

    const [reports] = useState(demoReports);
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [areaFilter, setAreaFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedReports, setSelectedReports] = useState([]);
    const [aiReport, setAiReport] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Status badge styles
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

    // Filtering
    const filteredReports = reports.filter((r) => {
        return (
            (categoryFilter === "All" || r.category === categoryFilter) &&
            (areaFilter === "All" || r.area === areaFilter) &&
            (priorityFilter === "All" || r.priority === priorityFilter) &&
            (searchQuery === "" || r.area.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    });

    // Handle checkbox toggle
    const toggleSelection = (report) => {
        setSelectedReports((prev) =>
            prev.some((r) => r.id === report.id)
                ? prev.filter((r) => r.id !== report.id)
                : [...prev, report]
        );
    };

    // CSV Export
    const handleExportCSV = () => {
        const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;
        const headers = ["ID", "Issue", "Description", "Category", "Area", "Priority", "Status"];
        const csvRows = [
            headers.join(","),
            ...dataToExport.map((r) => [r.id, r.issue, r.description, r.category, r.area, r.priority, r.status].join(",")),
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

    // PDF Export
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);

        const dataToExport = selectedReports.length > 0 ? selectedReports : filteredReports;

        doc.text("Reports Summary", 10, 10);
        dataToExport.forEach((r, i) => {
            doc.text(`${r.id}. ${r.issue} [${r.category}] - ${r.area} (${r.priority}, ${r.status})`, 10, 20 + i * 10);
        });

        doc.save(selectedReports.length > 0 ? "reports-selected.pdf" : "reports.pdf");
    };

    // AI Summary
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
                            content: `Here are civic reports:\n\n${JSON.stringify(dataToSend, null, 2)}\n\n
Please provide a long, detailed analysis covering:
- Issue context & background
- Community impact
- Priority justification
- Suggested action plan for city officials
- Possible risks if unresolved
Write in a structured but plain-text format.`,
                        },
                    ],
                }),
            });

            const data = await response.json();
            let summary = data.choices[0].message.content;
            summary = summary.replace(/[#*]/g, ""); // remove unwanted symbols
            setAiReport(summary);
        } catch (err) {
            console.error("AI Report Error:", err);
            setAiReport("❌ Failed to generate AI report.");
        } finally {
            setLoading(false);
        }
    };

    // AI Report PDF with multi-page support
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

        // Wrap text to page width
        const splitText = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);

        let cursorY = 20; // Start Y position
        splitText.forEach((line) => {
            if (cursorY + lineHeight > pageHeight - margin) {
                doc.addPage(); // Add new page when overflowing
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

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded-lg p-2 bg-white shadow-sm">
                    <option value="All">All Categories</option>
                    <option value="Potholes">Potholes</option>
                    <option value="Streetlights">Streetlights</option>
                    <option value="Trash">Trash</option>
                    <option value="Graffiti">Graffiti</option>
                </select>

                <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="border rounded-lg p-2 bg-white shadow-sm">
                    <option value="All">All Areas</option>
                    {[...new Set(reports.map((r) => r.area))].map((area) => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </select>

                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded-lg p-2 bg-white shadow-sm">
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <input
                    type="text"
                    placeholder="Search by area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg p-2 flex-1 min-w-[200px] bg-white shadow-sm"
                />
            </div>

            {/* Report Table */}
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-6">
                <table className="w-full border-collapse text-[#333]">
                    <thead className="bg-[#FFE4B5] text-left">
                        <tr>
                            <th className="p-3">Select</th>
                            <th className="p-3">ID</th>
                            <th className="p-3">Issue</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Area</th>
                            <th className="p-3">Priority</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.length > 0 ? (
                            filteredReports.map((r) => (
                                <tr key={r.id} className="border-t hover:bg-[#FFF9F0] transition">
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedReports.some((sel) => sel.id === r.id)}
                                            onChange={() => toggleSelection(r)}
                                        />
                                    </td>
                                    <td className="p-3">{r.id}</td>
                                    <td className="p-3">{r.issue}</td>
                                    <td className="p-3">{r.category}</td>
                                    <td className="p-3">{r.area}</td>
                                    <td className="p-3">{r.priority}</td>
                                    <td className="p-3">
                                        <span className={getStatusStyle(r.status)}>{r.status}</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-gray-500">No reports match filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Selected count */}
            {selectedReports.length > 0 && (
                <p className="mb-4 text-[#333] font-medium">
                    {selectedReports.length} report(s) selected.
                </p>
            )}

            {/* Export & AI */}
            <div className="flex gap-4 mb-6">
                <button onClick={handleExportCSV} className="bg-[#FFA500] hover:bg-[#e59400] text-white px-4 py-2 rounded-xl shadow">
                    Export {selectedReports.length > 0 ? "Selected" : "All"} CSV
                </button>
                <button onClick={handleExportPDF} className="bg-[#32CD32] hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow">
                    Export {selectedReports.length > 0 ? "Selected" : "All"} PDF
                </button>
                <button onClick={handleGenerateAIReport} className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-4 py-2 rounded-xl shadow">
                    {loading ? "Generating..." : `AI Report (${selectedReports.length > 0 ? "Selected" : "All"})`}
                </button>
            </div>

            {/* AI Report */}
            {aiReport && (
                <div className="bg-white shadow-md p-4 rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">AI Generated Report</h2>
                    <p className="whitespace-pre-line text-[#444]">{aiReport}</p>
                    <button onClick={handleDownloadAIReport} className="mt-4 bg-[#8A2BE2] hover:bg-[#6a1bbd] text-white px-4 py-2 rounded-xl shadow">
                        Download AI Report (PDF)
                    </button>
                </div>
            )}
        </div>
    );
}
