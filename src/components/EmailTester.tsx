
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaskReminders } from '@/hooks/useTaskReminders';
import { useCalendarReminders } from '@/hooks/useCalendarReminders';
import { Loader2, Mail, Calendar, CheckCircle } from 'lucide-react';

const EmailTester = () => {
  const [testEmail, setTestEmail] = useState('');
  const { testEmailConfiguration } = useTaskReminders();
  const { sendCalendarReminders } = useCalendarReminders();

  const handleTestTaskReminders = () => {
    if (!testEmail) return;
    testEmailConfiguration.mutate(testEmail);
  };

  const handleTestCalendarReminders = () => {
    sendCalendarReminders.mutate();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration Test
          </CardTitle>
          <CardDescription>
            Test your email configuration by sending sample notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email to test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleTestTaskReminders}
              disabled={!testEmail || testEmailConfiguration.isPending}
              className="flex items-center gap-2"
            >
              {testEmailConfiguration.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Test Task Reminders
            </Button>
            
            <Button
              onClick={handleTestCalendarReminders}
              disabled={sendCalendarReminders.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              {sendCalendarReminders.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Process Calendar Reminders
            </Button>
          </div>

          {(testEmailConfiguration.isSuccess || sendCalendarReminders.isSuccess) && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Email test completed successfully
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTester;
