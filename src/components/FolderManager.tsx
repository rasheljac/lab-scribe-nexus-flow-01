
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FolderPlus, Folder, Edit, Trash2, Save, Loader2 } from "lucide-react";
import { useFolders } from "@/hooks/useFolders";
import { useToast } from "@/hooks/use-toast";

interface FolderManagerProps {
  type: 'experiment' | 'note';
  onFolderSelect?: (folderId: string | null) => void;
  selectedFolderId?: string | null;
}

const FolderManager = ({ type, onFolderSelect, selectedFolderId }: FolderManagerProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string>("");
  
  const { folders, createFolder, updateFolder, deleteFolder } = useFolders(type);
  const { toast } = useToast();

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createFolder.mutateAsync({
        name: folderName,
        type,
        parent_id: parentFolderId || null,
      });
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
      setIsCreateOpen(false);
      setFolderName("");
      setParentFolderId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFolder = async (folderId: string) => {
    if (!folderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateFolder.mutateAsync({
        id: folderId,
        name: folderName,
      });
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
      setEditingFolder(null);
      setFolderName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder.mutateAsync(folderId);
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const startEdit = (folder: any) => {
    setEditingFolder(folder.id);
    setFolderName(folder.name);
  };

  const cancelEdit = () => {
    setEditingFolder(null);
    setFolderName("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Folders</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your {type}s.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Folder Name *</Label>
                <Input
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentFolder">Parent Folder (optional)</Label>
                <Select value={parentFolderId} onValueChange={setParentFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (root level)</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createFolder.isPending} className="flex-1">
                  {createFolder.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Folder
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Folder List */}
      <div className="space-y-2">
        {onFolderSelect && (
          <Button
            variant={selectedFolderId === null ? "default" : "outline"}
            size="sm"
            onClick={() => onFolderSelect(null)}
            className="w-full justify-start gap-2"
          >
            <Folder className="h-4 w-4" />
            All {type}s
          </Button>
        )}
        
        {folders.map((folder) => (
          <div key={folder.id} className="flex items-center gap-2 p-2 border rounded-lg">
            {editingFolder === folder.id ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdateFolder(folder.id)}
                  disabled={updateFolder.isPending}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant={selectedFolderId === folder.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onFolderSelect?.(folder.id)}
                  className="flex-1 justify-start gap-2"
                >
                  <Folder className="h-4 w-4" />
                  {folder.name}
                </Button>
                <Button size="sm" variant="outline" onClick={() => startEdit(folder)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{folder.name}"? This action cannot be undone.
                        Items in this folder will not be deleted, but will be moved to the root level.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        ))}
        
        {folders.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No folders created yet
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderManager;
