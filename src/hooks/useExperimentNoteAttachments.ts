
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExperimentNoteAttachment {
  id: string;
  note_id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export const useExperimentNoteAttachments = (noteId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ['experimentNoteAttachments', noteId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_note_attachments')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExperimentNoteAttachment[];
    },
    enabled: !!user && !!noteId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, noteId }: { file: File; noteId: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting file upload:', file.name, file.size);

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `notes/${user.id}/${noteId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('experiment-attachments')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Upload failed');
      }

      // Save attachment record to database
      const { data, error } = await supabase
        .from('experiment_note_attachments')
        .insert([{
          note_id: noteId,
          user_id: user.id,
          filename: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
        }])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Upload successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ExperimentNoteAttachment) => {
      console.log('Deleting attachment:', attachment.id);

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('experiment-attachments')
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage delete fails
      }

      // Delete record from database
      const { error } = await supabase
        .from('experiment_note_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) {
        console.error('Database delete error:', error);
        throw new Error(`Database delete error: ${error.message}`);
      }

      console.log('Delete successful');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const downloadAttachment = async (attachment: ExperimentNoteAttachment) => {
    try {
      console.log('Starting download for:', attachment.filename);

      // Get the public URL for the file
      const { data } = supabase.storage
        .from('experiment-attachments')
        .getPublicUrl(attachment.file_path);

      if (!data.publicUrl) {
        throw new Error('Failed to generate download URL');
      }
      
      console.log('Download URL:', data.publicUrl);
      
      // Create download link
      const a = document.createElement('a');
      a.href = data.publicUrl;
      a.download = attachment.filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  return {
    attachments: attachments || [],
    isLoading,
    error,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
  };
};
