
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useCalendarReminders = () => {
  const { toast } = useToast();

  const sendCalendarReminders = useMutation({
    mutationFn: async () => {
      const data = await apiClient.post('/calendar-reminders/send', {});
      return data;
    },
    onSuccess: (data) => {
      console.log('Calendar reminders processed successfully', data);
      toast({
        title: "Success",
        description: `Processed ${data?.reminders_sent || 0} calendar reminders`,
      });
    },
    onError: (error: any) => {
      console.error('Error processing calendar reminders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process calendar reminders",
        variant: "destructive",
      });
    },
  });

  return {
    sendCalendarReminders,
  };
};
