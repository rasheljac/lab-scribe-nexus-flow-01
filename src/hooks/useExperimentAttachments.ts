
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
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
      return await apiClient.get(`/experiments/${experimentId}/attachments`);
    },
    enabled: !!user && !!experimentId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, experimentId }: { file: File; experimentId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('experiment_id', experimentId);

      // For now, we'll simulate the upload
      return await apiClient.post(`/experiments/${experimentId}/attachments`, {
        filename: file.name,
        file_type: file.type,
        file_size: file.size
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentAttachments', experimentId] });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      return await apiClient.delete(`/experiment-attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentAttachments', experimentId] });
    },
  });

  const getAttachmentUrl = (filePath: string) => {
    // For now, return a mock URL - this would be handled by the backend
    return `/api/files/${filePath}`;
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
