
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
        // First, try to get user profiles which contain the actual user data
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*');

        // Get all users who have created any data in the system
        const { data: userActivities, error: activitiesError } = await supabase
          .from('projects')
          .select('user_id')
          .not('user_id', 'is', null);

        if (activitiesError) console.warn('Could not fetch user activities:', activitiesError);

        // Combine profile data with activity data
        const activeUserIds = new Set([
          user.id, // Always include current user
          ...(userActivities?.map(a => a.user_id) || [])
        ]);

        // If we have profiles, use them as the source of truth
        if (profiles && profiles.length > 0) {
          const profileUsers = profiles.map(profile => ({
            id: profile.user_id,
            email: `user-${profile.user_id.slice(0, 8)}@lab.system`, // System generated identifier
            created_at: profile.created_at,
            email_confirmed_at: profile.created_at,
            last_sign_in_at: profile.updated_at,
            raw_user_meta_data: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
            }
          })) as User[];

          // Add current user if not in profiles
          const currentUserInProfiles = profileUsers.find(p => p.id === user.id);
          if (!currentUserInProfiles) {
            profileUsers.unshift({
              id: user.id,
              email: user.email || 'current.user@lab.system',
              created_at: user.created_at || new Date().toISOString(),
              email_confirmed_at: user.email_confirmed_at || null,
              last_sign_in_at: user.last_sign_in_at || null,
              raw_user_meta_data: user.user_metadata || {}
            } as User);
          }

          return profileUsers;
        }

        // Fallback: Create user entries for all active user IDs
        const fallbackUsers: User[] = [];
        
        // Always include current user first
        fallbackUsers.push({
          id: user.id,
          email: user.email || 'current.user@lab.system',
          created_at: user.created_at || new Date().toISOString(),
          email_confirmed_at: user.email_confirmed_at || null,
          last_sign_in_at: user.last_sign_in_at || null,
          raw_user_meta_data: user.user_metadata || {}
        });

        // Add other active users
        for (const userId of activeUserIds) {
          if (userId !== user.id) {
            fallbackUsers.push({
              id: userId,
              email: `researcher-${userId.slice(0, 8)}@lab.system`,
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

        return fallbackUsers;
      } catch (error) {
        console.error('Error fetching users:', error);
        // Return current user as absolute fallback
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
