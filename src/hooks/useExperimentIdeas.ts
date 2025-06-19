
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export interface ExperimentIdea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  hypothesis: string | null;
  methodology: string | null;
  required_materials: string | null;
  expected_outcomes: string | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimated_duration: string | null;
  budget_estimate: string | null;
  status: 'brainstorming' | 'researching' | 'planning' | 'ready' | 'archived';
  tags: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

type ExperimentIdeaRow = Tables<'experiment_ideas'>;
type ExperimentIdeaInsert = Omit<ExperimentIdeaRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>;

export const useExperimentIdeas = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ideas, isLoading, error } = useQuery({
    queryKey: ['experiment-ideas'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('experiment_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ExperimentIdea[];
    },
    enabled: !!user,
  });

  const createIdea = useMutation({
    mutationFn: async (idea: ExperimentIdeaInsert) => {
      if (!user) throw new Error('User not authenticated');

      // Get the highest display_order for this user
      const { data: maxOrderData } = await supabase
        .from('experiment_ideas')
        .select('display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order + 1 : 1;

      const { data, error } = await supabase
        .from('experiment_ideas')
        .insert([{ ...idea, user_id: user.id, display_order: nextOrder }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-ideas'] });
    },
  });

  const updateIdea = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExperimentIdea> & { id: string }) => {
      const { data, error } = await supabase
        .from('experiment_ideas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-ideas'] });
    },
  });

  const updateIdeaOrder = useMutation({
    mutationFn: async (ideas: { id: string; display_order: number }[]) => {
      const updates = ideas.map(idea => 
        supabase
          .from('experiment_ideas')
          .update({ display_order: idea.display_order })
          .eq('id', idea.id)
          .eq('user_id', user?.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update idea order');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-ideas'] });
    },
  });

  const deleteIdea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('experiment_ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-ideas'] });
    },
  });

  const convertToExperiment = useMutation({
    mutationFn: async (ideaId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get the idea data
      const { data: idea, error: ideaError } = await supabase
        .from('experiment_ideas')
        .select('*')
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .single();

      if (ideaError) throw ideaError;

      // Create experiment from idea
      const { data: experiment, error: experimentError } = await supabase
        .from('experiments')
        .insert([{
          user_id: user.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          status: 'planning',
          progress: 0,
          start_date: new Date().toISOString().split('T')[0],
          researcher: user.email?.split('@')[0] || 'Unknown',
          protocols: 0,
          samples: 0,
        }])
        .select()
        .single();

      if (experimentError) throw experimentError;

      // Update idea status to archived
      await supabase
        .from('experiment_ideas')
        .update({ status: 'archived' })
        .eq('id', ideaId)
        .eq('user_id', user.id);

      return experiment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  return {
    ideas: ideas || [],
    isLoading,
    error,
    createIdea,
    updateIdea,
    updateIdeaOrder,
    deleteIdea,
    convertToExperiment,
  };
};
