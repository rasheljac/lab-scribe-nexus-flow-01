
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useProjectExperimentReports = (projectId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const generateProjectReport = useMutation({
    mutationFn: async ({ projectId, projectTitle, reportTitle, includeNotes, includeAttachments }: {
      projectId: string;
      projectTitle: string;
      reportTitle: string;
      includeNotes: boolean;
      includeAttachments: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/projects/${projectId}/generate-report`, {
        projectTitle,
        reportTitle,
        includeNotes,
        includeAttachments
      });
    },
  });

  const generateExperimentReport = useMutation({
    mutationFn: async ({ experimentId, experimentTitle, reportTitle, includeNotes, includeAttachments }: {
      experimentId: string;
      experimentTitle: string;
      reportTitle: string;
      includeNotes: boolean;
      includeAttachments: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiments/${experimentId}/generate-report`, {
        experimentTitle,
        reportTitle,
        includeNotes,
        includeAttachments
      });
    },
  });

  return {
    reports: [],
    isLoading: false,
    error: null,
    generateProjectReport,
    generateExperimentReport,
  };
};
