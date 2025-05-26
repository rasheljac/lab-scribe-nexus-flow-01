
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Beaker, FolderOpen, CheckSquare, BarChart3, FileText, Users, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import TaskList from "@/components/TaskList";
import QuickActions from "@/components/QuickActions";
import { useProjects } from "@/hooks/useProjects";
import { useExperiments } from "@/hooks/useExperiments";
import { useReports } from "@/hooks/useReports";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const Index = () => {
  const { projects } = useProjects();
  const { experiments } = useExperiments();
  const { reports } = useReports();
  const { events } = useCalendarEvents();

  // Calculate real stats
  const activeExperiments = experiments.filter(exp => exp.status === 'in_progress').length;
  const completedExperiments = experiments.filter(exp => exp.status === 'completed').length;
  const totalProjects = projects.length;
  const pendingReports = reports.filter(report => report.status === 'draft').length;

  // Get upcoming events
  const upcomingEvents = [...events]
    .filter(event => new Date(event.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 3);

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "meeting":
        return "bg-blue-600";
      case "maintenance":
        return "bg-orange-600";
      case "experiment":
        return "bg-green-600";
      case "training":
        return "bg-purple-600";
      case "booking":
        return "bg-pink-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/lovable-uploads/23fe0903-c1fa-4493-b830-482c645b0541.png" 
                  alt="Kapelczak Lab Logo" 
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome to Kapelczak ELN</h1>
                  <p className="text-gray-600 mt-1">Your comprehensive electronic laboratory notebook</p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Active Experiments"
                value={activeExperiments}
                icon={Beaker}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatsCard
                title="Completed Experiments"
                value={completedExperiments}
                icon={CheckSquare}
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatsCard
                title="Total Projects"
                value={totalProjects}
                icon={FolderOpen}
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatsCard
                title="Pending Reports"
                value={pendingReports}
                icon={FileText}
                color="text-orange-600"
                bgColor="bg-orange-50"
              />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task List */}
              <div className="lg:col-span-2">
                <TaskList />
              </div>

              {/* Quick Actions */}
              <div>
                <QuickActions />
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Experiment Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experiments.slice(0, 3).map((experiment) => (
                      <div key={experiment.id}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{experiment.title}</span>
                          <Badge variant="outline">{experiment.progress}%</Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${experiment.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {experiments.length === 0 && (
                      <p className="text-gray-500 text-sm">No experiments found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Upcoming Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${getEventColor(event.event_type)}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">{formatDateTime(event.start_time)}</p>
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No upcoming events
                      </div>
                    )}
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

export default Index;
