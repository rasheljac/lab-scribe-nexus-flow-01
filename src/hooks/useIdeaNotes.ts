
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      
      const { data, error } = await supabase
        .from('idea_notes')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as IdeaNote[];
    },
    enabled: !!user && !!ideaId,
  });

  const createNote = useMutation({
    mutationFn: async (note: Omit<IdeaNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('idea_notes')
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as IdeaNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IdeaNote> & { id: string }) => {
      const { data, error } = await supabase
        .from('idea_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as IdeaNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaNotes', ideaId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('idea_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
