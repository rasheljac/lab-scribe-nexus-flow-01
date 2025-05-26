
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, FileText, Beaker, CheckSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateEventDialog from "@/components/CreateEventDialog";
import { useState } from "react";

const QuickActions = () => {
  const navigate = useNavigate();
  const [createEventOpen, setCreateEventOpen] = useState(false);

  const actions = [
    {
      title: "New Experiment",
      description: "Start a new research experiment",
      icon: Beaker,
      action: () => navigate("/experiments"),
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100"
    },
    {
      title: "Create Project",
      description: "Start a new research project",
      icon: Plus,
      action: () => navigate("/projects"),
      color: "bg-green-50 text-green-600 hover:bg-green-100"
    },
    {
      title: "Schedule Event",
      description: "Add a calendar event",
      icon: Calendar,
      action: () => setCreateEventOpen(true),
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100"
    },
    {
      title: "Add Task",
      description: "Create a new task",
      icon: CheckSquare,
      action: () => navigate("/tasks"),
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100"
    },
    {
      title: "Generate Report",
      description: "Create a new report",
      icon: FileText,
      action: () => navigate("/reports"),
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
    },
    {
      title: "Manage Team",
      description: "Add team members",
      icon: Users,
      action: () => navigate("/team"),
      color: "bg-pink-50 text-pink-600 hover:bg-pink-100"
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={action.action}
                className={`h-auto p-4 justify-start text-left ${action.color}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <action.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateEventDialog 
        open={createEventOpen} 
        onOpenChange={setCreateEventOpen}
      />
    </>
  );
};

export default QuickActions;
