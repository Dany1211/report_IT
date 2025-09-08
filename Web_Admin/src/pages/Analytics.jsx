import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // adjust path if needed
import {
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons (important for bundlers like Vite/CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeGrouping, setTimeGrouping] = useState("Monthly"); // options: "Daily", "Weekly", "Monthly"


  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from("reports").select("*");
      if (error) {
        console.error("Error fetching reports:", error);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  if (loading) {
    return <p className="p-6 text-[#555555]">Loading analytics...</p>;
  }

  // ---------- KPI Overview ----------
  const totalIssues = reports.length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const avgResolutionTime = 4.5; // placeholder


  // ---------- Monthly Trend ----------
  const issuesTrend = (() => {
    const map = {};
    reports.forEach(r => {
      const date = new Date(r.created_at);
      let key;

      if (timeGrouping === "Daily") {
        key = format(date, "dd MMM");
      } else if (timeGrouping === "Weekly") {
        const weekStart = format(date, "yyyy-'W'ww"); // ISO week
        key = `Week ${weekStart}`;
      } else {
        key = format(date, "MMM yyyy");
      }

      if (!map[key]) map[key] = { period: key, reported: 0, resolved: 0 };
      map[key].reported++;
      if (r.status === "Resolved") map[key].resolved++;
    });
    return Object.values(map);
  })();


  // ---------- Category Breakdown ----------
  const categoryMap = {};
  reports.forEach(r => {
    categoryMap[r.issue_type] = (categoryMap[r.issue_type] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // ---------- Status Breakdown ----------
  const statusMap = {};
  reports.forEach(r => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // ---------- Priority Breakdown (placeholder if no field) ----------
  const priorityMap = {};
  reports.forEach(r => {
    const p = r.priority || "Low";
    priorityMap[p] = (priorityMap[p] || 0) + 1;
  });
  const priorityData = Object.entries(priorityMap).map(([name, value]) => ({ name, value }));

  // ---------- Geo Reports for Map ----------
  const geoReports = reports.filter(r => {
    const lat = r.lat || r.latitude || r.location_lat || r?.location?.lat;
    const lng = r.lng || r.longitude || r.location_lng || r?.location?.lng;
    return lat && lng;
  });

  // Default center: India if no reports
  const avgLat =
    geoReports.length > 0
      ? geoReports.reduce((s, r) => s + (r.lat || r.latitude || r.location_lat || r?.location?.lat), 0) /
      geoReports.length
      : 20.5937;
  const avgLng =
    geoReports.length > 0
      ? geoReports.reduce((s, r) => s + (r.lng || r.longitude || r.location_lng || r?.location?.lng), 0) /
      geoReports.length
      : 78.9629;

  // Theme colors
  const COLORS = ["#FFA500", "#32CD32", "#FF4500", "#FFB347"];
  const statusColors = {
    Pending: "#FF0000",       // 🔴 Red
    "In Progress": "#FFA500", // 🟠 Orange/Yellow
    Resolved: "#32CD32",      // 🟢 Green
    Alert: "#FF4500",         // 🔴 Dark Red/Orange (if you keep it)
  };


  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#FFF9F0] to-[#FFF1C6]">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
          <h3 className="text-sm text-[#555555] mb-2">Total Issues</h3>
          <p className="text-2xl font-bold text-[#333333]">{totalIssues}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
          <h3 className="text-sm text-[#555555] mb-2">Resolved</h3>
          <p className="text-2xl font-bold text-[#32CD32]">{resolvedCount}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
          <h3 className="text-sm text-[#555555] mb-2">Pending</h3>
          <p className="text-2xl font-bold text-[#FFB347]">{pendingCount}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-4 text-center border border-[#FFE4B5]">
          <h3 className="text-sm text-[#555555] mb-2">Avg. Resolution Time</h3>
          <p className="text-2xl font-bold text-[#FFA500]">{avgResolutionTime}h</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
        {/* Header with dropdown */}
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[#333333]">Reported vs Resolved</h2>
          <select
            value={timeGrouping}
            onChange={(e) => setTimeGrouping(e.target.value)}
            className="border border-[#FFE4B5] rounded-lg p-1 px-2 bg-white"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={issuesTrend} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFE4B5" />
            <XAxis dataKey="period" stroke="#555555" />
            <YAxis stroke="#555555" />
            <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
            <Legend />
            <Bar dataKey="reported" fill="#FFA500" radius={[6, 6, 0, 0]} />
            <Bar dataKey="resolved" fill="#32CD32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>


      {/* Live Issues Map */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5] mb-10">
        <h2 className="text-lg font-semibold text-[#333333] mb-4">Live Issues Map</h2>
        <MapContainer center={[avgLat, avgLng]} zoom={5} className="h-[400px] w-full rounded-lg z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          {geoReports.map((r, idx) => {
            const lat = r.lat || r.latitude || r.location_lat || r?.location?.lat;
            const lng = r.lng || r.longitude || r.location_lng || r?.location?.lng;
            return (
              <Marker key={idx} position={[lat, lng]}>
                <Popup>
                  <b>{r.issue_type}</b> <br />
                  Status: {r.status} <br />
                  Priority: {r.priority || "Low"} <br />
                  Reported: {format(new Date(r.created_at), "PP")} <br />
                  {r.description}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
          <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={statusColors[entry.name] || "#808080"} // fallback gray
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }}
              />
            </PieChart>

          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
          <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-[#FFE4B5]">
          <h2 className="text-lg font-semibold text-[#333333] mb-4">Issues by Priority</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                {priorityData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#FFF9F0", borderColor: "#FFE4B5" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
