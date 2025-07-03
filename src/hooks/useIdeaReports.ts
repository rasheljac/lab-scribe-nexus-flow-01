
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useIdeaReports = () => {
  const { user } = useAuth();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['ideaReports'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/idea-reports');
    },
    enabled: !!user,
  });

  return {
    reports: reports || [],
    isLoading,
    error,
  };
};
