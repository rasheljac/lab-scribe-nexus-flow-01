
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useTaskReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendTaskReminders = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('send-task-reminders', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      console.log('Task reminders sent successfully');
    },
  });

  return {
    sendTaskReminders,
  };
};
