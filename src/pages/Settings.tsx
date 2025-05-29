
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette,
  Save,
  Upload
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    experimentUpdates: true,
    taskReminders: true,
    inventoryAlerts: true,
    teamMessages: true,
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC-5",
    dateFormat: "MM/DD/YYYY",
    autoSave: true,
    dataRetention: "1year",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        department: user.user_metadata?.department || "",
        role: user.user_metadata?.role || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        email: profileData.email,
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          department: profileData.department,
          role: profileData.role,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handlePasswordUpdate = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleNotificationUpdate = () => {
    // Store notifications in local storage or user metadata
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast({
      title: "Success",
      description: "Notification preferences saved!",
    });
  };

  const handleSystemUpdate = () => {
    // Store system settings in local storage
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    toast({
      title: "Success",
      description: "System settings saved!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
              </div>
              <SettingsIcon className="h-8 w-8 text-gray-400" />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="system" className="gap-2">
                  <Database className="h-4 w-4" />
                  System
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-xl">
                          {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" className="gap-2">
                          <Upload className="h-4 w-4" />
                          Change Avatar
                        </Button>
                        <p className="text-sm text-gray-600 mt-2">
                          JPG, GIF or PNG. 1MB max.
                        </p>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select value={profileData.department} onValueChange={(value) => setProfileData(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                            <SelectItem value="Molecular Biology">Molecular Biology</SelectItem>
                            <SelectItem value="Pharmacology">Pharmacology</SelectItem>
                            <SelectItem value="Environmental Science">Environmental Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={profileData.role} onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Principal Investigator">Principal Investigator</SelectItem>
                            <SelectItem value="Senior Researcher">Senior Researcher</SelectItem>
                            <SelectItem value="Research Scientist">Research Scientist</SelectItem>
                            <SelectItem value="Laboratory Technician">Laboratory Technician</SelectItem>
                            <SelectItem value="Postdoctoral Fellow">Postdoctoral Fellow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleProfileUpdate} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications">Email Notifications</Label>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={notifications.emailNotifications}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushNotifications">Push Notifications</Label>
                          <p className="text-sm text-gray-600">Receive browser push notifications</p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={notifications.pushNotifications}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="experimentUpdates">Experiment Updates</Label>
                          <p className="text-sm text-gray-600">Notifications about experiment progress</p>
                        </div>
                        <Switch
                          id="experimentUpdates"
                          checked={notifications.experimentUpdates}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, experimentUpdates: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="taskReminders">Task Reminders</Label>
                          <p className="text-sm text-gray-600">Reminders for upcoming tasks</p>
                        </div>
                        <Switch
                          id="taskReminders"
                          checked={notifications.taskReminders}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskReminders: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                          <p className="text-sm text-gray-600">Low stock and inventory notifications</p>
                        </div>
                        <Switch
                          id="inventoryAlerts"
                          checked={notifications.inventoryAlerts}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, inventoryAlerts: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="teamMessages">Team Messages</Label>
                          <p className="text-sm text-gray-600">Notifications for team communications</p>
                        </div>
                        <Switch
                          id="teamMessages"
                          checked={notifications.teamMessages}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, teamMessages: checked }))}
                        />
                      </div>
                    </div>

                    <Button onClick={handleNotificationUpdate} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password & Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button>Update Password</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-gray-600">
                            Require email verification for login
                          </p>
                        </div>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                      <Button variant="outline" className="mt-4">
                        Configure 2FA
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • Today at 9:30 AM</p>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                        <Button variant="destructive" onClick={signOut}>
                          Sign Out All Devices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                            <SelectItem value="UTC-6">UTC-6 (Central)</SelectItem>
                            <SelectItem value="UTC-7">UTC-7 (Mountain)</SelectItem>
                            <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoSave">Auto-save</Label>
                        <p className="text-sm text-gray-600">Automatically save changes</p>
                      </div>
                      <Switch
                        id="autoSave"
                        checked={systemSettings.autoSave}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoSave: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention</Label>
                      <Select value={systemSettings.dataRetention} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dataRetention: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSystemUpdate} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Settings */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance & Theme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={systemSettings.theme} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, theme: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>Color Scheme</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {["blue", "green", "purple", "orange"].map((color) => (
                          <div key={color} className="text-center">
                            <div className={`w-12 h-12 rounded-lg mx-auto mb-2 bg-${color}-500 cursor-pointer hover:scale-105 transition-transform`}></div>
                            <span className="text-sm capitalize">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Apply Theme
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
