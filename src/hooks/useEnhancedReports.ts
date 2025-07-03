
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useEnhancedReports = () => {
  const { user } = useAuth();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['enhancedReports'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/enhanced-reports');
    },
    enabled: !!user,
  });

  return {
    reports: reports || [],
    isLoading,
    error,
  };
};
