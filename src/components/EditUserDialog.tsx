
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useUsers, User } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";

interface EditUserDialogProps {
  user: User;
}

const EditUserDialog = ({ user }: EditUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    email: user.email,
    first_name: user.raw_user_meta_data?.first_name || '',
    last_name: user.raw_user_meta_data?.last_name || '',
  });

  const { updateUser } = useUsers();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUser.mutateAsync({
        id: user.id,
        userData: {
          email: userData.email,
          user_metadata: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      });
      
      setOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={userData.first_name}
              onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={userData.last_name}
              onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
