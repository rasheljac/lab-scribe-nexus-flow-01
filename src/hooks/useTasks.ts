import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  due_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newTask) => {
      // Optimistically update the cache by placing the new task at the top
      queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
        return [newTask, ...oldTasks];
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // New function to save task order to user preferences
  const saveTaskOrder = async (taskIds: string[]) => {
    if (!user) return;
    
    try {
      const { data: existingPrefs } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      // Safely handle the preferences object
      const currentPrefs = existingPrefs?.preferences && typeof existingPrefs.preferences === 'object' 
        ? existingPrefs.preferences as Record<string, any>
        : {};
      
      const updatedPrefs = {
        ...currentPrefs,
        dashboardTaskOrder: taskIds
      };

      if (existingPrefs) {
        await supabase
          .from('user_preferences')
          .update({ preferences: updatedPrefs })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id,
            preferences: updatedPrefs,
            hidden_pages: []
          }]);
      }
    } catch (error) {
      console.error('Error saving task order:', error);
    }
  };

  // New function to get saved task order
  const getSavedTaskOrder = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle();

      // Safely access the dashboardTaskOrder property
      if (data?.preferences && typeof data.preferences === 'object') {
        const prefs = data.preferences as Record<string, any>;
        return Array.isArray(prefs.dashboardTaskOrder) ? prefs.dashboardTaskOrder : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting saved task order:', error);
      return [];
    }
  };

  return {
    tasks: tasks || [],
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    saveTaskOrder,
    getSavedTaskOrder,
  };
};
