"use client";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const stats = [
  {
    id: 1,
    title: "Total views",
    value: "223.2k",
    change: "+14",
    icon: <VisibilityIcon className="text-gray-500" />,
  },
  {
    id: 2,
    title: "Products sold",
    value: "1713",
    change: "+11",
    icon: <ShoppingCartIcon className="text-gray-500" />,
  },
  {
    id: 3,
    title: "Total income",
    value: "86.2 L",
    change: "+8",
    icon: <AttachMoneyIcon className="text-gray-500" />,
  },
];

export default function Overview() {
  return (
    <div className="w-full rounded-xl shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Overview</h2>
        <select className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <div>
                <p className="text-sm">{item.title}</p>
                <h3 className="text-xl font-bold ">{item.value}</h3>
              </div>
            </div>
            <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-md text-sm font-medium">
              {item.change}
              <ArrowUpwardIcon fontSize="small" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
