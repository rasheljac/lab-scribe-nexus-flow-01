
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, Calendar, Users, Beaker, CheckSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useProjects } from "@/hooks/useProjects";
import { useExperiments } from "@/hooks/useExperiments";
import { useTasks } from "@/hooks/useTasks";
import { useReports } from "@/hooks/useReports";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const Analytics = () => {
  const { projects } = useProjects();
  const { experiments } = useExperiments();
  const { tasks } = useTasks();
  const { reports } = useReports();
  const { teamMembers } = useTeamMembers();

  // Calculate real statistics
  const totalExperiments = experiments.length;
  const completedExperiments = experiments.filter(exp => exp.status === 'completed').length;
  const inProgressExperiments = experiments.filter(exp => exp.status === 'in_progress').length;
  const planningExperiments = experiments.filter(exp => exp.status === 'planning').length;
  const onHoldExperiments = experiments.filter(exp => exp.status === 'on_hold').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalProjects = projects.length;
  const totalReports = reports.length;
  const activeTeamMembers = teamMembers.filter(member => member.status === 'active').length;

  // Generate monthly data based on creation dates
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const currentDate = new Date();
      const targetDate = new Date(currentDate.getFullYear(), monthIndex, 1);
      
      const experimentsThisMonth = experiments.filter(exp => {
        const expDate = new Date(exp.created_at);
        return expDate.getMonth() === monthIndex && expDate.getFullYear() === currentDate.getFullYear();
      }).length;

      const reportsThisMonth = reports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate.getMonth() === monthIndex && reportDate.getFullYear() === currentDate.getFullYear();
      }).length;

      const tasksThisMonth = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === currentDate.getFullYear();
      }).length;

      return {
        month,
        experiments: experimentsThisMonth,
        reports: reportsThisMonth,
        tasks: tasksThisMonth
      };
    });
  };

  const monthlyData = generateMonthlyData();

  const experimentStatusData = [
    { name: "Completed", value: completedExperiments, color: "#22c55e" },
    { name: "In Progress", value: inProgressExperiments, color: "#3b82f6" },
    { name: "Planning", value: planningExperiments, color: "#f59e0b" },
    { name: "On Hold", value: onHoldExperiments, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // Calculate productivity trend (simplified)
  const productivityData = [
    { week: "Week 1", productivity: Math.min(95, Math.max(70, (completedTasks / totalTasks) * 100 || 85)) },
    { week: "Week 2", productivity: Math.min(95, Math.max(70, (completedExperiments / totalExperiments) * 100 || 92)) },
    { week: "Week 3", productivity: Math.min(95, Math.max(70, (projects.filter(p => p.status === 'active').length / totalProjects) * 100 || 78)) },
    { week: "Week 4", productivity: Math.min(95, Math.max(70, (activeTeamMembers / (teamMembers.length || 1)) * 100 || 95)) },
  ];

  const avgCompletionTime = totalExperiments > 0 
    ? (experiments.reduce((acc, exp) => {
        if (exp.status === 'completed' && exp.end_date) {
          const start = new Date(exp.start_date);
          const end = new Date(exp.end_date);
          return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }
        return acc;
      }, 0) / completedExperiments).toFixed(1)
    : "N/A";

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
                <Badge variant="outline">Live Data</Badge>
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
                      <p className="text-3xl font-bold text-gray-900">{totalExperiments}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        {completedExperiments} completed
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
                      <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        of {totalTasks} total tasks
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
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        {projects.filter(p => p.status === 'active').length} active
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
                      <p className="text-3xl font-bold text-gray-900">{avgCompletionTime}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                        {typeof avgCompletionTime === 'string' && avgCompletionTime !== 'N/A' ? 'days' : 'No data yet'}
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
                  {experimentStatusData.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No experiment data available
                    </div>
                  )}
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
                      <h4 className="font-semibold text-blue-900">Experiment Status</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You have {totalExperiments} experiments with {completedExperiments} completed 
                        ({totalExperiments > 0 ? Math.round((completedExperiments / totalExperiments) * 100) : 0}% completion rate).
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900">Task Management</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {completedTasks} of {totalTasks} tasks completed 
                        ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate).
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Team Overview</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        {activeTeamMembers} active team members working on {totalProjects} projects.
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
