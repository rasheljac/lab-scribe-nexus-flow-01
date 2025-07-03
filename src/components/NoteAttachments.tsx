import { useState, useRef } from "react";
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
import { File, X, Download, Loader2 } from "lucide-react";
import { useExperimentNoteAttachments } from "@/hooks/useExperimentNoteAttachments";
import { useToast } from "@/hooks/use-toast";

interface NoteAttachmentsProps {
  noteId: string;
  compact?: boolean;
}

const NoteAttachments = ({ noteId, compact = false }: NoteAttachmentsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    attachments, 
    isLoading, 
    error, 
    uploadAttachment, 
    deleteAttachment, 
    downloadAttachment 
  } = useExperimentNoteAttachments(noteId);
  
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAttachment.mutateAsync({ file: selectedFile });
      toast({
        title: "Success",
        description: "Attachment uploaded successfully",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync(attachmentId);
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (attachmentId: string, filename: string) => {
    try {
      const response = await downloadAttachment.mutateAsync(attachmentId);
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response as any]));
      
      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Set the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up by revoking the URL object
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Attachment downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      });
    }
  };

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <File className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Note Attachments</DialogTitle>
            <DialogDescription>
              Manage attachments for this note.
            </DialogDescription>
          </DialogHeader>
          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="attachment">Add Attachment</Label>
              <Input
                type="file"
                id="attachment"
                className="hidden"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                {selectedFile ? `Selected: ${selectedFile.name}` : "Select File"}
              </Button>
              {selectedFile && (
                <Button variant="secondary" size="sm" onClick={handleUpload} disabled={uploadAttachment.isLoading}>
                  {uploadAttachment.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              )}
            </div>

            {/* Attachments List */}
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500">Error: {error.message}</p>
            ) : attachments.length === 0 ? (
              <p>No attachments yet.</p>
            ) : (
              <ul className="space-y-2">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between">
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownload(attachment.id, attachment.filename);
                      }}
                      className="hover:underline"
                    >
                      {attachment.filename}
                    </a>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(attachment.id)}
                        disabled={deleteAttachment.isLoading}
                      >
                        {deleteAttachment.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Attachments</h3>

      {/* Upload Section */}
      <div className="mb-4">
        <Label htmlFor="attachment">Add Attachment</Label>
        <Input
          type="file"
          id="attachment"
          className="hidden"
          onChange={handleFileSelect}
          ref={fileInputRef}
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          {selectedFile ? `Selected: ${selectedFile.name}` : "Select File"}
        </Button>
        {selectedFile && (
          <Button variant="secondary" size="sm" onClick={handleUpload} disabled={uploadAttachment.isLoading}>
            {uploadAttachment.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        )}
      </div>

      {/* Attachments List */}
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : attachments.length === 0 ? (
        <p>No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(attachment.id, attachment.filename);
                }}
                className="hover:underline"
              >
                {attachment.filename}
              </a>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deleteAttachment.isLoading}
                >
                  {deleteAttachment.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteAttachments;
