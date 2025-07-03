
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useFolders = (type?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: folders, isLoading, error } = useQuery({
    queryKey: type ? ['folders', type] : ['folders'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const endpoint = type ? `/folders?type=${type}` : '/folders';
      return await apiClient.get(endpoint);
    },
    enabled: !!user,
  });

  const createFolder = useMutation({
    mutationFn: async (folder: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/folders', folder);
    },
    onSuccess: () => {
      const queryKey = type ? ['folders', type] : ['folders'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateFolder = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.put(`/folders/${id}`, { name });
    },
    onSuccess: () => {
      const queryKey = type ? ['folders', type] : ['folders'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/folders/${folderId}`);
    },
    onSuccess: () => {
      const queryKey = type ? ['folders', type] : ['folders'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    folders: folders || [],
    isLoading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
  };
};
