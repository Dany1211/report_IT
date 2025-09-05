import StatCard from "../components/StateCArd";
import Table from "../components/Tables"; // Correctly import the Tables component
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react";

export default function Home() {
  // This is where you would fetch your data from Supabase.
  // For now, we'll use some mock data to make the Table component functional.
  const mockReports = [
    {
      id: 1,
      issue: "Pothole on Main Street",
      status: "In Progress",
      location: "37.7749° N, 122.4194° W",
    },
    {
      id: 2,
      issue: "Streetlight outage",
      status: "Open",
      location: "37.7818° N, 122.4085° W",
    },
    {
      id: 3,
      issue: "Overflowing trash bin",
      status: "Resolved",
      location: "37.7788° N, 122.4124° W",
    },
    {
      id: 4,
      issue: "Graffiti on bus stop",
      status: "In Progress",
      location: "37.7766° N, 122.4098° W",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Issues"
          value="42"
          icon={<AlertCircle size={20} />}
        />
        <StatCard
          title="Resolved This Week"
          value="128"
          icon={<CheckCircle size={20} />}
        />
        <StatCard
          title="Avg. Resolution Time"
          value="5h 20m"
          icon={<Clock size={20} />}
        />
        <StatCard
          title="High Priority Issues"
          value="7"
          icon={<Flame size={20} />}
        />
      </div>

      {/* Adding a space below the stat cards */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Reports
        </h2>
        <Table data={mockReports} />
      </div>
    </div>
  );
}