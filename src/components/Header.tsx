
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Plus, User, Settings, LogOut, Shield, Beaker, FolderOpen, FileText, CheckSquare, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CreateExperimentDialog from "@/components/CreateExperimentDialog";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import CreateReportDialog from "@/components/CreateReportDialog";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import CreateEventDialog from "@/components/CreateEventDialog";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createExperimentOpen, setCreateExperimentOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Implement actual search functionality based on current page
      const currentPath = window.location.pathname;
      if (currentPath.includes('/experiments')) {
        navigate(`/experiments?search=${encodeURIComponent(searchTerm)}`);
      } else if (currentPath.includes('/projects')) {
        navigate(`/projects?search=${encodeURIComponent(searchTerm)}`);
      } else if (currentPath.includes('/reports')) {
        navigate(`/reports?search=${encodeURIComponent(searchTerm)}`);
      } else {
        // Default to experiments search
        navigate(`/experiments?search=${encodeURIComponent(searchTerm)}`);
      }
      toast({
        title: "Search",
        description: `Searching for: ${searchTerm}`,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleProfileClick = () => {
    navigate("/admin/users");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleAdminClick = () => {
    navigate("/admin/users");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search experiments, projects, or protocols..."
                className="pl-10 pr-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Create */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setCreateExperimentOpen(true)}>
                  <Beaker className="mr-2 h-4 w-4" />
                  New Experiment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateProjectOpen(true)}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateReportOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  New Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateTaskOpen(true)}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  New Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCreateEventOpen(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAdminClick}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Panel</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Create Dialogs */}
      <CreateExperimentDialog />
      <CreateProjectDialog />
      <CreateReportDialog open={createReportOpen} onOpenChange={setCreateReportOpen} />
      <CreateTaskDialog />
      <CreateEventDialog open={createEventOpen} onOpenChange={setCreateEventOpen} />
    </>
  );
};

export default Header;
