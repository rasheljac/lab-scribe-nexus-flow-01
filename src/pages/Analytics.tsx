
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, Calendar, Users, Beaker, CheckSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const monthlyData = [
  { month: "Jan", experiments: 12, reports: 8, tasks: 25 },
  { month: "Feb", experiments: 15, reports: 12, tasks: 30 },
  { month: "Mar", experiments: 18, reports: 10, tasks: 28 },
  { month: "Apr", experiments: 22, reports: 15, tasks: 35 },
  { month: "May", experiments: 20, reports: 18, tasks: 32 },
  { month: "Jun", experiments: 25, reports: 20, tasks: 40 },
];

const experimentStatusData = [
  { name: "Completed", value: 45, color: "#22c55e" },
  { name: "In Progress", value: 30, color: "#3b82f6" },
  { name: "Planning", value: 15, color: "#f59e0b" },
  { name: "On Hold", value: 10, color: "#ef4444" },
];

const productivityData = [
  { week: "Week 1", productivity: 85 },
  { week: "Week 2", productivity: 92 },
  { week: "Week 3", productivity: 78 },
  { week: "Week 4", productivity: 95 },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Performance metrics and laboratory insights</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Last 30 days</Badge>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Experiments</p>
                      <p className="text-3xl font-bold text-gray-900">142</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% from last month
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Beaker className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                      <p className="text-3xl font-bold text-gray-900">89</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +8% from last month
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <CheckSquare className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-3xl font-bold text-gray-900">24</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +3 new this month
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
                      <p className="text-3xl font-bold text-gray-900">5.2</p>
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 rotate-180" />
                        -0.3 days from last month
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="experiments" fill="#3b82f6" name="Experiments" />
                      <Bar dataKey="reports" fill="#10b981" name="Reports" />
                      <Bar dataKey="tasks" fill="#f59e0b" name="Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Experiment Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Experiment Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={experimentStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {experimentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Productivity Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="productivity" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Experiment Completion Rate</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your team completed 85% of planned experiments this month, exceeding the target by 15%.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">Resource Utilization</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Equipment usage is at 92% efficiency, showing excellent resource management.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Inventory Alert</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        3 items are running low on stock. Consider placing orders to avoid delays.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
