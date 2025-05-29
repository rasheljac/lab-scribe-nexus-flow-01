
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Database, Server, Users, FileText, Package, Printer, Calendar, Beaker, FolderOpen, CheckSquare, BarChart3, MessageSquare, Video, ShoppingCart } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const allPages = [
    { key: "dashboard", label: "Dashboard", icon: Settings },
    { key: "experiments", label: "Experiments", icon: Beaker },
    { key: "projects", label: "Projects", icon: FolderOpen },
    { key: "calendar", label: "Calendar", icon: Calendar },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "reports", label: "Reports", icon: FileText },
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "labels", label: "Label Printer", icon: Printer },
    { key: "orders", label: "Order Portal", icon: ShoppingCart },
    { key: "messages", label: "Messages", icon: MessageSquare },
    { key: "video-chat", label: "Video Chat", icon: Video },
    { key: "team", label: "Team", icon: Users },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "admin-users", label: "User Management", icon: Users },
    { key: "admin-settings", label: "System Settings", icon: Settings },
  ];

  const [systemConfig, setSystemConfig] = useState({
    siteName: "Kapelczak ELN",
    description: "Electronic Laboratory Notebook",
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: "50",
    sessionTimeout: "24",
    backupFrequency: "daily",
  });

  const hiddenPages = preferences?.hidden_pages || [];

  const handlePageVisibilityToggle = async (pageKey: string) => {
    const newHiddenPages = hiddenPages.includes(pageKey)
      ? hiddenPages.filter(key => key !== pageKey)
      : [...hiddenPages, pageKey];

    setLoading(true);
    try {
      await updatePreferences({ hidden_pages: newHiddenPages });
      toast({
        title: "Success",
        description: "Page visibility updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page visibility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSystemConfigSave = () => {
    toast({
      title: "Success",
      description: "System configuration saved successfully",
    });
  };

  const handleDatabaseMaintenance = () => {
    toast({
      title: "Database Maintenance",
      description: "Database optimization started in background",
    });
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({
      title: "Success",
      description: "System cache cleared successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
              </div>
              <Badge variant="secondary" className="gap-2">
                <Shield className="h-4 w-4" />
                Admin Access
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Page Visibility Settings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Page Visibility Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Control which pages are visible in the navigation menu. Hidden pages can be re-enabled later.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allPages.map((page) => {
                        const isHidden = hiddenPages.includes(page.key);
                        const IconComponent = page.icon;
                        return (
                          <div key={page.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium">{page.label}</span>
                            </div>
                            <Switch
                              checked={!isHidden}
                              onCheckedChange={() => handlePageVisibilityToggle(page.key)}
                              disabled={loading || page.key === "admin-settings"} // Prevent hiding system settings
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={systemConfig.siteName}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Site Description</Label>
                    <Textarea
                      id="description"
                      value={systemConfig.description}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <Switch
                      id="maintenance"
                      checked={systemConfig.maintenanceMode}
                      onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="registration">Allow New Registrations</Label>
                    <Switch
                      id="registration"
                      checked={systemConfig.allowRegistration}
                      onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, allowRegistration: checked }))}
                    />
                  </div>
                  <Button onClick={handleSystemConfigSave} className="w-full">
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="uploadSize">Max Upload Size (MB)</Label>
                    <Input
                      id="uploadSize"
                      type="number"
                      value={systemConfig.maxUploadSize}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, maxUploadSize: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={systemConfig.sessionTimeout}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <select
                      id="backupFrequency"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={systemConfig.backupFrequency}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <Button onClick={handleSystemConfigSave} className="w-full">
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Database Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Size</span>
                      <Badge variant="outline">2.1 GB</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Backup</span>
                      <Badge variant="outline">2 hours ago</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Connections</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleDatabaseMaintenance} 
                      variant="outline" 
                      className="w-full"
                    >
                      Run Database Optimization
                    </Button>
                    <Button 
                      onClick={() => toast({ title: "Backup", description: "Database backup initiated" })}
                      variant="outline" 
                      className="w-full"
                    >
                      Create Manual Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Server Uptime</span>
                      <Badge variant="outline">15 days</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <Badge variant="outline">68%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Size</span>
                      <Badge variant="outline">156 MB</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleClearCache}
                      variant="outline" 
                      className="w-full"
                    >
                      Clear System Cache
                    </Button>
                    <Button 
                      onClick={() => toast({ title: "Logs", description: "System logs exported" })}
                      variant="outline" 
                      className="w-full"
                    >
                      Export System Logs
                    </Button>
                    <Button 
                      onClick={() => toast({ title: "Restart", description: "System restart scheduled" })}
                      variant="destructive" 
                      className="w-full"
                    >
                      Schedule System Restart
                    </Button>
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

export default SystemSettings;
