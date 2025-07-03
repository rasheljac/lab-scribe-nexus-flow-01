
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export const useLabelTemplates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['labelTemplates'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/label-templates');
    },
    enabled: !!user,
  });

  const createTemplate = useMutation({
    mutationFn: async (template: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/label-templates', template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labelTemplates'] });
    },
  });

  const addTemplate = useMutation({
    mutationFn: async (template: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/label-templates', template);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labelTemplates'] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/label-templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labelTemplates'] });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    loading: isLoading,
    error,
    createTemplate,
    addTemplate,
    deleteTemplate,
  };
};
