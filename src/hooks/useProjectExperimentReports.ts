
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useProjectExperimentReports = (projectId: string) => {
  const { user } = useAuth();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['projectExperimentReports', projectId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get(`/projects/${projectId}/experiment-reports`);
    },
    enabled: !!user && !!projectId,
  });

  return {
    reports: reports || [],
    isLoading,
    error,
  };
};
