
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Experiment {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  startDate: string;
  endDate: string | null;
  researcher: string;
  protocols: number;
  samples: number;
  category: string;
  projectId: string | null;
  folderId: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const useExperiments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: experiments, isLoading, error } = useQuery({
    queryKey: ['experiments'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/experiments');
    },
    enabled: !!user,
  });

  const createExperiment = useMutation({
    mutationFn: async (experiment: Omit<Experiment, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'displayOrder'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/experiments', experiment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const updateExperiment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Experiment> & { id: string }) => {
      return await apiClient.put(`/experiments/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const deleteExperiment = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/experiments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const updateExperimentOrder = useMutation({
    mutationFn: async (experiments: { id: string; displayOrder: number }[]) => {
      // For now, just update each experiment individually
      // In a real implementation, you'd want a batch update endpoint
      const updates = experiments.map(exp => 
        apiClient.put(`/experiments/${exp.id}`, { displayOrder: exp.displayOrder })
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  return {
    experiments: experiments || [],
    isLoading,
    error,
    createExperiment,
    updateExperiment,
    updateExperimentOrder,
    deleteExperiment,
  };
};
