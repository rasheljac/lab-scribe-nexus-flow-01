
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Experiment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  start_date: string;
  end_date: string | null;
  researcher: string;
  protocols: number;
  samples: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useExperiments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: experiments, isLoading, error } = useQuery({
    queryKey: ['experiments'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await (supabase as any)
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Experiment[];
    },
    enabled: !!user,
  });

  const createExperiment = useMutation({
    mutationFn: async (experiment: Omit<Experiment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('experiments')
        .insert([{ ...experiment, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const updateExperiment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Experiment> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('experiments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const deleteExperiment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('experiments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  return {
    experiments: experiments || [],
    isLoading,
    error,
    createExperiment,
    updateExperiment,
    deleteExperiment,
  };
};
