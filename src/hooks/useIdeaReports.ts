
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useIdeaReports = () => {
  const { user } = useAuth();

  const generateIdeaReport = useMutation({
    mutationFn: async ({ ideaId, includeNotes }: { ideaId: string; includeNotes: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiment-ideas/${ideaId}/generate-report`, { includeNotes });
    },
  });

  const generateAllIdeasReport = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/experiment-ideas/generate-all-report', {});
    },
  });

  return {
    reports: [],
    isLoading: false,
    error: null,
    generateIdeaReport,
    generateAllIdeasReport,
  };
};
