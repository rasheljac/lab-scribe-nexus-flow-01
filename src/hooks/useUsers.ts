
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
      
      // Try to fetch from profiles table first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.log('Profiles table not found, using current user only');
        // If profiles table doesn't exist, return current user info
        return [{
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
          email_confirmed_at: user.email_confirmed_at || null,
          last_sign_in_at: user.last_sign_in_at || null,
          raw_user_meta_data: user.user_metadata || {}
        }] as User[];
      }
      
      return profilesData.map(profile => ({
        id: profile.id,
        email: profile.email || user.email || '',
        created_at: profile.created_at || user.created_at || '',
        email_confirmed_at: profile.email_confirmed_at || user.email_confirmed_at || null,
        last_sign_in_at: profile.last_sign_in_at || user.last_sign_in_at || null,
        raw_user_meta_data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url
        }
      })) as User[];
    },
    enabled: !!user,
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      // Try to update profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.user_metadata?.first_name,
          last_name: userData.user_metadata?.last_name,
          email: userData.email
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      // Only allow deleting from profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
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
