
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useToast } from "@/hooks/use-toast";

const CreateTeamMemberDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    department: "",
    phone: "",
    avatar: "",
    status: "active" as "active" | "inactive",
    join_date: "",
    expertise: [] as string[],
    current_projects: 0,
    experiments_completed: 0,
  });

  const { createTeamMember } = useTeamMembers();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTeamMember.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
      setIsOpen(false);
      setFormData({
        name: "",
        role: "",
        email: "",
        department: "",
        phone: "",
        avatar: "",
        status: "active",
        join_date: "",
        expertise: [],
        current_projects: 0,
        experiments_completed: 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpertiseChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    handleInputChange('expertise', skills);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your laboratory team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                placeholder="e.g., Research Scientist"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="e.g., Biology"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="join_date">Join Date</Label>
              <Input
                id="join_date"
                type="date"
                value={formData.join_date}
                onChange={(e) => handleInputChange("join_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise (comma-separated)</Label>
            <Input
              id="expertise"
              value={formData.expertise.join(', ')}
              onChange={(e) => handleExpertiseChange(e.target.value)}
              placeholder="e.g., Molecular Biology, PCR, Cell Culture"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_projects">Current Projects</Label>
              <Input
                id="current_projects"
                type="number"
                min="0"
                value={formData.current_projects}
                onChange={(e) => handleInputChange("current_projects", parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experiments_completed">Experiments Completed</Label>
              <Input
                id="experiments_completed"
                type="number"
                min="0"
                value={formData.experiments_completed}
                onChange={(e) => handleInputChange("experiments_completed", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createTeamMember.isPending} className="flex-1">
              {createTeamMember.isPending ? "Adding..." : "Add Member"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamMemberDialog;
