
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExperimentNoteAttachment {
  id: string;
  note_id: string;
  user_id: string;
  filename: string;
  file_content: string; // base64 encoded file content
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
      
      console.log('Fetching attachments for noteId:', noteId, 'user:', user.id);
      
      const { data, error } = await supabase
        .from('experiment_note_attachments')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attachments:', error);
        throw error;
      }
      console.log('Fetched attachments:', data);
      return data as ExperimentNoteAttachment[];
    },
    enabled: !!user && !!noteId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, noteId }: { file: File; noteId: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting file upload:', file.name, file.size, 'user:', user.id, 'noteId:', noteId);

      // Validate file size (max 10MB for localStorage)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit for local storage');
      }

      // Convert file to base64
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just base64 content
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('File converted to base64, now saving to database...');

      // Prepare the attachment record
      const attachmentData = {
        note_id: noteId,
        user_id: user.id,
        filename: file.name,
        file_content: base64Content,
        file_type: file.type,
        file_size: file.size,
      };

      console.log('Inserting attachment data:', { ...attachmentData, file_content: 'base64...' });

      // Save attachment record to database
      const { data, error } = await supabase
        .from('experiment_note_attachments')
        .insert([attachmentData])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Upload successful:', { ...data, file_content: 'base64...' });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ExperimentNoteAttachment) => {
      console.log('Deleting attachment:', attachment.id);

      // Delete record from database (no storage cleanup needed for localStorage)
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

      // Convert base64 back to blob
      const binaryString = atob(attachment.file_content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: attachment.file_type });
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      
      console.log('Download URL created');
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up URL
      URL.revokeObjectURL(url);
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
