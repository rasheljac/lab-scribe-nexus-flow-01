
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Flask, FolderOpen, CheckSquare, BarChart3, FileText, Users, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import RecentActivity from "@/components/RecentActivity";
import QuickActions from "@/components/QuickActions";

const Index = () => {
  const [activeExperiments, setActiveExperiments] = useState(12);
  const [completedTasks, setCompletedTasks] = useState(8);
  const [totalProjects, setTotalProjects] = useState(5);
  const [pendingReports, setPendingReports] = useState(3);

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
                icon={Flask}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatsCard
                title="Completed Tasks"
                value={completedTasks}
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
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <RecentActivity />
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Protein Analysis</span>
                      <Badge variant="outline">75%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cell Culture Study</span>
                      <Badge variant="outline">45%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">DNA Sequencing</span>
                      <Badge variant="outline">90%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-9/10"></div>
                    </div>
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
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Lab Meeting</p>
                        <p className="text-xs text-gray-600">Today, 2:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Equipment Maintenance</p>
                        <p className="text-xs text-gray-600">Tomorrow, 9:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Inventory Check</p>
                        <p className="text-xs text-gray-600">Friday, 11:00 AM</p>
                      </div>
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

export default Index;
