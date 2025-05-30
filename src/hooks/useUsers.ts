
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
      
      try {
        // Get user profiles which contain the actual user data
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*');

        if (profilesError && profilesError.code !== 'PGRST116') {
          console.warn('Could not fetch user profiles:', profilesError);
        }

        // Get all unique user IDs from various tables
        const tables = ['projects', 'experiments', 'tasks', 'reports', 'team_members'];
        const userIds = new Set([user.id]); // Always include current user

        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('user_id')
              .not('user_id', 'is', null);

            if (!error && data) {
              data.forEach((item: any) => userIds.add(item.user_id));
            }
          } catch (err) {
            console.warn(`Could not fetch user_ids from ${table}:`, err);
          }
        }

        const allUsers: User[] = [];

        // Create user entries for all discovered user IDs
        for (const userId of userIds) {
          const profile = profiles?.find(p => p.user_id === userId);
          
          if (userId === user.id) {
            // Current user - use auth data
            allUsers.push({
              id: user.id,
              email: user.email || 'current.user@lab.system',
              created_at: user.created_at || new Date().toISOString(),
              email_confirmed_at: user.email_confirmed_at || null,
              last_sign_in_at: user.last_sign_in_at || null,
              raw_user_meta_data: {
                first_name: profile?.first_name || user.user_metadata?.first_name,
                last_name: profile?.last_name || user.user_metadata?.last_name,
                avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
              }
            });
          } else if (profile) {
            // User with profile data
            allUsers.push({
              id: userId,
              email: `${profile.first_name?.toLowerCase() || 'user'}.${profile.last_name?.toLowerCase() || userId.slice(0, 4)}@lab.system`,
              created_at: profile.created_at,
              email_confirmed_at: profile.created_at,
              last_sign_in_at: profile.updated_at,
              raw_user_meta_data: {
                first_name: profile.first_name,
                last_name: profile.last_name,
                avatar_url: profile.avatar_url,
              }
            });
          } else {
            // User without profile - create basic entry
            allUsers.push({
              id: userId,
              email: `researcher.${userId.slice(0, 8)}@lab.system`,
              created_at: new Date().toISOString(),
              email_confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              raw_user_meta_data: {
                first_name: 'Lab',
                last_name: 'User'
              }
            });
          }
        }

        return allUsers.sort((a, b) => {
          // Current user first, then by creation date
          if (a.id === user.id) return -1;
          if (b.id === user.id) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      } catch (error) {
        console.error('Error fetching users:', error);
        // Return current user as fallback
        return [{
          id: user.id,
          email: user.email || 'current.user@lab.system',
          created_at: user.created_at || new Date().toISOString(),
          email_confirmed_at: user.email_confirmed_at || null,
          last_sign_in_at: user.last_sign_in_at || null,
          raw_user_meta_data: user.user_metadata || {}
        }] as User[];
      }
    },
    enabled: !!user,
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: any }) => {
      // Update user metadata via Supabase Auth (only for current user)
      if (id === user?.id) {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            first_name: userData.user_metadata?.first_name,
            last_name: userData.user_metadata?.last_name,
          }
        });
        
        if (error) throw error;
        
        // Also update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert([{
            user_id: id,
            first_name: userData.user_metadata?.first_name,
            last_name: userData.user_metadata?.last_name,
          }]);
          
        if (profileError) throw profileError;
        
        return data.user;
      } else {
        // For other users, only update profile
        const { data, error } = await supabase
          .from('user_profiles')
          .upsert([{
            user_id: id,
            first_name: userData.user_metadata?.first_name,
            last_name: userData.user_metadata?.last_name,
          }])
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
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
