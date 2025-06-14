
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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('noteId', noteId);

      const { data, error } = await supabase.functions.invoke('s3-file-operations', {
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ExperimentNoteAttachment) => {
      const { data, error } = await supabase.functions.invoke('s3-file-operations', {
        body: { attachmentId: attachment.id },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const downloadAttachment = async (attachment: ExperimentNoteAttachment) => {
    const { data, error } = await supabase.functions.invoke('s3-file-operations', {
      body: null,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (error) throw error;

    // Create download link
    const a = document.createElement('a');
    a.href = data.downloadUrl;
    a.download = attachment.filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
