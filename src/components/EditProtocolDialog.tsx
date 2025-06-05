
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Loader2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import { useProtocols, Protocol } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";

interface EditProtocolDialogProps {
  protocol: Protocol;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditProtocolDialog = ({ protocol, open, onOpenChange }: EditProtocolDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [protocolData, setProtocolData] = useState({
    title: protocol.title,
    description: protocol.description || "",
    content: protocol.content,
    category: protocol.category,
    is_template: protocol.is_template,
  });

  const { toast } = useToast();
  const { updateProtocol } = useProtocols();

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!protocolData.title.trim() || !protocolData.content.trim()) {
      toast({
        title: "Error",
        description: "Protocol title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProtocol.mutateAsync({
        id: protocol.id,
        title: protocolData.title,
        description: protocolData.description || null,
        content: protocolData.content,
        category: protocolData.category,
        is_template: protocolData.is_template,
      });
      toast({
        title: "Success",
        description: "Protocol updated successfully",
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update protocol",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      // Reset form data when opening
      setProtocolData({
        title: protocol.title,
        description: protocol.description || "",
        content: protocol.content,
        category: protocol.category,
        is_template: protocol.is_template,
      });
    }
  };

  return (
    <>
      {open === undefined && (
        <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Protocol</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={protocolData.title}
                  onChange={(e) => setProtocolData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter protocol title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={protocolData.description}
                  onChange={(e) => setProtocolData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the protocol..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={protocolData.category} onValueChange={(value) => setProtocolData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="preparation">Preparation</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_template_edit"
                  checked={protocolData.is_template}
                  onCheckedChange={(checked) => setProtocolData(prev => ({ ...prev, is_template: checked as boolean }))}
                />
                <label htmlFor="is_template_edit" className="text-sm font-medium">
                  Use as template for future protocols
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <RichTextEditor
                  value={protocolData.content}
                  onChange={(value) => setProtocolData(prev => ({ ...prev, content: value }))}
                  placeholder="Enter detailed protocol steps and instructions..."
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateProtocol.isPending} className="flex-1">
                  {updateProtocol.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Protocol
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProtocolDialog;
