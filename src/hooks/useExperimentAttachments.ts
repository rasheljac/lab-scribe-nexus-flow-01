
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ExperimentAttachment {
  id: string;
  experiment_id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export const useExperimentAttachments = (experimentId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ['experimentAttachments', experimentId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_attachments')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExperimentAttachment[];
    },
    enabled: !!user && !!experimentId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, experimentId }: { file: File; experimentId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${experimentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('experiment-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('experiment_attachments')
        .insert([{
          experiment_id: experimentId,
          user_id: user.id,
          filename: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentAttachments', experimentId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachment: ExperimentAttachment) => {
      const { error: storageError } = await supabase.storage
        .from('experiment-attachments')
        .remove([attachment.file_path]);

      if (storageError) console.error('Storage deletion error:', storageError);

      const { error } = await supabase
        .from('experiment_attachments')
        .delete()
        .eq('id', attachment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentAttachments', experimentId] });
    },
  });

  const getAttachmentUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('experiment-attachments')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    attachments: attachments || [],
    isLoading,
    error,
    uploadAttachment,
    deleteAttachment,
    getAttachmentUrl,
  };
};
