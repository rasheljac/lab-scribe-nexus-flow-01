
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Label {
  id: string;
  user_id: string;
  title: string;
  subtitle: string;
  date: string;
  researcher: string;
  notes: string;
  barcode_data: string;
  quantity: number;
  template_name: string;
  created_at: string;
  updated_at: string;
}

export const useLabels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: labels, isLoading: loading, error } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/labels');
    },
    enabled: !!user,
  });

  const addLabel = async (label: Omit<Label, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const data = await apiClient.post('/labels', label);
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      return data;
    } catch (error) {
      console.error('Error adding label:', error);
      toast({
        title: "Error",
        description: "Failed to add label",
        variant: "destructive",
      });
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      await apiClient.delete(`/labels/${id}`);
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      toast({
        title: "Success",
        description: "Label deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: "Error",
        description: "Failed to delete label",
        variant: "destructive",
      });
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['labels'] });
  };

  return {
    labels: labels || [],
    loading,
    addLabel,
    deleteLabel,
    refetch
  };
};
