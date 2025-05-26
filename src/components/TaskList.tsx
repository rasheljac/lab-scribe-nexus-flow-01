
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, Clock, AlertCircle, User, Calendar, Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const TaskList = () => {
  const { tasks, updateTask } = useTasks();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get recent tasks (limit to 5 for dashboard)
  const recentTasks = tasks.slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    const newStatus = completed ? "completed" : "pending";
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Task Overview
        </CardTitle>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate("/tasks")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox 
                checked={task.status === "completed"}
                onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{task.due_date}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
          {recentTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks found</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 gap-2"
                onClick={() => navigate("/tasks")}
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
