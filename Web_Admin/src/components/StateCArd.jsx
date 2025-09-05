export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center space-x-4">
      {/* Icon */}
      <div className="p-3 bg-yellow-100 text-yellow-500 rounded-xl">
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
