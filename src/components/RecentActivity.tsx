
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, FileText, Beaker, CheckSquare } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "experiment",
    title: "Protein Analysis Experiment Updated",
    user: "Dr. Sarah Chen",
    time: "2 hours ago",
    status: "in_progress",
    icon: Beaker,
  },
  {
    id: 2,
    type: "report",
    title: "Monthly Lab Report Generated",
    user: "Dr. John Doe",
    time: "4 hours ago",
    status: "completed",
    icon: FileText,
  },
  {
    id: 3,
    type: "task",
    title: "Equipment Calibration Completed",
    user: "Lab Tech Mike",
    time: "6 hours ago",
    status: "completed",
    icon: CheckSquare,
  },
  {
    id: 4,
    type: "experiment",
    title: "Cell Culture Study Started",
    user: "Dr. Lisa Wong",
    time: "1 day ago",
    status: "started",
    icon: Beaker,
  },
];

const RecentActivity = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "started":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "started":
        return "Started";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-white p-2 rounded-lg">
                <activity.icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <Badge className={getStatusColor(activity.status)}>
                    {getStatusText(activity.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
