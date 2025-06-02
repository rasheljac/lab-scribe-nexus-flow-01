
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Upload, 
  Download,
  Trash2,
  Calendar,
  User,
  Beaker,
  Search
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useExperiments } from "@/hooks/useExperiments";
import { useExperimentNotes } from "@/hooks/useExperimentNotes";
import { useExperimentAttachments } from "@/hooks/useExperimentAttachments";
import { useToast } from "@/hooks/use-toast";

const ExperimentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { experiments } = useExperiments();
  const { notes, createNote, deleteNote } = useExperimentNotes(id || '');
  const { attachments, uploadAttachment, deleteAttachment, getAttachmentUrl } = useExperimentAttachments(id || '');
  const { toast } = useToast();
  
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const experiment = experiments.find(exp => exp.id === id);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (!experiment) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Experiment not found</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    
    try {
      await createNote.mutateAsync({
        experiment_id: experiment.id,
        title: newNote.title,
        content: newNote.content,
        folder_id: null,
      });
      setNewNote({ title: '', content: '' });
      setNoteDialogOpen(false);
      toast({
        title: "Success",
        description: "Note created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadAttachment.mutateAsync({ file, experimentId: experiment.id });
      setUploadDialogOpen(false);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
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
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{experiment.title}</h1>
                <p className="text-gray-600 mt-1">Experiment Details & Notes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Experiment Overview */}
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge className={
                        experiment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        experiment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {experiment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Progress</span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${experiment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{experiment.progress}%</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{experiment.researcher}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{experiment.start_date} - {experiment.end_date || "Ongoing"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{experiment.protocols} protocols, {experiment.samples} samples</span>
                      </div>
                    </div>
                    {experiment.description && (
                      <div>
                        <span className="text-sm font-medium">Description</span>
                        <p className="text-sm text-gray-600 mt-1">{experiment.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Notes and Attachments */}
              <div className="lg:col-span-3 space-y-6">
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

                {/* Notes Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Notes ({filteredNotes.length})
                      </CardTitle>
                      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Note
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Note</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="note-title">Title</Label>
                              <Input
                                id="note-title"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                placeholder="Note title"
                              />
                            </div>
                            <div>
                              <Label htmlFor="note-content">Content</Label>
                              <Textarea
                                id="note-content"
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                placeholder="Note content"
                                rows={6}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleCreateNote} disabled={createNote.isPending}>
                                {createNote.isPending ? "Creating..." : "Create Note"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredNotes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{note.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(note.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNote.mutate(note.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {filteredNotes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          {searchTerm ? "No notes found matching your criteria." : "No notes yet. Add your first note to get started."}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Attachments ({attachments.length})
                      </CardTitle>
                      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Upload File
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload File</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="file-upload">Select File</Label>
                              <Input
                                id="file-upload"
                                type="file"
                                onChange={handleFileUpload}
                                accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{attachment.filename}</p>
                              <p className="text-xs text-gray-500">
                                {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : ''} • 
                                {new Date(attachment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getAttachmentUrl(attachment.file_path), '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAttachment.mutate(attachment)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {attachments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No attachments yet. Upload files to get started.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExperimentDetails;
