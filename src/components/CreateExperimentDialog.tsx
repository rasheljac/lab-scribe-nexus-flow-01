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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useExperiments } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CreateExperimentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectId?: string; // Add projectId prop to link experiments to projects
  folderId?: string | null; // Add folderId prop
}

const CreateExperimentDialog = ({ open, onOpenChange, projectId, folderId = null }: CreateExperimentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "biochemistry",
    researcher: "",
    start_date: "",
    end_date: "",
  });

  const { createExperiment } = useExperiments();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Experiment title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createExperiment.mutateAsync({
        ...formData,
        researcher: formData.researcher || user?.email?.split('@')[0] || 'Unknown',
        status: "planning",
        progress: 0,
        protocols: 0,
        samples: 0,
        project_id: projectId || null, // Use the provided projectId
        folder_id: folderId, // Include folder_id
      });
      toast({
        title: "Success",
        description: "Experiment created successfully",
      });
      setFormData({
        title: "",
        description: "",
        category: "biochemistry",
        researcher: "",
        start_date: "",
        end_date: "",
      });
      const shouldClose = onOpenChange ? true : true;
      if (shouldClose) {
        onOpenChange?.(false);
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create experiment",
        variant: "destructive",
      });
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Experiment
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Experiment</DialogTitle>
          <DialogDescription>
            Set up a new laboratory experiment with all the necessary details.
            {projectId && " This experiment will be linked to the current project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="molecular-biology">Molecular Biology</SelectItem>
                  <SelectItem value="cell-biology">Cell Biology</SelectItem>
                  <SelectItem value="genetics">Genetics</SelectItem>
                  <SelectItem value="microbiology">Microbiology</SelectItem>
                  <SelectItem value="immunology">Immunology</SelectItem>
                  <SelectItem value="neuroscience">Neuroscience</SelectItem>
                  <SelectItem value="pharmacology">Pharmacology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="researcher">Researcher</Label>
              <Input
                id="researcher"
                value={formData.researcher}
                onChange={(e) => setFormData(prev => ({ ...prev, researcher: e.target.value }))}
                placeholder={user?.email?.split('@')[0] || 'Your name'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createExperiment.isPending} className="flex-1">
              {createExperiment.isPending ? "Creating..." : "Create Experiment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExperimentDialog;
