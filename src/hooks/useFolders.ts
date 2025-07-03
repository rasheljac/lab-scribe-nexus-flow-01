
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useFolders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: folders, isLoading, error } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/folders');
    },
    enabled: !!user,
  });

  const createFolder = useMutation({
    mutationFn: async (folder: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/folders', folder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  return {
    folders: folders || [],
    isLoading,
    error,
    createFolder,
  };
};
