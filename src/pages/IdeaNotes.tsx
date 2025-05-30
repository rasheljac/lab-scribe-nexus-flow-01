
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2,
  FileText,
  Calendar
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RichTextEditor from "@/components/RichTextEditor";
import EditIdeaNoteDialog from "@/components/EditIdeaNoteDialog";
import { useIdeaNotes } from "@/hooks/useIdeaNotes";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useToast } from "@/hooks/use-toast";

const IdeaNotes = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const { notes, isLoading, error, createNote, deleteNote } = useIdeaNotes(ideaId!);
  const { ideas } = useExperimentIdeas();
  
  const currentIdea = ideas.find(idea => idea.id === ideaId);

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note title",
        variant: "destructive",
      });
      return;
    }

    try {
      await createNote.mutateAsync({
        idea_id: ideaId!,
        title: newNoteTitle,
        content: newNoteContent,
      });
      
      setNewNoteTitle("");
      setNewNoteContent("");
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <p className="text-red-600">Error loading idea notes: {error.message}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/experiment-ideas")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Ideas
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentIdea?.title || "Idea Notes"}
                </h1>
                <p className="text-gray-600 mt-1">
                  Document your thoughts and research for this experiment idea
                </p>
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
                    <DialogDescription>
                      Add detailed notes and observations for this experiment idea.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Note Title</Label>
                      <Input
                        id="title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="Enter note title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <RichTextEditor
                        value={newNoteContent}
                        onChange={setNewNoteContent}
                        placeholder="Write your note content..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateNote}
                      disabled={createNote.isPending}
                    >
                      {createNote.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Note
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {currentIdea && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Idea Overview</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{currentIdea.category}</Badge>
                      <Badge variant="secondary">{currentIdea.status}</Badge>
                      <Badge variant={
                        currentIdea.priority === 'high' ? 'destructive' :
                        currentIdea.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {currentIdea.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentIdea.description && (
                    <div 
                      className="prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: currentIdea.description }}
                    />
                  )}
                  {currentIdea.hypothesis && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Hypothesis</h4>
                      <div 
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: currentIdea.hypothesis }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <EditIdeaNoteDialog note={note} ideaId={ideaId!} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
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
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
                        {note.updated_at !== note.created_at && (
                          <span>• Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardHeader>
                    {note.content && (
                      <CardContent>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: note.content }}
                        />
                      </CardContent>
                    )}
                  </Card>
                ))}
                {notes.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No notes found for this experiment idea. Create your first note to get started.
                    </p>
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

export default IdeaNotes;
