
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  reminder_minutes_before: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Checking for calendar reminders...");

    // Get events that need reminders sent
    const { data: events, error: fetchError } = await supabaseClient
      .from('calendar_events')
      .select('id, user_id, title, description, start_time, reminder_minutes_before')
      .eq('reminder_enabled', true)
      .eq('reminder_sent', false)
      .eq('status', 'scheduled')
      .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // Events within 24 hours

    if (fetchError) {
      console.error("Error fetching events:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${events?.length || 0} events to check for reminders`);

    const remindersToSend = [];
    const now = new Date();

    for (const event of events || []) {
      const startTime = new Date(event.start_time);
      const reminderTime = new Date(startTime.getTime() - (event.reminder_minutes_before * 60 * 1000));
      
      if (now >= reminderTime) {
        remindersToSend.push(event);
      }
    }

    console.log(`Sending ${remindersToSend.length} reminders`);

    // Process reminders
    for (const event of remindersToSend) {
      try {
        // Here you would integrate with your notification system
        // For now, we'll just log and mark as sent
        console.log(`Reminder for event "${event.title}" scheduled at ${event.start_time}`);
        
        // Mark reminder as sent
        const { error: updateError } = await supabaseClient
          .from('calendar_events')
          .update({ reminder_sent: true })
          .eq('id', event.id);

        if (updateError) {
          console.error(`Error marking reminder as sent for event ${event.id}:`, updateError);
        } else {
          console.log(`Marked reminder as sent for event ${event.id}`);
        }
      } catch (error) {
        console.error(`Error processing reminder for event ${event.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: remindersToSend.length,
        message: `Processed ${remindersToSend.length} calendar reminders`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-calendar-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
