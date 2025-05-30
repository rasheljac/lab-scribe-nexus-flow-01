
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
import { Badge } from "@/components/ui/badge";
import { Plus, X, Lightbulb } from "lucide-react";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useToast } from "@/hooks/use-toast";

interface CreateIdeaDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateIdeaDialog = ({ open, onOpenChange }: CreateIdeaDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hypothesis: "",
    methodology: "",
    required_materials: "",
    expected_outcomes: "",
    priority: "medium" as const,
    category: "biochemistry",
    estimated_duration: "",
    budget_estimate: "",
    status: "brainstorming" as const,
    tags: [] as string[],
  });

  const { createIdea } = useExperimentIdeas();
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
      await createIdea.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Experiment idea created successfully",
      });
      setFormData({
        title: "",
        description: "",
        hypothesis: "",
        methodology: "",
        required_materials: "",
        expected_outcomes: "",
        priority: "medium",
        category: "biochemistry",
        estimated_duration: "",
        budget_estimate: "",
        status: "brainstorming",
        tags: [],
      });
      setTagInput("");
      const shouldClose = onOpenChange ? true : true;
      if (shouldClose) {
        onOpenChange?.(false);
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create experiment idea",
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

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Lightbulb className="h-4 w-4" />
            New Idea
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Experiment Idea</DialogTitle>
          <DialogDescription>
            Document your experimental planning ideas and research concepts.
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
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief overview of the experimental idea..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  value={formData.hypothesis}
                  onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
                  rows={2}
                  placeholder="What do you expect to find or prove?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodology">Methodology</Label>
                <Textarea
                  id="methodology"
                  value={formData.methodology}
                  onChange={(e) => setFormData(prev => ({ ...prev, methodology: e.target.value }))}
                  rows={3}
                  placeholder="How would you approach this experiment?"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="required_materials">Required Materials</Label>
                <Textarea
                  id="required_materials"
                  value={formData.required_materials}
                  onChange={(e) => setFormData(prev => ({ ...prev, required_materials: e.target.value }))}
                  rows={3}
                  placeholder="List equipment, chemicals, samples needed..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_outcomes">Expected Outcomes</Label>
                <Textarea
                  id="expected_outcomes"
                  value={formData.expected_outcomes}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_outcomes: e.target.value }))}
                  rows={2}
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
            <Button type="submit" disabled={createIdea.isPending} className="flex-1">
              {createIdea.isPending ? "Creating..." : "Create Idea"}
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

export default CreateIdeaDialog;
