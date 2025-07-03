
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
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
      return await apiClient.get('/team-members');
    },
    enabled: !!user,
  });

  const createTeamMember = useMutation({
    mutationFn: async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/team-members', teamMember);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  const updateTeamMember = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeamMember> & { id: string }) => {
      return await apiClient.put(`/team-members/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });

  const deleteTeamMember = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/team-members/${id}`);
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
