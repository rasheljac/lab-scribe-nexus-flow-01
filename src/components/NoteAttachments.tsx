
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Paperclip, Upload, Download, Trash2, FileText, Image, File, Loader2 } from "lucide-react";
import { useExperimentNoteAttachments } from "@/hooks/useExperimentNoteAttachments";
import { useToast } from "@/hooks/use-toast";

interface NoteAttachmentsProps {
  noteId: string;
}

const NoteAttachments = ({ noteId }: NoteAttachmentsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { attachments, uploadAttachment, deleteAttachment, downloadAttachment } = useExperimentNoteAttachments(noteId);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Error",
            description: `File ${file.name} is too large. Maximum size is 50MB.`,
            variant: "destructive",
          });
          continue;
        }

        await uploadAttachment.mutateAsync({ file, noteId });
      }
      
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file(s)",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      await downloadAttachment(attachment);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attachment: any) => {
    try {
      await deleteAttachment.mutateAsync(attachment);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments ({attachments.length})
          </CardTitle>
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button size="sm" disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {attachments.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(attachment.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(attachment.file_size || 0)}</span>
                      <Badge variant="outline" className="text-xs">
                        {attachment.file_type.split('/')[0]}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{attachment.filename}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(attachment)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default NoteAttachments;
