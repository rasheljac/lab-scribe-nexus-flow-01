
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useExperimentNoteAttachments = (noteId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ['experimentNoteAttachments', noteId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get(`/experiment-notes/${noteId}/attachments`);
    },
    enabled: !!user && !!noteId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiment-notes/${noteId}/attachments`, {
        filename: file.name,
        file_type: file.type,
        file_size: file.size
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/experiment-notes/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentNoteAttachments', noteId] });
    },
  });

  const downloadAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get(`/experiment-notes/attachments/${attachmentId}/download`);
    },
  });

  return {
    attachments: attachments || [],
    isLoading,
    error,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
  };
};
