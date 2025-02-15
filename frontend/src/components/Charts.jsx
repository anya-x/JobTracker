import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Charts = ({ applications }) => {
  // Status distribution data
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace("_", " "),
    value: count,
  }));

  const COLORS = {
    SAVED: "#9CA3AF",
    APPLIED: "#FCD34D",
    "PHONE SCREEN": "#60A5FA",
    INTERVIEW: "#A78BFA",
    OFFER: "#34D399",
    REJECTED: "#F87171",
    ACCEPTED: "#10B981",
    WITHDRAWN: "#6B7280",
  };

  // Applications over time (by month)
  const applicationsByMonth = applications.reduce((acc, app) => {
    const date = new Date(app.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});

  const timelineData = Object.entries(applicationsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count,
    }));

  // Calculate metrics
  const totalApps = applications.length;
  const appliedCount = applications.filter((a) =>
    ["APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER", "ACCEPTED"].includes(
      a.status
    )
  ).length;
  const interviewCount = applications.filter((a) =>
    ["PHONE_SCREEN", "INTERVIEW", "OFFER", "ACCEPTED"].includes(a.status)
  ).length;
  const offerCount = applications.filter((a) =>
    ["OFFER", "ACCEPTED"].includes(a.status)
  ).length;

  const applicationRate =
    totalApps > 0 ? ((appliedCount / totalApps) * 100).toFixed(1) : 0;
  const interviewRate =
    appliedCount > 0 ? ((interviewCount / appliedCount) * 100).toFixed(1) : 0;
  const offerRate =
    appliedCount > 0 ? ((offerCount / appliedCount) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Application Rate</div>
          <div className="text-3xl font-bold text-indigo-600">
            {applicationRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {appliedCount} of {totalApps} saved jobs
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Interview Rate</div>
          <div className="text-3xl font-bold text-purple-600">
            {interviewRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {interviewCount} of {appliedCount} applications
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Offer Rate</div>
          <div className="text-3xl font-bold text-green-600">{offerRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {offerCount} of {appliedCount} applications
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*  Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name.toUpperCase()] || "#9CA3AF"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Applications Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Applications" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
