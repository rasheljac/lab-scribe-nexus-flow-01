
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
      .select('preferences, email')
      .eq('user_id', user_id)
      .single();

    if (prefsError || !userPrefs) {
      console.error('Error fetching user preferences:', prefsError);
      return new Response(
        JSON.stringify({ error: 'User preferences not found' }),
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
    const userName = userPrefs.email?.split('@')[0] || 'User';
    const currentYear = new Date().getFullYear();
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.lovable.app';

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

    // Send email using SMTP
    const emailData = {
      to: userPrefs.email,
      subject: `Task Reminders - ${tasks.length} upcoming task${tasks.length > 1 ? 's' : ''}`,
      html: emailHtml,
    };

    const emailResult = await sendEmail(smtpConfig, emailData);

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResult.error }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Task reminder email sent successfully to ${userPrefs.email}`);
    
    return new Response(
      JSON.stringify({ 
        message: 'Task reminders sent successfully',
        tasks_count: tasks.length,
        recipient: userPrefs.email
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

async function sendEmail(smtpConfig: SmtpConfig, emailData: any) {
  try {
    const auth = btoa(`${smtpConfig.username}:${smtpConfig.password}`);
    
    // Use a simple SMTP client implementation
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'gmail', // This would need to be configured based on the SMTP provider
        template_id: 'template_custom',
        user_id: smtpConfig.username,
        template_params: {
          to_email: emailData.to,
          from_email: smtpConfig.from_email,
          subject: emailData.subject,
          message_html: emailData.html,
        }
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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
