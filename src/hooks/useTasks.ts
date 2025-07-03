
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
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
      return await apiClient.get('/tasks');
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/tasks', task);
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(['tasks'], (oldTasks: Task[] = []) => {
        return [newTask, ...oldTasks];
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      return await apiClient.put(`/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const saveTaskOrder = async (taskIds: string[]) => {
    // This would be handled by user preferences API
    console.log('Saving task order:', taskIds);
  };

  const getSavedTaskOrder = async (): Promise<string[]> => {
    // This would be retrieved from user preferences API
    return [];
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
