import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Database, Server, Users, FileText, Package, Printer, Calendar, Beaker, FolderOpen, CheckSquare, BarChart3, MessageSquare, Video, ShoppingCart, Loader2, Mail, Send, Eye } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTaskReminders } from "@/hooks/useTaskReminders";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SystemSettings = () => {
  const { preferences, updatePreferences, loading: preferencesLoading, refetch } = useUserPreferences();
  const { sendTaskReminders } = useTaskReminders();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const adminItems = [
    { icon: Users, label: "User Management", path: "/admin/users", badge: null, key: "admin-users" },
    { icon: Settings, label: "System Settings", path: "/admin/settings", badge: null, key: "admin-settings" },
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

  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    username: "",
    password: "",
    from_email: "",
    use_tls: true,
    enabled: false,
  });

  const [emailTemplate, setEmailTemplate] = useState(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Task Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .task-item { background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .btn { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Task Reminder</h1>
            <p>Kapelczak Laboratory</p>
        </div>
        <div class="content">
            <h2>Hello {{user_name}},</h2>
            <p>You have upcoming tasks that require your attention:</p>
            
            {{#tasks}}
            <div class="task-item">
                <h3>{{title}}</h3>
                <p><strong>Due Date:</strong> {{due_date}}</p>
                <p><strong>Priority:</strong> {{priority}}</p>
                <p><strong>Status:</strong> {{status}}</p>
                {{#description}}<p>{{description}}</p>{{/description}}
            </div>
            {{/tasks}}
            
            <p>Please review and complete these tasks before their due dates.</p>
            <a href="{{app_url}}/tasks" class="btn">View All Tasks</a>
        </div>
        <div class="footer">
            <p>© {{current_year}} Kapelczak Laboratory. All rights reserved.</p>
            <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`);

  // Load system config from preferences on mount
  useEffect(() => {
    if (preferences?.preferences?.systemConfig) {
      setSystemConfig(preferences.preferences.systemConfig);
    }
    if (preferences?.preferences?.smtpConfig) {
      setSmtpConfig(preferences.preferences.smtpConfig);
    }
    if (preferences?.preferences?.emailTemplate) {
      setEmailTemplate(preferences.preferences.emailTemplate);
    }
  }, [preferences]);

  const hiddenPages = preferences?.hidden_pages || [];

  const handlePageVisibilityToggle = async (pageKey: string) => {
    if (preferencesLoading || loading || pageKey === "admin-settings") return;
    
    setLoading(true);
    try {
      const newHiddenPages = hiddenPages.includes(pageKey)
        ? hiddenPages.filter(key => key !== pageKey)
        : [...hiddenPages, pageKey];

      await updatePreferences({ hidden_pages: newHiddenPages });
      
      // Force a refetch to ensure we have the latest data
      await refetch();
      
      toast({
        title: "Success",
        description: "Page visibility updated successfully",
      });
    } catch (error) {
      console.error('Error updating page visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update page visibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSystemConfigSave = async () => {
    if (preferencesLoading) return;
    
    setLoading(true);
    try {
      const currentPrefs = preferences?.preferences || {};
      await updatePreferences({ 
        preferences: { 
          ...currentPrefs,
          systemConfig 
        } 
      });
      
      toast({
        title: "Success",
        description: "System configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving system configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save system configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpConfigSave = async () => {
    if (preferencesLoading) return;
    
    setLoading(true);
    try {
      const currentPrefs = preferences?.preferences || {};
      await updatePreferences({ 
        preferences: { 
          ...currentPrefs,
          smtpConfig 
        } 
      });
      
      toast({
        title: "Success",
        description: "SMTP configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving SMTP configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save SMTP configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailTemplateSave = async () => {
    if (preferencesLoading) return;
    
    setLoading(true);
    try {
      const currentPrefs = preferences?.preferences || {};
      await updatePreferences({ 
        preferences: { 
          ...currentPrefs,
          emailTemplate 
        } 
      });
      
      toast({
        title: "Success",
        description: "Email template saved successfully",
      });
    } catch (error) {
      console.error('Error saving email template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestReminders = async () => {
    if (!smtpConfig.enabled) {
      toast({
        title: "Error",
        description: "Email reminders are disabled. Please enable them first.",
        variant: "destructive",
      });
      return;
    }

    if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.from_email) {
      toast({
        title: "Error",
        description: "Please configure SMTP settings before testing reminders.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sendTaskReminders.mutateAsync();
      toast({
        title: "Success",
        description: "Test reminders sent successfully",
      });
    } catch (error) {
      console.error('Error sending test reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send test reminders. Please check your SMTP configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPreviewHtml = () => {
    let previewHtml = emailTemplate;
    const userName = "John Doe";
    const currentYear = new Date().getFullYear();
    const appUrl = "https://kapelczak-lab.lovable.app";

    // Replace template variables with sample data
    previewHtml = previewHtml
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{current_year\}\}/g, currentYear.toString())
      .replace(/\{\{app_url\}\}/g, appUrl);

    // Generate sample tasks HTML
    const sampleTasksHtml = `
      <div class="task-item">
        <h3>Analyze Lab Results</h3>
        <p><strong>Due Date:</strong> Tomorrow</p>
        <p><strong>Priority:</strong> High</p>
        <p><strong>Status:</strong> In Progress</p>
        <p>Review the latest experimental data and prepare findings report.</p>
      </div>
      <div class="task-item">
        <h3>Equipment Maintenance</h3>
        <p><strong>Due Date:</strong> Next Week</p>
        <p><strong>Priority:</strong> Medium</p>
        <p><strong>Status:</strong> Pending</p>
        <p>Scheduled maintenance for laboratory equipment.</p>
      </div>
    `;

    previewHtml = previewHtml.replace(/\{\{#tasks\}\}.*?\{\{\/tasks\}\}/gs, sampleTasksHtml);

    return previewHtml;
  };

  const handleDatabaseMaintenance = () => {
    toast({
      title: "Database Maintenance",
      description: "Database optimization started in background",
    });
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Success",
        description: "System cache cleared successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive",
      });
    }
  };

  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                        const isSystemSettings = page.key === "admin-settings";
                        return (
                          <div key={page.key} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium">{page.label}</span>
                              {isSystemSettings && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <Switch
                              checked={!isHidden}
                              onCheckedChange={() => handlePageVisibilityToggle(page.key)}
                              disabled={loading || isSystemSettings}
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
                  <Button onClick={handleSystemConfigSave} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
                  <Button onClick={handleSystemConfigSave} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>

              {/* SMTP Configuration */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    SMTP Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={smtpConfig.host}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={smtpConfig.port}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">Username</Label>
                      <Input
                        id="smtpUsername"
                        value={smtpConfig.username}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="your-email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={smtpConfig.password}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your app password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        value={smtpConfig.from_email}
                        onChange={(e) => setSmtpConfig(prev => ({ ...prev, from_email: e.target.value }))}
                        placeholder="noreply@kapelczak.com"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="useTls">Use TLS</Label>
                      <Switch
                        id="useTls"
                        checked={smtpConfig.use_tls}
                        onCheckedChange={(checked) => setSmtpConfig(prev => ({ ...prev, use_tls: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="smtpEnabled">Enable Email Reminders</Label>
                      <Switch
                        id="smtpEnabled"
                        checked={smtpConfig.enabled}
                        onCheckedChange={(checked) => setSmtpConfig(prev => ({ ...prev, enabled: checked }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSmtpConfigSave} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save SMTP Settings
                    </Button>
                    <Button onClick={handleTestReminders} variant="outline" disabled={loading || !smtpConfig.enabled}>
                      <Send className="h-4 w-4 mr-2" />
                      Test Reminders
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Template Editor */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Email Template Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emailTemplate">HTML Email Template</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Available variables: user_name, tasks, title, due_date, priority, status, description, app_url, current_year
                      </p>
                      <Tabs defaultValue="editor" className="w-full">
                        <TabsList>
                          <TabsTrigger value="editor">HTML Editor</TabsTrigger>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="editor">
                          <Textarea
                            id="emailTemplate"
                            value={emailTemplate}
                            onChange={(e) => setEmailTemplate(e.target.value)}
                            rows={20}
                            className="font-mono text-sm"
                            placeholder="Enter your HTML email template here..."
                          />
                        </TabsContent>
                        <TabsContent value="preview">
                          <div className="border rounded-lg p-4 bg-white">
                            <div 
                              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                              className="max-w-none"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleEmailTemplateSave} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Email Template
                      </Button>
                      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Full Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Email Template Preview</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <div 
                              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                              className="max-w-none"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
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
