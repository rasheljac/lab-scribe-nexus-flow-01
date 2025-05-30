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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, X } from "lucide-react";
import { useExperimentIdeas, ExperimentIdea } from "@/hooks/useExperimentIdeas";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";

interface EditIdeaDialogProps {
  idea: ExperimentIdea;
}

const EditIdeaDialog = ({ idea }: EditIdeaDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: idea.title,
    description: idea.description || "",
    hypothesis: idea.hypothesis || "",
    methodology: idea.methodology || "",
    required_materials: idea.required_materials || "",
    expected_outcomes: idea.expected_outcomes || "",
    priority: idea.priority,
    category: idea.category,
    estimated_duration: idea.estimated_duration || "",
    budget_estimate: idea.budget_estimate || "",
    status: idea.status,
    tags: idea.tags || [],
  });

  const { updateIdea } = useExperimentIdeas();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Idea title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateIdea.mutateAsync({
        id: idea.id,
        ...formData,
      });
      toast({
        title: "Success",
        description: "Experiment idea updated successfully",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update experiment idea",
        variant: "destructive",
      });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Edit className="h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Experiment Idea</DialogTitle>
          <DialogDescription>
            Update your experimental planning idea and research concept.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
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
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Brief overview of the experimental idea..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <RichTextEditor
                  value={formData.hypothesis}
                  onChange={(value) => setFormData(prev => ({ ...prev, hypothesis: value }))}
                  placeholder="What do you expect to find or prove?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology">Methodology</Label>
                <RichTextEditor
                  value={formData.methodology}
                  onChange={(value) => setFormData(prev => ({ ...prev, methodology: value }))}
                  placeholder="How would you approach this experiment?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="required_materials">Required Materials</Label>
                <RichTextEditor
                  value={formData.required_materials}
                  onChange={(value) => setFormData(prev => ({ ...prev, required_materials: value }))}
                  placeholder="List equipment, chemicals, samples needed..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_outcomes">Expected Outcomes</Label>
                <RichTextEditor
                  value={formData.expected_outcomes}
                  onChange={(value) => setFormData(prev => ({ ...prev, expected_outcomes: value }))}
                  placeholder="What results do you anticipate?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
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

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brainstorming">Brainstorming</SelectItem>
                      <SelectItem value="researching">Researching</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Estimated Duration</Label>
                  <Input
                    id="estimated_duration"
                    value={formData.estimated_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                    placeholder="e.g., 2 weeks, 3 months"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_estimate">Budget Estimate</Label>
                  <Input
                    id="budget_estimate"
                    value={formData.budget_estimate}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_estimate: e.target.value }))}
                    placeholder="e.g., $500, $2000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={updateIdea.isPending} className="flex-1">
              {updateIdea.isPending ? "Updating..." : "Update Idea"}
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

export default EditIdeaDialog;
