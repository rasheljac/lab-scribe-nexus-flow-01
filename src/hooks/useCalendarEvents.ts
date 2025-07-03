
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: 'meeting' | 'maintenance' | 'experiment' | 'training' | 'booking';
  start_time: string;
  end_time: string;
  location: string | null;
  attendees: string[] | null;
  status: 'scheduled' | 'cancelled' | 'completed';
  reminder_enabled: boolean | null;
  reminder_minutes_before: number | null;
  reminder_sent: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useCalendarEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.get('/calendar-events');
    },
    enabled: !!user,
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await apiClient.post('/calendar-events', event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      return await apiClient.put(`/calendar-events/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/calendar-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
  });

  return {
    events: events || [],
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
