
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  role?: string;
  raw_user_meta_data: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export const useUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      return data.users as User[];
    },
    enabled: !!user,
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      const { data, error } = await supabase.auth.admin.updateUserById(id, userData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
    updateUser,
    deleteUser,
  };
};
