
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
      if (!user) {
        console.log('No user authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log(`Fetching folders for user: ${user.id} and type: ${type}`);
      
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching folders:", error);
        throw error;
      }
      
      console.log("Fetched folders:", data);
      return data as Folder[];
    },
    enabled: !!user,
  });

  const createFolder = useMutation({
    mutationFn: async (folder: Omit<Folder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) {
        console.log('No user authenticated for folder creation');
        throw new Error('User not authenticated');
      }

      console.log("Creating folder with data:", folder);

      const { data, error } = await supabase
        .from('folders')
        .insert([{ ...folder, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error("Error creating folder:", error);
        throw error;
      }
      
      console.log("Created folder successfully:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Invalidating folders query after creation");
      queryClient.invalidateQueries({ queryKey: ['folders', type] });
    },
    onError: (error) => {
      console.error("Create folder mutation error:", error);
    },
  });

  const updateFolder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Folder> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log("Updating folder:", id, updates);

      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating folder:", error);
        throw error;
      }
      
      console.log("Updated folder:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', type] });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log("Deleting folder:", id);

      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting folder:", error);
        throw error;
      }
      
      console.log("Deleted folder successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', type] });
    },
  });

  console.log("useFolders hook state:", { 
    isLoading, 
    error, 
    foldersCount: folders?.length, 
    user: user?.id,
    createPending: createFolder.isPending 
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
