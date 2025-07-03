
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { useLabelTemplates } from "@/hooks/useLabelTemplates";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  type: string;
  size: string;
  width_mm: number;
  height_mm: number;
  is_default: boolean;
}

interface EditTemplateDialogProps {
  template: Template;
}

const EditTemplateDialog = ({ template }: EditTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: template.name,
    type: template.type,
    size: template.size,
    width_mm: template.width_mm,
    height_mm: template.height_mm,
  });
  const { updateTemplate } = useLabelTemplates();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      return;
    }

    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        ...formData,
      });

      setOpen(false);
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const updateSize = () => {
    const widthInches = (formData.width_mm / 25.4).toFixed(1);
    const heightInches = (formData.height_mm / 25.4).toFixed(1);
    setFormData(prev => ({
      ...prev,
      size: `${widthInches}x${heightInches} inch`
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Label Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sample">Sample</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="chemical">Chemical</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (mm)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width_mm}
                onChange={(e) => {
                  const width = parseFloat(e.target.value) || 60.0;
                  setFormData(prev => ({ ...prev, width_mm: width }));
                  setTimeout(updateSize, 0);
                }}
                min="10"
                max="200"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (mm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height_mm}
                onChange={(e) => {
                  const height = parseFloat(e.target.value) || 40.0;
                  setFormData(prev => ({ ...prev, height_mm: height }));
                  setTimeout(updateSize, 0);
                }}
                min="10"
                max="200"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Size Display</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
              placeholder="e.g., 2x1 inch"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || !formData.type}>
            Update Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTemplateDialog;
