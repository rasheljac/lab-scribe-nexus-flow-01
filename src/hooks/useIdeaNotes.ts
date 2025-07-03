
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface IdeaNote {
  id: string;
  idea_id: string;
  user_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export const useIdeaNotes = (ideaId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['ideaNotes', ideaId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get(`/ideas/${ideaId}/notes`);
    },
    enabled: !!user && !!ideaId,
  });

  const createNote = useMutation({
    mutationFn: async (note: Omit<IdeaNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/ideas/${ideaId}/notes`, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IdeaNote> & { id: string }) => {
      return await apiClient.put(`/idea-notes/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/idea-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  return {
    notes: notes || [],
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
};
