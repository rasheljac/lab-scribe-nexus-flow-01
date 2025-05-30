import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Users as UsersIcon, Trash2, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import EditUserDialog from "@/components/EditUserDialog";
import CreateUserDialog from "@/components/CreateUserDialog";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { users, isLoading, error, deleteUser } = useUsers();
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.raw_user_meta_data?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.raw_user_meta_data?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
      toast({
        title: "Success",
        description: "User profile deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "User deletion requires admin privileges",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <p className="text-red-600">Error loading users: {error.message}</p>
                <p className="text-gray-600 mt-2">Showing current authenticated user only.</p>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage user profile information</p>
              </div>
              <CreateUserDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <UsersIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-xl font-bold">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <UsersIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-xl font-bold">
                        {users.filter(u => u.email_confirmed_at).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <UsersIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recent Logins</p>
                      <p className="text-xl font-bold">
                        {users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.raw_user_meta_data?.avatar_url} />
                          <AvatarFallback>
                            {user.raw_user_meta_data?.first_name?.[0] || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {user.raw_user_meta_data?.first_name || user.raw_user_meta_data?.last_name 
                              ? `${user.raw_user_meta_data.first_name || ''} ${user.raw_user_meta_data.last_name || ''}`.trim()
                              : user.email}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <EditUserDialog user={user} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" disabled>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User Profile</AlertDialogTitle>
                                <AlertDialogDescription>
                                  User deletion requires admin privileges and server-side implementation.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge className={user.email_confirmed_at ? "bg-green-100 text-green-800 ml-2" : "bg-yellow-100 text-yellow-800 ml-2"}>
                            {user.email_confirmed_at ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Login:</span>
                          <span className="ml-2">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString() 
                              : "Never"}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredUsers.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;
