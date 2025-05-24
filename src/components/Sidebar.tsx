
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
  ChevronRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/", badge: null },
    { icon: Beaker, label: "Experiments", path: "/experiments", badge: "12" },
    { icon: FolderOpen, label: "Projects", path: "/projects", badge: "5" },
    { icon: Calendar, label: "Calendar", path: "/calendar", badge: null },
    { icon: CheckSquare, label: "Tasks", path: "/tasks", badge: "8" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", badge: null },
    { icon: FileText, label: "Reports", path: "/reports", badge: "3" },
    { icon: Package, label: "Inventory", path: "/inventory", badge: "!" },
    { icon: Printer, label: "Label Printer", path: "/labels", badge: null },
    { icon: ShoppingCart, label: "Order Portal", path: "/orders", badge: "2" },
    { icon: MessageSquare, label: "Messages", path: "/messages", badge: "5" },
    { icon: Video, label: "Video Chat", path: "/video-chat", badge: null },
    { icon: Users, label: "Team", path: "/team", badge: null },
    { icon: Settings, label: "Settings", path: "/settings", badge: null },
  ];

  const adminItems = [
    { icon: Users, label: "User Management", path: "/admin/users", badge: null },
    { icon: Settings, label: "System Settings", path: "/admin/settings", badge: null },
  ];

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
        {!collapsed && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Administration
            </p>
            {adminItems.map((item) => {
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
