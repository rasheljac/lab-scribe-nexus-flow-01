
import { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
import { useExperimentNotes, ExperimentNote } from "@/hooks/useExperimentNotes";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";

interface EditNoteDialogProps {
  note: ExperimentNote;
  experimentId: string;
}

const EditNoteDialog = ({ note, experimentId }: EditNoteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Convert plain text to HTML if needed
  const getInitialContent = (content: string | null) => {
    console.log("Processing content:", content);
    
    if (!content) {
      console.log("No content, returning empty string");
      return "";
    }
    
    // Check if content is already HTML (contains HTML tags)
    const hasHtmlTags = /<[^>]*>/g.test(content);
    console.log("Has HTML tags:", hasHtmlTags);
    
    if (hasHtmlTags) {
      console.log("Returning HTML content as-is");
      return content;
    }
    
    // Convert plain text to HTML by wrapping in paragraphs and handling line breaks
    const htmlContent = content
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => `<p>${line}</p>`)
      .join('');
    
    console.log("Converted to HTML:", htmlContent);
    return htmlContent;
  };

  const [formData, setFormData] = useState({
    title: note.title,
    content: getInitialContent(note.content),
  });

  const { updateNote } = useExperimentNotes(experimentId);
  const { toast } = useToast();

  // Reset form data when dialog opens or note changes
  useEffect(() => {
    if (isOpen) {
      const initialContent = getInitialContent(note.content);
      console.log("Dialog opened, resetting content:", initialContent);
      setFormData({
        title: note.title,
        content: initialContent,
      });
    }
  }, [isOpen, note.id, note.content, note.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting form data:", formData);
      await updateNote.mutateAsync({
        id: note.id,
        ...formData,
      });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    console.log("Dialog open change:", open);
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setFormData({
        title: note.title,
        content: getInitialContent(note.content),
      });
    }
  };

  const handleContentChange = (value: string) => {
    console.log("Content change received:", value);
    setFormData(prev => ({ ...prev, content: value }));
  };

  console.log("Current formData content:", formData.content);
  console.log("Note content:", note.content);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Update note title and content.
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
            <Label htmlFor="content">Content</Label>
            <div className="border rounded-md">
              {isOpen && (
                <RichTextEditor
                  key={`editor-${note.id}-${isOpen}`}
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Enter your note content..."
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={updateNote.isPending} className="flex-1">
              {updateNote.isPending ? "Updating..." : "Update Note"}
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

export default EditNoteDialog;
