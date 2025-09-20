import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// KPI card styles
const getStatCardStyles = (title) => {
  switch (title) {
    case "Pending Issues":
      return {
      bgGradient: "bg-gradient-to-br from-[#FCE6DF] to-[#F5A9A7]", // Soft red
        iconBg: "bg-[#F56565]", // Dark gray-blue for icon
      };
    case "Resolved Issues":
      return {
        bgGradient: "bg-gradient-to-br from-[#E0F3E0] to-[#A3D9A3]", // Soft green
        iconBg: "bg-[#2D8C2D]",
      };
    case "In Progress":
      return {
   bgGradient: "bg-gradient-to-br from-[#FFFDEB] to-[#FFF59D]", // Soft yellow
  iconBg: "bg-[#FFDA03]",
      };
    case "Total Issues":
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

const StatCard = ({ title, value, icon, styles }) => (
  <div
    className={`p-6 rounded-2xl shadow-md transition-transform duration-300 hover:scale-[1.02] ${styles.bgGradient}`}
  >
    <div className="flex items-center gap-4">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white ${styles.iconBg}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-[#4A5568] uppercase">{title}</p>
    </div>
    <p className="text-4xl font-extrabold text-[#1A202C] mt-2">{value}</p>
  </div>
);

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [geocodedReports, setGeocodedReports] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState("Monthly");
  const [selectedReport, setSelectedReport] = useState(null);
  const affectedTableRef = useRef(null);
  const navigate = useNavigate();

  const highestAffectedReport = reports
    .filter(r => r.affected_count > 0)
    .reduce((max, r) => (r.affected_count > (max?.affected_count || 0) ? r : max), null);

  useEffect(() => {
    const fetchReports = async () => {
      const { data: initialReports, error } = await supabase.from("reports").select("*");
      if (error) {
        console.error("Error fetching reports:", error);
        setPageLoading(false);
        setMapLoading(false);
        return;
      }
      setReports(initialReports || []);
      setPageLoading(false);

      const geocodingPromises = (initialReports || []).map(async (report) => {
        if (!report.location || !GEOAPIFY_API_KEY) return report;
        try {
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
            report.location
          )}&apiKey=${GEOAPIFY_API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.features?.length) {
            const [lng, lat] = data.features[0].geometry.coordinates;
            return { ...report, lat, lng };
          }
        } catch (e) {
          console.error("Geo failed:", e);
        }
        return report;
      });

      const resolved = await Promise.all(geocodingPromises);
      setGeocodedReports(resolved);
      setMapLoading(false);
    };
    fetchReports();
  }, []);

  const totalIssues = reports.length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const inProgressCount = reports.filter(r => r.status === "In Progress").length;

  const issuesTrend = (() => {
    const map = {};
    reports.forEach(r => {
      const date = new Date(r.created_at);
      let key;
      if (timeGrouping === "Daily") key = format(date, "dd MMM");
      else if (timeGrouping === "Weekly") key = `Week ${format(date, "yyyy-'W'ww")}`;
      else key = format(date, "MMM yyyy");
      if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
      map[key].reported++;
      if (r.status === "Resolved") map[key].resolved++;
    });
    return Object.values(map);
  })();

  const categoryMap = {};
  reports.forEach(r => {
    categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const geoReports = geocodedReports.filter(r => r.lat && r.lng);
  const DEFAULT_CENTER = [19.7515, 75.7139];
  const DEFAULT_ZOOM = 6;
  const avgLat =
    geoReports.length > 0
      ? geoReports.reduce((s, r) => s + r.lat, 0) / geoReports.length
      : DEFAULT_CENTER[0];
  const avgLng =
    geoReports.length > 0
      ? geoReports.reduce((s, r) => s + r.lng, 0) / geoReports.length
      : DEFAULT_CENTER[1];

  const COLORS = ["#F56565", "#A3D9A3", "#B8C4D4", "#E0E7FF"];

  return (
    <div className="min-h-screen flex bg-[#E8EDF4]">
      <main className="flex-1 p-6">
        {/* KPIs */}
        {pageLoading ? (
          <p className="p-6 text-[#4A5568]">Loading reports...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Issues" value={totalIssues} icon={<Flame size={24} />} styles={getStatCardStyles("Total Issues")} />
            <StatCard title="Pending Issues" value={pendingCount} icon={<AlertCircle size={24} />} styles={getStatCardStyles("Pending Issues")} />
            <StatCard title="In Progress" value={inProgressCount} icon={<Clock size={24} />} styles={getStatCardStyles("In Progress")} />
            <StatCard title="Resolved Issues" value={resolvedCount} icon={<CheckCircle size={24} />} styles={getStatCardStyles("Resolved Issues")} />
          </div>
        )}

        {/* Chart + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {!pageLoading && (
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-[#A0B0C0]">
              <div className="mb-4 flex items-center gap-4">
                <h2 className="text-lg font-semibold text-[#1A202C]">Reported vs Resolved</h2>
                <select
                  value={timeGrouping}
                  onChange={(e) => setTimeGrouping(e.target.value)}
                  className="border rounded-lg p-1 px-2 text-sm bg-white border-[#A0B0C0]"
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={issuesTrend} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="period" stroke="#4A5568" />
                  <YAxis stroke="#4A5568" />
                  <Tooltip contentStyle={{ backgroundColor: "#F9FAFB", borderColor: "#E2E8F0" }} />
                  <Legend />
                  <Bar dataKey="reported" fill="#F56565" radius={[6,6,0,0]} />
                  <Bar dataKey="resolved" fill="#2D8C2D" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-2xl p-6 border border-[#A0B0C0]">
            <h2 className="text-lg font-semibold text-[#1A202C] mb-4">Live Issues Map</h2>
            {mapLoading ? (
              <p className="text-[#4A5568]">Loading map...</p>
            ) : (
              <MapContainer
                center={geoReports.length > 0 ? [avgLat, avgLng] : DEFAULT_CENTER}
                zoom={geoReports.length > 0 ? 6 : DEFAULT_ZOOM}
                className="h-[350px] w-full rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                {geoReports.map((r, idx) => (
                  <Marker key={r.id || idx} position={[r.lat, r.lng]}>
                    <Popup>
                      <b>{r.issue_type}</b><br />
                      Status: {r.status}<br />
                      Priority: {r.priority}<br />
                      Location: {r.location}<br />
                      Reported: {format(new Date(r.created_at), "PP")}
                      <div className="mt-2">
                        <button
                          className="bg-[#F56565] text-white px-3 py-1 rounded-md shadow hover:bg-[#D64545]"
                          onClick={() => navigate("/reports", { state: { reportId: r.id } })}
                        >
                          Go to Report
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Categories + Table */}
        {!pageLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-[#A0B0C0]">
              <h2 className="text-lg font-semibold text-[#1A202C] mb-4">Issues by Category</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" outerRadius={80} label>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#F9FAFB", borderColor: "#E2E8F0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 border border-[#A0B0C0]">
              <h2 className="text-lg font-semibold text-[#1A202C] mb-4">Reports with Affected Count</h2>
              {reports.filter(r => r.affected_count > 0).length === 0 ? (
                <p className="text-[#4A5568]">No reports with affected count 🎉</p>
              ) : (
                <div ref={affectedTableRef} className="overflow-y-auto max-h-64 rounded-lg border border-[#A0B0C0]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#E0E7F5] sticky top-0">
                      <tr>
                        <th className="p-2 border border-[#A0B0C0]">#</th>
                        <th className="p-2 border border-[#A0B0C0]">Issue</th>
                        <th className="p-2 border border-[#A0B0C0]">Location</th>
                        <th className="p-2 border border-[#A0B0C0]">Affected</th>
                        <th className="p-2 border border-[#A0B0C0]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports
                        .filter(r => r.affected_count > 0)
                        .sort((a, b) => b.affected_count - a.affected_count)
                        .map((r, idx) => (
                          <tr
                            key={r.id}
                            className="hover:bg-[#F0F4F8] cursor-pointer"
                            onClick={() => setSelectedReport(r)}
                          >
                            <td className="p-2 border border-[#A0B0C0] font-bold">{idx + 1}</td>
                            <td className="p-2 border border-[#A0B0C0]">{r.issue_type}</td>
                            <td className="p-2 border border-[#A0B0C0]">{r.location}</td>
                            <td className="p-2 border border-[#A0B0C0] font-semibold text-[#F56565]">{r.affected_count}</td>
                            <td className="p-2 border border-[#A0B0C0]">{r.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

{selectedReport && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" style={{ zIndex: 9999 }}>
    <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-lg border border-[#A0B0C0] relative">
      <button
        className="absolute top-3 right-3 text-[#4A5568] hover:text-[#1A202C]"
        onClick={() => setSelectedReport(null)}
      >
        ✕
      </button>
      <h2 className="text-xl font-bold text-[#1A202C] mb-4">Report Details</h2>
      <div className="space-y-2 text-sm text-[#4A5568]">
        <p><b>Issue:</b> {selectedReport.issue_type}</p>
        <p><b>Location:</b> {selectedReport.location}</p>
        <p><b>Status:</b> {selectedReport.status}</p>
        <p><b>Priority:</b> {selectedReport.priority || "N/A"}</p>
        <p><b>Affected:</b> {selectedReport.affected_count}</p>
        <p><b>Reported:</b> {format(new Date(selectedReport.created_at), "PPpp")}</p>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-[#F56565] text-white rounded-lg shadow hover:bg-[#D64545]"
        onClick={() => navigate("/reports", { state: { reportId: selectedReport.id } })}
      >
        Go to Report
      </button>
    </div>
  </div>
)}
      </main>
    </div>
  );
}