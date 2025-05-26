
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      
      console.log('Fetching calendar events for user:', user.id);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
      }
      
      console.log('Fetched calendar events:', data);
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating calendar event:', { ...event, user_id: user.id });

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ ...event, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        throw error;
      }
      
      console.log('Created calendar event:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      console.log('Updating calendar event:', id, updates);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        throw error;
      }
      
      console.log('Updated calendar event:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting calendar event:', id);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
      }
      
      console.log('Deleted calendar event:', id);
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
