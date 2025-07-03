
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/users');
    },
    enabled: !!user,
  });

  const createUser = useMutation({
    mutationFn: async (newUser: any) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/users', newUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.put(`/users/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
  };
};
