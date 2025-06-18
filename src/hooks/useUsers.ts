
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as User[];
    },
  });

  const createUser = useMutation({
    mutationFn: async (userData: { first_name: string; last_name: string; email: string }) => {
      // Generate a temporary user_id for the profile
      const tempUserId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: tempUserId,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User profile created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const bulkCreateUsers = useMutation({
    mutationFn: async (usersData: Array<{ first_name: string; last_name: string; email: string }>) => {
      const usersWithIds = usersData.map(user => ({
        ...user,
        user_id: crypto.randomUUID(),
      }));

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(usersWithIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: `${data?.length || 0} users created successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Error creating users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create users",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateUsers = useMutation({
    mutationFn: async (updates: Array<{ id: string; updates: Partial<User> }>) => {
      const promises = updates.map(({ id, updates: userUpdates }) =>
        supabase
          .from('user_profiles')
          .update(userUpdates)
          .eq('id', id)
          .select()
          .single()
      );

      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} users`);
      }

      return results.map(result => result.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: `${data?.length || 0} users updated successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Error updating users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update users",
        variant: "destructive",
      });
    },
  });

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    bulkCreateUsers,
    bulkUpdateUsers,
  };
};
