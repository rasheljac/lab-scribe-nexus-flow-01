
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useExperimentIdeas = (experimentId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas, isLoading, error } = useQuery({
    queryKey: ['experimentIdeas', experimentId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get(`/experiments/${experimentId}/ideas`);
    },
    enabled: !!user && !!experimentId,
  });

  const createIdea = useMutation({
    mutationFn: async (idea: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiments/${experimentId}/ideas`, idea);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experimentIdeas', experimentId] });
    },
  });

  return {
    ideas: ideas || [],
    isLoading,
    error,
    createIdea,
  };
};
