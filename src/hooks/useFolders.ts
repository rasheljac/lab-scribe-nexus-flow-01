
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  type: 'experiment' | 'note';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useFolders = (type: 'experiment' | 'note') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: folders, isLoading, error } = useQuery({
    queryKey: ['folders', type],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Folder[];
    },
    enabled: !!user,
  });

  const createFolder = useMutation({
    mutationFn: async (folder: Omit<Folder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('folders')
        .insert([{ ...folder, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', type] });
    },
  });

  const updateFolder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Folder> & { id: string }) => {
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', type] });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', type] });
    },
  });

  return {
    folders: folders || [],
    isLoading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
  };
};
