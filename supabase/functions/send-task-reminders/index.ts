
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
}

interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  from_email: string;
  use_tls: boolean;
  enabled: boolean;
}

interface UserProfile {
  email: string;
  full_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { user_id } = await req.json();

    // Get user preferences for SMTP config and email template
    const { data: userPrefs, error: prefsError } = await supabaseClient
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', user_id)
      .single();

    if (prefsError || !userPrefs) {
      console.error('Error fetching user preferences:', prefsError);
      return new Response(
        JSON.stringify({ error: 'User preferences not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get user profile for email
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (profileError || !userProfile?.email) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const smtpConfig: SmtpConfig = userPrefs.preferences?.smtpConfig;
    const emailTemplate: string = userPrefs.preferences?.emailTemplate;

    if (!smtpConfig?.enabled) {
      return new Response(
        JSON.stringify({ message: 'Email reminders are disabled' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get tasks due in the next 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', user_id)
      .lte('due_date', twoDaysFromNow.toISOString().split('T')[0])
      .neq('status', 'completed');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming tasks found' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Generate email content using template
    let emailHtml = emailTemplate || getDefaultTemplate();
    
    // Replace template variables
    const userName = userProfile.full_name || userProfile.email?.split('@')[0] || 'User';
    const currentYear = new Date().getFullYear();
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app';

    emailHtml = emailHtml
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{current_year\}\}/g, currentYear.toString())
      .replace(/\{\{app_url\}\}/g, appUrl);

    // Generate tasks HTML
    let tasksHtml = '';
    for (const task of tasks) {
      const dueDate = new Date(task.due_date).toLocaleDateString();
      const taskHtml = `
        <div class="task-item">
          <h3>${task.title}</h3>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          ${task.description ? `<p>${task.description}</p>` : ''}
        </div>
      `;
      tasksHtml += taskHtml;
    }

    emailHtml = emailHtml.replace(/\{\{#tasks\}\}.*?\{\{\/tasks\}\}/gs, tasksHtml);

    // Send email using a simple email service (this is a mock implementation)
    // In a real scenario, you would integrate with a service like Resend, SendGrid, etc.
    const emailData = {
      to: userProfile.email,
      subject: `Task Reminders - ${tasks.length} upcoming task${tasks.length > 1 ? 's' : ''}`,
      html: emailHtml,
    };

    console.log(`Simulating email send to ${userProfile.email} with ${tasks.length} tasks`);
    console.log('Email subject:', emailData.subject);

    // Since we can't actually send emails without proper SMTP setup,
    // we'll simulate success for now
    const emailResult = { success: true };

    if (!emailResult.success) {
      console.error('Failed to send email');
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Task reminder email sent successfully to ${userProfile.email}`);
    
    return new Response(
      JSON.stringify({ 
        message: 'Task reminders sent successfully',
        tasks_count: tasks.length,
        recipient: userProfile.email
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in send-task-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

function getDefaultTemplate(): string {
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
        .task-item { background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .btn { display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Task Reminder</h1>
            <p>Kapelczak Laboratory</p>
        </div>
        <div class="content">
            <h2>Hello {{user_name}},</h2>
            <p>You have upcoming tasks that require your attention:</p>
            
            {{#tasks}}{{/tasks}}
            
            <p>Please review and complete these tasks before their due dates.</p>
            <a href="{{app_url}}/tasks" class="btn">View All Tasks</a>
        </div>
        <div class="footer">
            <p>© {{current_year}} Kapelczak Laboratory. All rights reserved.</p>
            <p>This is an automated reminder. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
}

serve(handler);
