"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data
const salesData = [
  { date: "Aug 01, 2022", views: 80_000, sold: 40_000 },
  { date: "Aug 08, 2022", views: 150_000, sold: 70_000 },
  { date: "Aug 15, 2022", views: 200_000, sold: 100_000 },
  { date: "Aug 22, 2022", views: 120_000, sold: 60_000 },
  { date: "Aug 31, 2022", views: 160_000, sold: 90_000 },
];

const performanceData = [
  { day: "Mon", viewed: 100_000, sold: 50_000, wishlisted: 30_000 },
  { day: "Tue", viewed: 120_000, sold: 60_000, wishlisted: 40_000 },
  { day: "Wed", viewed: 90_000, sold: 45_000, wishlisted: 25_000 },
  { day: "Thu", viewed: 130_000, sold: 70_000, wishlisted: 35_000 },
  { day: "Fri", viewed: 160_000, sold: 80_000, wishlisted: 50_000 },
  { day: "Sat", viewed: 180_000, sold: 100_000, wishlisted: 60_000 },
  { day: "Sun", viewed: 150_000, sold: 75_000, wishlisted: 40_000 },
];

const keywordsData = [
  { name: "PlayStation 5", value: 40 },
  { name: "PlayStation 5 Console full set", value: 30 },
  { name: "PS5 Console", value: 20 },
  { name: "Video Games", value: 10 },
];

const COLORS = ["#4F46E5", "#06B6D4", "#FACC15", "#F43F5E"];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Sales Potential Overview */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Sales Potential Overview</h2>
          <select className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#06B6D4" strokeWidth={3} />
            <Line type="monotone" dataKey="sold" stroke="#4F46E5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Product Performance</h2>
          <select className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="viewed" fill="#06B6D4" />
            <Bar dataKey="sold" fill="#4F46E5" />
            <Bar dataKey="wishlisted" fill="#FACC15" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Keywords</h2>
          <select className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={keywordsData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label
            >
              {keywordsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
