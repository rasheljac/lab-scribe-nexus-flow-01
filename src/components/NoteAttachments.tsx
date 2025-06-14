import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Paperclip, Upload, Download, Trash2, FileText, Image, File, Loader2, AlertCircle } from "lucide-react";
import { useExperimentNoteAttachments } from "@/hooks/useExperimentNoteAttachments";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NoteAttachmentsProps {
  noteId: string;
  showUploadButton?: boolean;
  compact?: boolean;
}

const NoteAttachments = ({ noteId, showUploadButton = true, compact = false }: NoteAttachmentsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<any>(null);
  const { attachments, uploadAttachment, deleteAttachment, downloadAttachment } = useExperimentNoteAttachments(noteId);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of Array.from(files)) {
        try {
          // Check file size (max 10MB for localStorage)
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: "File Too Large",
              description: `${file.name} exceeds the 10MB size limit for local storage`,
              variant: "destructive",
            });
            errorCount++;
            continue;
          }

          console.log('Uploading file:', file.name, file.size);
          await uploadAttachment.mutateAsync({ file, noteId });
          successCount++;
        } catch (error) {
          console.error('Upload error for file:', file.name, error);
          errorCount++;
          
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${error.message || 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      }
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('General upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      console.log('Starting download for:', attachment.filename);
      await downloadAttachment(attachment);
      
      toast({
        title: "Download Started",
        description: `Downloading ${attachment.filename}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download ${attachment.filename}: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attachment: any) => {
    try {
      console.log('Deleting attachment:', attachment.id);
      await deleteAttachment.mutateAsync(attachment);
      toast({
        title: "File Deleted",
        description: `${attachment.filename} has been deleted`,
      });
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete ${attachment.filename}: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (attachment: any) => {
    setAttachmentToDelete(attachment);
    setDeleteDialogOpen(true);
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

  // Compact version for inline display
  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {showUploadButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
                  />
                  <Button size="sm" variant="outline" disabled={isUploading}>
                    {isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload files (max 10MB each)</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {attachments.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs">{attachments.length}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {attachments.map((attachment, index) => (
                      <div key={attachment.id}>
                        <div className="px-2 py-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getFileIcon(attachment.file_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.filename}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size || 0)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs flex-1"
                              onClick={() => handleDownload(attachment)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                              onClick={() => openDeleteDialog(attachment)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {index < attachments.length - 1 && <DropdownMenuSeparator />}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>{attachments.length} attachment(s) - Click to manage</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{attachmentToDelete?.filename}"? This action cannot be undone and the file will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAttachmentToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => attachmentToDelete && handleDelete(attachmentToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>
    );
  }

  // Full version for expanded display
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments ({attachments.length})
          </CardTitle>
          {showUploadButton && (
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
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
          )}
        </div>
        <p className="text-sm text-gray-600">
          Supported files: PDF, DOC, TXT, images, and more (max 10MB each)
        </p>
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => openDeleteDialog(attachment)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{attachmentToDelete?.filename}"? This action cannot be undone and the file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAttachmentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => attachmentToDelete && handleDelete(attachmentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default NoteAttachments;
