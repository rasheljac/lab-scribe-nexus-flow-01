
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Search, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EditNoteDialog from "@/components/EditNoteDialog";
import RichTextEditor from "@/components/RichTextEditor";
import { useExperimentNotes } from "@/hooks/useExperimentNotes";
import { useExperiments } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";

const ExperimentNotes = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    title: "",
    content: "",
  });
  
  const { toast } = useToast();
  const { notes, isLoading, error, createNote, deleteNote } = useExperimentNotes(experimentId || "");
  const { experiments } = useExperiments();
  
  const experiment = experiments.find(exp => exp.id === experimentId);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNoteData.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createNote.mutateAsync({
        experiment_id: experimentId!,
        title: newNoteData.title,
        content: newNoteData.content,
        folder_id: null,
      });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      setIsCreateOpen(false);
      setNewNoteData({ title: "", content: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast({
        title: "Success",
        description: `Note "${noteTitle}" deleted successfully`,
      });
    } catch (error) {
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
                <p className="text-red-600">Error loading notes: {error.message}</p>
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
                    {notes.length} notes for this experiment
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{note.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <EditNoteDialog note={note} experimentId={experimentId!} />
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
                                  onClick={() => handleDeleteNote(note.id, note.title)}
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
                {filteredNotes.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? "No notes found matching your criteria." : "No notes found for this experiment."}
                    </p>
                    <Button 
                      className="mt-4 gap-2" 
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create First Note
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Note Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Note</h2>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={newNoteData.title}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter note title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <RichTextEditor
                  value={newNoteData.content}
                  onChange={(value) => setNewNoteData(prev => ({ ...prev, content: value }))}
                  placeholder="Enter note content..."
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createNote.isPending} className="flex-1">
                  {createNote.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Note
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentNotes;
