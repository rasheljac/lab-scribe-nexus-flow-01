
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Database, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  AlertTriangle,
  Users,
  Server
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

interface PageVisibilitySettings {
  [key: string]: {
    enabled: boolean;
    label: string;
    description: string;
  };
}

interface SystemConfig {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  backupRetention: number;
  logLevel: string;
  emailNotifications: boolean;
  systemAlerts: boolean;
}

const SystemSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const [pageVisibility, setPageVisibility] = useState<PageVisibilitySettings>({
    experiments: {
      enabled: true,
      label: "Experiments",
      description: "Manage laboratory experiments and protocols"
    },
    projects: {
      enabled: true,
      label: "Projects",
      description: "Organize experiments into projects"
    },
    calendar: {
      enabled: true,
      label: "Calendar",
      description: "Schedule and track events"
    },
    tasks: {
      enabled: true,
      label: "Tasks",
      description: "Task management and assignment"
    },
    analytics: {
      enabled: true,
      label: "Analytics",
      description: "Data analysis and reporting dashboard"
    },
    reports: {
      enabled: true,
      label: "Reports",
      description: "Generate and export reports"
    },
    inventory: {
      enabled: true,
      label: "Inventory",
      description: "Track laboratory supplies and equipment"
    },
    labels: {
      enabled: true,
      label: "Label Printer",
      description: "Design and print laboratory labels"
    },
    orders: {
      enabled: true,
      label: "Order Portal",
      description: "Manage supply orders and purchases"
    },
    messages: {
      enabled: true,
      label: "Messages",
      description: "Internal messaging system"
    },
    videoChat: {
      enabled: true,
      label: "Video Chat",
      description: "Video conferencing capabilities"
    },
    team: {
      enabled: true,
      label: "Team",
      description: "Team member management"
    }
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: 50, // MB
    sessionTimeout: 60, // minutes
    backupRetention: 30, // days
    logLevel: "info",
    emailNotifications: true,
    systemAlerts: true,
  });

  const [databaseConfig, setDatabaseConfig] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    compressionEnabled: true,
    encryptionEnabled: true,
    connectionPoolSize: 20,
    queryTimeout: 30000, // milliseconds
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: true,
    requireTwoFactor: false,
    sessionSecurity: "high",
    ipWhitelist: "",
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedPageVisibility = localStorage.getItem('pageVisibility');
    const savedSystemConfig = localStorage.getItem('systemConfig');
    const savedDatabaseConfig = localStorage.getItem('databaseConfig');
    const savedSecuritySettings = localStorage.getItem('securitySettings');

    if (savedPageVisibility) {
      setPageVisibility(JSON.parse(savedPageVisibility));
    }
    if (savedSystemConfig) {
      setSystemConfig(JSON.parse(savedSystemConfig));
    }
    if (savedDatabaseConfig) {
      setDatabaseConfig(JSON.parse(savedDatabaseConfig));
    }
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings));
    }
  }, []);

  const handlePageVisibilityChange = (pageKey: string, enabled: boolean) => {
    setPageVisibility(prev => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        enabled
      }
    }));
  };

  const handleSystemConfigChange = (key: keyof SystemConfig, value: any) => {
    setSystemConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDatabaseConfigChange = (key: string, value: any) => {
    setDatabaseConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecuritySettingsChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('pageVisibility', JSON.stringify(pageVisibility));
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
    localStorage.setItem('databaseConfig', JSON.stringify(databaseConfig));
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));

    toast({
      title: "Success",
      description: "System settings saved successfully",
    });
  };

  const resetToDefaults = () => {
    localStorage.removeItem('pageVisibility');
    localStorage.removeItem('systemConfig');
    localStorage.removeItem('databaseConfig');
    localStorage.removeItem('securitySettings');
    
    // Reset to default values
    window.location.reload();
    
    toast({
      title: "Success",
      description: "Settings reset to defaults",
    });
  };

  const runSystemDiagnostics = () => {
    toast({
      title: "Diagnostics Running",
      description: "System diagnostics initiated...",
    });

    // Simulate diagnostics
    setTimeout(() => {
      toast({
        title: "Diagnostics Complete",
        description: "All systems operational",
      });
    }, 2000);
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetToDefaults}>
                  Reset to Defaults
                </Button>
                <Button onClick={saveSettings} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general" className="gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="pages" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Page Visibility
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="gap-2">
                  <Server className="h-4 w-4" />
                  Maintenance
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Maintenance Mode</Label>
                            <p className="text-sm text-gray-600">Temporarily disable system access</p>
                          </div>
                          <Switch
                            checked={systemConfig.maintenanceMode}
                            onCheckedChange={(checked) => handleSystemConfigChange('maintenanceMode', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Registration</Label>
                            <p className="text-sm text-gray-600">Allow new user registrations</p>
                          </div>
                          <Switch
                            checked={systemConfig.allowRegistration}
                            onCheckedChange={(checked) => handleSystemConfigChange('allowRegistration', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-600">Send system email notifications</p>
                          </div>
                          <Switch
                            checked={systemConfig.emailNotifications}
                            onCheckedChange={(checked) => handleSystemConfigChange('emailNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>System Alerts</Label>
                            <p className="text-sm text-gray-600">Enable system alert notifications</p>
                          </div>
                          <Switch
                            checked={systemConfig.systemAlerts}
                            onCheckedChange={(checked) => handleSystemConfigChange('systemAlerts', checked)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                          <Input
                            id="maxFileSize"
                            type="number"
                            value={systemConfig.maxFileSize}
                            onChange={(e) => handleSystemConfigChange('maxFileSize', parseInt(e.target.value))}
                            min="1"
                            max="1000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            value={systemConfig.sessionTimeout}
                            onChange={(e) => handleSystemConfigChange('sessionTimeout', parseInt(e.target.value))}
                            min="5"
                            max="480"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                          <Input
                            id="backupRetention"
                            type="number"
                            value={systemConfig.backupRetention}
                            onChange={(e) => handleSystemConfigChange('backupRetention', parseInt(e.target.value))}
                            min="1"
                            max="365"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="logLevel">Log Level</Label>
                          <Select 
                            value={systemConfig.logLevel} 
                            onValueChange={(value) => handleSystemConfigChange('logLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debug">Debug</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Page Visibility Settings */}
              <TabsContent value="pages">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Visibility Control</CardTitle>
                    <p className="text-sm text-gray-600">
                      Control which pages are visible to users. Disabled pages will not appear in navigation.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(pageVisibility).map(([key, config]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {config.enabled ? (
                              <Eye className="h-5 w-5 text-green-600" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {config.label}
                                <Badge variant={config.enabled ? "default" : "secondary"}>
                                  {config.enabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{config.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => handlePageVisibilityChange(key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Database Settings */}
              <TabsContent value="database">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Database Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Auto Backup</Label>
                              <p className="text-sm text-gray-600">Automatic database backups</p>
                            </div>
                            <Switch
                              checked={databaseConfig.autoBackup}
                              onCheckedChange={(checked) => handleDatabaseConfigChange('autoBackup', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Compression</Label>
                              <p className="text-sm text-gray-600">Enable backup compression</p>
                            </div>
                            <Switch
                              checked={databaseConfig.compressionEnabled}
                              onCheckedChange={(checked) => handleDatabaseConfigChange('compressionEnabled', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Encryption</Label>
                              <p className="text-sm text-gray-600">Encrypt database backups</p>
                            </div>
                            <Switch
                              checked={databaseConfig.encryptionEnabled}
                              onCheckedChange={(checked) => handleDatabaseConfigChange('encryptionEnabled', checked)}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="backupFrequency">Backup Frequency</Label>
                            <Select 
                              value={databaseConfig.backupFrequency} 
                              onValueChange={(value) => handleDatabaseConfigChange('backupFrequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="connectionPoolSize">Connection Pool Size</Label>
                            <Input
                              id="connectionPoolSize"
                              type="number"
                              value={databaseConfig.connectionPoolSize}
                              onChange={(e) => handleDatabaseConfigChange('connectionPoolSize', parseInt(e.target.value))}
                              min="1"
                              max="100"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="queryTimeout">Query Timeout (ms)</Label>
                            <Input
                              id="queryTimeout"
                              type="number"
                              value={databaseConfig.queryTimeout}
                              onChange={(e) => handleDatabaseConfigChange('queryTimeout', parseInt(e.target.value))}
                              min="1000"
                              max="300000"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Strong Passwords</Label>
                            <p className="text-sm text-gray-600">Enforce strong password requirements</p>
                          </div>
                          <Switch
                            checked={securitySettings.enforceStrongPasswords}
                            onCheckedChange={(checked) => handleSecuritySettingsChange('enforceStrongPasswords', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-600">Require 2FA for all users</p>
                          </div>
                          <Switch
                            checked={securitySettings.requireTwoFactor}
                            onCheckedChange={(checked) => handleSecuritySettingsChange('requireTwoFactor', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sessionSecurity">Session Security Level</Label>
                          <Select 
                            value={securitySettings.sessionSecurity} 
                            onValueChange={(value) => handleSecuritySettingsChange('sessionSecurity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                          <Input
                            id="maxLoginAttempts"
                            type="number"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => handleSecuritySettingsChange('maxLoginAttempts', parseInt(e.target.value))}
                            min="1"
                            max="10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                          <Input
                            id="lockoutDuration"
                            type="number"
                            value={securitySettings.lockoutDuration}
                            onChange={(e) => handleSecuritySettingsChange('lockoutDuration', parseInt(e.target.value))}
                            min="1"
                            max="1440"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                          <Textarea
                            id="ipWhitelist"
                            value={securitySettings.ipWhitelist}
                            onChange={(e) => handleSecuritySettingsChange('ipWhitelist', e.target.value)}
                            placeholder="Enter IP addresses, one per line"
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Maintenance Settings */}
              <TabsContent value="maintenance">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Run System Diagnostics</h3>
                          <p className="text-sm text-gray-600">Check system health and performance</p>
                        </div>
                        <Button onClick={runSystemDiagnostics}>
                          Run Diagnostics
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Clear System Cache</h3>
                          <p className="text-sm text-gray-600">Clear application cache and temporary files</p>
                        </div>
                        <Button variant="outline">
                          Clear Cache
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Export System Logs</h3>
                          <p className="text-sm text-gray-600">Download system logs for analysis</p>
                        </div>
                        <Button variant="outline">
                          Export Logs
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                        <div>
                          <h3 className="font-medium text-red-800">Reset System Settings</h3>
                          <p className="text-sm text-red-600">Reset all settings to factory defaults</p>
                        </div>
                        <Button variant="destructive" onClick={resetToDefaults}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Reset All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">System Version:</span>
                          <span className="ml-2">v2.1.0</span>
                        </div>
                        <div>
                          <span className="font-medium">Last Updated:</span>
                          <span className="ml-2">2024-01-25</span>
                        </div>
                        <div>
                          <span className="font-medium">Database Version:</span>
                          <span className="ml-2">PostgreSQL 15.0</span>
                        </div>
                        <div>
                          <span className="font-medium">Uptime:</span>
                          <span className="ml-2">7 days, 14 hours</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemSettings;
