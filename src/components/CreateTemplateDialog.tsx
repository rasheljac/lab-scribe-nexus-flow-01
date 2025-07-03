
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
import { Plus } from "lucide-react";
import { useLabelTemplates } from "@/hooks/useLabelTemplates";

interface CreateTemplateDialogProps {
  onTemplateCreated?: () => void;
}

const CreateTemplateDialog = ({ onTemplateCreated }: CreateTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    size: "",
    width_mm: 60.0,
    height_mm: 40.0,
  });
  const { createTemplate } = useLabelTemplates();

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      return;
    }

    try {
      await createTemplate.mutateAsync({
        ...formData,
        is_default: false,
      });

      setOpen(false);
      setFormData({
        name: "",
        type: "",
        size: "",
        width_mm: 60.0,
        height_mm: 40.0,
      });
      onTemplateCreated?.();
    } catch (error) {
      console.error("Error creating template:", error);
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
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Label Template</DialogTitle>
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
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
