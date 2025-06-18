
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

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
  end_time: string;
  location: string | null;
  reminder_minutes_before: number;
  event_type: string;
  last_reminder_sent: string | null;
}

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
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

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    console.log("Checking for calendar reminders...");

    // Get events that need reminders sent
    const { data: events, error: fetchError } = await supabaseClient
      .from('calendar_events')
      .select('*')
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
      
      // Check if reminder hasn't been sent recently (within the last hour)
      const lastSent = event.last_reminder_sent ? new Date(event.last_reminder_sent) : null;
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      if (now >= reminderTime && (!lastSent || lastSent < oneHourAgo)) {
        remindersToSend.push(event);
      }
    }

    console.log(`Sending ${remindersToSend.length} reminders`);

    // Process reminders
    for (const event of remindersToSend) {
      try {
        // Get user profile for email
        const { data: userProfile, error: profileError } = await supabaseClient
          .from('user_profiles')
          .select('email, first_name, last_name')
          .eq('user_id', event.user_id)
          .single();

        if (profileError || !userProfile?.email) {
          console.error(`Error fetching user profile for event ${event.id}:`, profileError);
          continue;
        }

        // Generate email content
        const userName = userProfile.first_name 
          ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
          : userProfile.email?.split('@')[0] || 'User';

        const emailHtml = generateCalendarReminderEmail(userName, event);

        // Send email using Resend
        const emailResult = await resend.emails.send({
          from: 'Kapelczak Laboratory <noreply@resend.dev>',
          to: [userProfile.email],
          subject: `Upcoming Event: ${event.title}`,
          html: emailHtml,
        });

        if (emailResult.error) {
          console.error(`Resend error for event ${event.id}:`, emailResult.error);
          continue;
        }

        console.log(`Calendar reminder sent for event "${event.title}" to ${userProfile.email}`);
        
        // Mark reminder as sent and update last_reminder_sent
        const { error: updateError } = await supabaseClient
          .from('calendar_events')
          .update({ 
            reminder_sent: true,
            last_reminder_sent: new Date().toISOString()
          })
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

function generateCalendarReminderEmail(userName: string, event: CalendarEvent): string {
  const currentYear = new Date().getFullYear();
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const eventDate = startTime.toLocaleDateString();
  const startTimeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const eventTypeColor = event.event_type === 'meeting' ? '#3B82F6' : 
                        event.event_type === 'deadline' ? '#dc3545' : 
                        event.event_type === 'experiment' ? '#28a745' : '#6c757d';

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Calendar Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: ${eventTypeColor}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .event-details { background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background-color: ${eventTypeColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Event Reminder</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Kapelczak Laboratory</p>
        </div>
        <div class="content">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">You have an upcoming event:</p>
            
            <div class="event-details">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">${event.title}</h3>
                <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${eventDate}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> <span style="color: ${eventTypeColor}; text-transform: capitalize;">${event.event_type}</span></p>
                ${event.location ? `<p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${event.location}</p>` : ''}
                ${event.description ? `<div style="margin: 15px 0 0 0; padding: 10px; background-color: white; border-radius: 4px;"><strong>Description:</strong><br>${event.description}</div>` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6;">Don't forget to prepare for your upcoming event!</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/calendar" class="btn" style="color: white; text-decoration: none;">View Calendar</a>
        </div>
        <div class="footer">
            <p style="margin: 0;">© ${currentYear} Kapelczak Laboratory. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
}

serve(handler);
