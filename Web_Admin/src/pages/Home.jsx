import StatCard from "../components/StateCArd"
import { AlertCircle, CheckCircle, Clock, Flame } from "lucide-react"

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

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
    </div>
  )
}
