
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
      
      // Since there's no profiles table, return the current authenticated user
      console.log('No profiles table found, using current user only');
      return [{
        id: user.id,
        email: user.email || '',
        created_at: user.created_at || '',
        email_confirmed_at: user.email_confirmed_at || null,
        last_sign_in_at: user.last_sign_in_at || null,
        raw_user_meta_data: user.user_metadata || {}
      }] as User[];
    },
    enabled: !!user,
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      // Update user metadata via Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: userData.user_metadata?.first_name,
          last_name: userData.user_metadata?.last_name,
        }
      });
      
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      // Note: Regular users cannot delete other users via client-side code
      // This would require admin privileges and server-side functions
      throw new Error('User deletion requires admin privileges and server-side implementation');
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
