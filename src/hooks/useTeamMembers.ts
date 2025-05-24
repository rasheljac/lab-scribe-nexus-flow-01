
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: 'active' | 'inactive';
  join_date: string;
  expertise: string[];
  current_projects: number;
  experiments_completed: number;
  created_at: string;
  updated_at: string;
}

export const useTeamMembers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading, error } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await (supabase as any)
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!user,
  });

  const createTeamMember = useMutation({
    mutationFn: async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('team_members')
        .insert([{ ...teamMember, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  const updateTeamMember = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamMember> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  const deleteTeamMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  return {
    teamMembers: teamMembers || [],
    isLoading,
    error,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
};
