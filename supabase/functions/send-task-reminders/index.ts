
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  due_date: string;
  category: string;
  user_id: string;
  last_reminder_sent: string | null;
}

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get user profile for email
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('user_id', user_id)
      .single();

    if (profileError || !userProfile?.email) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get tasks due in the next 3 days that haven't had reminders sent recently
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user_id)
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])
      .neq('status', 'completed')
      .or(`last_reminder_sent.is.null,last_reminder_sent.lt.${oneDayAgo.toISOString()}`);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming tasks found that need reminders' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate email content
    const userName = userProfile.first_name 
      ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim()
      : userProfile.email?.split('@')[0] || 'User';

    const emailHtml = generateTaskReminderEmail(userName, tasks);

    // Send email using Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'Kapelczak Laboratory <noreply@resend.dev>',
        to: [userProfile.email],
        subject: `Task Reminders - ${tasks.length} upcoming task${tasks.length > 1 ? 's' : ''}`,
        html: emailHtml,
      });

      if (emailResult.error) {
        console.error('Resend error:', emailResult.error);
        return new Response(
          JSON.stringify({ error: 'Failed to send email', details: emailResult.error }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Update last_reminder_sent for all tasks
      const taskIds = tasks.map(task => task.id);
      const { error: updateError } = await supabaseClient
        .from('tasks')
        .update({ last_reminder_sent: new Date().toISOString() })
        .in('id', taskIds);

      if (updateError) {
        console.error('Error updating reminder timestamps:', updateError);
      }

      console.log(`Task reminder email sent successfully to ${userProfile.email}`, emailResult);
      
      return new Response(
        JSON.stringify({ 
          message: 'Task reminders sent successfully',
          tasks_count: tasks.length,
          recipient: userProfile.email,
          email_id: emailResult.data?.id
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

  } catch (error) {
    console.error('Error in send-task-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

function generateTaskReminderEmail(userName: string, tasks: Task[]): string {
  const currentYear = new Date().getFullYear();
  
  let tasksHtml = '';
  for (const task of tasks) {
    const dueDate = new Date(task.due_date).toLocaleDateString();
    const priorityColor = task.priority === 'high' ? '#dc3545' : task.priority === 'medium' ? '#ffc107' : '#28a745';
    const statusColor = task.status === 'pending' ? '#6c757d' : '#007bff';
    
    tasksHtml += `
      <div style="background-color: #f8f9fa; border-left: 4px solid ${priorityColor}; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">${task.title}</h3>
        <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong> ${dueDate}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong> <span style="color: ${priorityColor}; text-transform: capitalize;">${task.priority}</span></p>
        <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> <span style="color: ${statusColor}; text-transform: capitalize;">${task.status.replace('_', ' ')}</span></p>
        <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${task.category}</p>
        ${task.description ? `<p style="margin: 10px 0 0 0; color: #333;">${task.description}</p>` : ''}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Task Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .btn { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Task Reminder</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Kapelczak Laboratory</p>
        </div>
        <div class="content">
            <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">You have upcoming tasks that require your attention:</p>
            
            ${tasksHtml}
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px;">Please review and complete these tasks before their due dates.</p>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/tasks" class="btn" style="color: white; text-decoration: none;">View All Tasks</a>
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
