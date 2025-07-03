
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'experiment' | 'activity' | 'maintenance' | 'inventory';
  status: 'draft' | 'published' | 'archived';
  author: string;
  format: string;
  size: string | null;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export const useReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/reports');
    },
    enabled: !!user,
  });

  const createReport = useMutation({
    mutationFn: async (report: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/reports', report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Report> & { id: string }) => {
      return await apiClient.put(`/reports/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    reports: reports || [],
    isLoading,
    error,
    createReport,
    updateReport,
    deleteReport,
  };
};
