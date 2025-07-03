
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useProtocols = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: protocols, isLoading, error } = useQuery({
    queryKey: ['protocols'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/protocols');
    },
    enabled: !!user,
  });

  const createProtocol = useMutation({
    mutationFn: async (protocol: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/protocols', protocol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] });
    },
  });

  return {
    protocols: protocols || [],
    isLoading,
    error,
    createProtocol,
  };
};
