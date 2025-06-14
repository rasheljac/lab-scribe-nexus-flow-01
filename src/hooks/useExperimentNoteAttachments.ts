
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

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${noteId}/${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('experiment-note-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save attachment record to database
      const { data, error } = await supabase
        .from('experiment_note_attachments')
        .insert([{
          note_id: noteId,
          user_id: user.id,
          filename: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ExperimentNoteAttachment) => {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('experiment-note-attachments')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error } = await supabase
        .from('experiment_note_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const downloadAttachment = async (attachment: ExperimentNoteAttachment) => {
    const { data, error } = await supabase.storage
      .from('experiment-note-attachments')
      .download(attachment.file_path);

    if (error) throw error;

    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
