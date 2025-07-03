
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  progress: number;
  startDate: string;
  endDate: string | null;
  budget: string | null;
  category: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  // Legacy snake_case properties for compatibility
  start_date: string;
  end_date: string | null;
  experiments_count: number;
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      // For now, return empty array - this will be implemented later
      return [];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'displayOrder' | 'start_date' | 'end_date' | 'experiments_count'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/projects', project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      return await apiClient.put(`/projects/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectOrder = useMutation({
    mutationFn: async (updates: { id: string; displayOrder: number }[]) => {
      return await apiClient.put('/projects/reorder', { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projects || [],
    isLoading,
    error,
    createProject,
    updateProject,
    updateProjectOrder,
    deleteProject,
  };
};
