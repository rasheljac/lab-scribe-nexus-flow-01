
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useTaskReminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendTaskReminders = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const data = await apiClient.post('/task-reminders/send', { user_id: user.id });
      return data;
    },
    onSuccess: (data) => {
      console.log('Task reminders sent successfully', data);
      toast({
        title: "Success",
        description: `Task reminders sent successfully to ${data?.recipient || 'your email'}`,
      });
    },
    onError: (error: any) => {
      console.error('Error sending task reminders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send task reminders",
        variant: "destructive",
      });
    },
  });

  const sendCalendarReminders = useMutation({
    mutationFn: async () => {
      const data = await apiClient.post('/calendar-reminders/send', {});
      return data;
    },
    onSuccess: (data) => {
      console.log('Calendar reminders sent successfully', data);
      toast({
        title: "Success",
        description: `Processed ${data?.reminders_sent || 0} calendar reminders`,
      });
    },
    onError: (error: any) => {
      console.error('Error sending calendar reminders:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send calendar reminders",
        variant: "destructive",
      });
    },
  });

  const testEmailConfiguration = useMutation({
    mutationFn: async (testEmail: string) => {
      if (!user) throw new Error('User not authenticated');
      const data = await apiClient.post('/test-email', { 
        user_id: user.id,
        test_email: testEmail
      });
      return data;
    },
    onSuccess: (data) => {
      console.log('Test email sent successfully', data);
      toast({
        title: "Test Email Sent",
        description: "Email configuration test completed successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error sending test email:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  return {
    sendTaskReminders,
    sendCalendarReminders,
    testEmailConfiguration,
  };
};
