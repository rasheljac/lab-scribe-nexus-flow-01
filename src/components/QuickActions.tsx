
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calendar, Users, BarChart3, Package } from "lucide-react";

const quickActions = [
  {
    icon: Plus,
    label: "New Experiment",
    description: "Start a new laboratory experiment",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: FileText,
    label: "Create Report",
    description: "Generate a new lab report",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Calendar,
    label: "Schedule Meeting",
    description: "Book time with team members",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Users,
    label: "Invite User",
    description: "Add new team member",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: BarChart3,
    label: "View Analytics",
    description: "Check lab performance metrics",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    icon: Package,
    label: "Check Inventory",
    description: "Review lab supplies and equipment",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-4 justify-start gap-3 border border-gray-200 hover:border-gray-300"
            >
              <div className={`${action.bgColor} p-2 rounded-lg`}>
                <action.icon className={`h-4 w-4 ${action.color}`} />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
