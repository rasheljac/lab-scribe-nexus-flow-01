
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Home,
  Beaker,
  FolderOpen,
  Calendar,
  CheckSquare,
  BarChart3,
  FileText,
  Package,
  Users,
  Settings,
  MessageSquare,
  Video,
  Printer,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExperiments } from "@/hooks/useExperiments";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useReports } from "@/hooks/useReports";
import { useProtocols } from "@/hooks/useProtocols";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  
  // Get actual counts
  const { experiments } = useExperiments();
  const { ideas } = useExperimentIdeas();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { reports } = useReports();
  const { protocols } = useProtocols();

  // Filter uncompleted tasks
  const uncompletedTasksCount = tasks.filter(task => task.status !== 'completed').length;

  const allMenuItems = [
    { icon: Home, label: "Dashboard", path: "/", badge: null, key: "dashboard" },
    { icon: Beaker, label: "Experiments", path: "/experiments", badge: experiments.length.toString(), key: "experiments" },
    { icon: Lightbulb, label: "Experiment Ideas", path: "/experiment-ideas", badge: ideas.length.toString(), key: "experiment-ideas" },
    { icon: FolderOpen, label: "Projects", path: "/projects", badge: projects.length.toString(), key: "projects" },
    { icon: FileText, label: "Protocols", path: "/protocols", badge: protocols.length.toString(), key: "protocols" },
    { icon: Calendar, label: "Calendar", path: "/calendar", badge: null, key: "calendar" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks", badge: uncompletedTasksCount.toString(), key: "tasks" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", badge: null, key: "analytics" },
    { icon: FileText, label: "Reports", path: "/reports", badge: reports.length.toString(), key: "reports" },
    { icon: Package, label: "Inventory", path: "/inventory", badge: "!", key: "inventory" },
    { icon: Printer, label: "Label Printer", path: "/labels", badge: null, key: "labels" },
    { icon: ShoppingCart, label: "Order Portal", path: "/orders", badge: "2", key: "orders" },
    { icon: MessageSquare, label: "Messages", path: "/messages", badge: "5", key: "messages" },
    { icon: Video, label: "Video Chat", path: "/video-chat", badge: null, key: "video-chat" },
    { icon: Users, label: "Team", path: "/team", badge: null, key: "team" },
    { icon: Settings, label: "Settings", path: "/settings", badge: null, key: "settings" },
  ];

  const adminItems = [
    { icon: Users, label: "User Management", path: "/admin/users", badge: null, key: "admin-users" },
    { icon: Settings, label: "System Settings", path: "/admin/settings", badge: null, key: "admin-settings" },
  ];

  // Filter out hidden pages - only apply filtering if preferences are loaded
  const hiddenPages = preferences?.hidden_pages || [];
  const menuItems = preferencesLoading ? allMenuItems : allMenuItems.filter(item => !hiddenPages.includes(item.key));
  const visibleAdminItems = preferencesLoading ? adminItems : adminItems.filter(item => !hiddenPages.includes(item.key));

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/23fe0903-c1fa-4493-b830-482c645b0541.png" 
              alt="Kapelczak Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-lg">Kapelczak ELN</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                collapsed && "justify-center px-2"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badge === "!" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}

        {/* Admin Section */}
        {!collapsed && visibleAdminItems.length > 0 && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Administration
            </p>
            {visibleAdminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
