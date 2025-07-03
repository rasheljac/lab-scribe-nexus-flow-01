
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface ExperimentIdea {
  id: string;
  title: string;
  description?: string;
  hypothesis?: string;
  methodology?: string;
  required_materials?: string;
  expected_outcomes?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimated_duration?: string;
  budget_estimate?: string;
  status: 'brainstorming' | 'researching' | 'planning' | 'ready' | 'archived';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useExperimentIdeas = (experimentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas, isLoading, error } = useQuery({
    queryKey: experimentId ? ['experimentIdeas', experimentId] : ['experimentIdeas'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const endpoint = experimentId ? `/experiments/${experimentId}/ideas` : '/experiment-ideas';
      return await apiClient.get(endpoint);
    },
    enabled: !!user,
  });

  const createIdea = useMutation({
    mutationFn: async (idea: any) => {
      if (!user) throw new Error('User not authenticated');
      const endpoint = experimentId ? `/experiments/${experimentId}/ideas` : '/experiment-ideas';
      return await apiClient.post(endpoint, idea);
    },
    onSuccess: () => {
      const queryKey = experimentId ? ['experimentIdeas', experimentId] : ['experimentIdeas'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateIdea = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ExperimentIdea>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.put(`/experiment-ideas/${id}`, updates);
    },
    onSuccess: () => {
      const queryKey = experimentId ? ['experimentIdeas', experimentId] : ['experimentIdeas'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (ideaId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/experiment-ideas/${ideaId}`);
    },
    onSuccess: () => {
      const queryKey = experimentId ? ['experimentIdeas', experimentId] : ['experimentIdeas'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const convertToExperiment = useMutation({
    mutationFn: async (ideaId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiment-ideas/${ideaId}/convert-to-experiment`, {});
    },
    onSuccess: () => {
      const queryKey = experimentId ? ['experimentIdeas', experimentId] : ['experimentIdeas'];
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const updateIdeaOrder = useMutation({
    mutationFn: async (orderUpdates: { id: string; display_order: number }[]) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/experiment-ideas/reorder', { orderUpdates });
    },
    onSuccess: () => {
      const queryKey = experimentId ? ['experimentIdeas', experimentId] : ['experimentIdeas'];
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    ideas: ideas || [],
    isLoading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
    convertToExperiment,
    updateIdeaOrder,
  };
};
