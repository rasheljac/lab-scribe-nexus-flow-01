
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2,
  StickyNote,
  Calendar
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EditNoteDialog from "@/components/EditNoteDialog";
import RichTextEditor from "@/components/RichTextEditor";
import { useExperiments } from "@/hooks/useExperiments";
import { useExperimentNotes } from "@/hooks/useExperimentNotes";
import { useToast } from "@/hooks/use-toast";

const ExperimentNotes = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const { experiments } = useExperiments();
  const { notes, isLoading, createNote, deleteNote } = useExperimentNotes(experimentId || "");

  const experiment = experiments.find(e => e.id === experimentId);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experimentId) return;

    try {
      await createNote.mutateAsync({
        experiment_id: experimentId,
        title: newNote.title,
        content: newNote.content,
      });
      setNewNote({ title: "", content: "" });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Note created successfully!",
      });
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({
        title: "Success",
        description: "Note deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/experiments")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Experiments
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {experiment?.title || "Experiment"} - Notes
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage notes and observations for this experiment
                  </p>
                </div>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateNote} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <RichTextEditor
                        value={newNote.content}
                        onChange={(value) => setNewNote({ ...newNote, content: value })}
                        placeholder="Enter your note content..."
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createNote.isPending}>
                        {createNote.isPending ? "Creating..." : "Create Note"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Notes List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {notes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <StickyNote className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <EditNoteDialog note={note} experimentId={experimentId || ""} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{note.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content || '' }}
                      />
                    </CardContent>
                  </Card>
                ))}
                {notes.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No notes found for this experiment.</p>
                    <Button 
                      className="mt-4 gap-2" 
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add First Note
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExperimentNotes;
