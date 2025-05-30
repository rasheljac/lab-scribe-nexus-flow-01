
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
import { Edit3, Save, Loader2 } from "lucide-react";
import { useIdeaNotes, IdeaNote } from "@/hooks/useIdeaNotes";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";

interface EditIdeaNoteDialogProps {
  note: IdeaNote;
  ideaId: string;
}

const EditIdeaNoteDialog = ({ note, ideaId }: EditIdeaNoteDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: note.title,
    content: note.content || "",
  });

  const { updateNote } = useIdeaNotes(ideaId);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit3 className="h-4 w-4" />
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
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Enter your note content..."
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={updateNote.isPending} className="flex-1">
              {updateNote.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
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

export default EditIdeaNoteDialog;
