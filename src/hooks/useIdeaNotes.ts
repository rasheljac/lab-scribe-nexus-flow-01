
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface IdeaNote {
  id: string;
  idea_id: string;
  title: string;
  content?: string;
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
      return await apiClient.get(`/experiment-ideas/${ideaId}/notes`);
    },
    enabled: !!user && !!ideaId,
  });

  const createNote = useMutation({
    mutationFn: async (note: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post(`/experiment-ideas/${ideaId}/notes`, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.put(`/idea-notes/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/idea-notes/${noteId}`);
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
