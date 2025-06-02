
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit,
  Calendar,
  User,
  GripVertical
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useTasks, Task } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import EditTaskDialog from "@/components/EditTaskDialog";

const DashboardTaskList = () => {
  const { tasks, isLoading, updateTask, deleteTask, saveTaskOrder, getSavedTaskOrder } = useTasks();
  const { toast } = useToast();
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);

  // Load and apply saved task order
  useEffect(() => {
    const loadTaskOrder = async () => {
      if (tasks.length > 0) {
        const savedOrder = await getSavedTaskOrder();
        const latestTasks = [...tasks]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10);

        if (savedOrder.length > 0) {
          // Apply saved order, then add any new tasks not in the saved order
          const orderedByPreference: Task[] = [];
          const remainingTasks = [...latestTasks];

          // First, add tasks in the saved order
          savedOrder.forEach(taskId => {
            const taskIndex = remainingTasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              orderedByPreference.push(remainingTasks[taskIndex]);
              remainingTasks.splice(taskIndex, 1);
            }
          });

          // Then add any remaining tasks (new ones not in saved order)
          const finalOrder = [...orderedByPreference, ...remainingTasks];
          setOrderedTasks(finalOrder);
        } else {
          // No saved order, use default (latest first)
          setOrderedTasks(latestTasks);
        }
      }
    };

    loadTaskOrder();
  }, [tasks, getSavedTaskOrder]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStatusChange = async (task: Task, newStatus: "pending" | "in_progress" | "completed") => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        status: newStatus,
      });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(orderedTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedTasks(items);
    
    // Save the new order to user preferences
    const taskIds = items.map(task => task.id);
    await saveTaskOrder(taskIds);
    
    toast({
      title: "Tasks Reordered",
      description: "Task order has been saved and will be remembered",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks (Latest 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {orderedTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <h3 className="font-medium text-sm">{task.title}</h3>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <EditTaskDialog task={task} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 ml-7">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {task.description && (
                            <div className="mt-3 ml-7">
                              <div 
                                className="text-gray-700 prose prose-sm max-w-none text-xs"
                                dangerouslySetInnerHTML={{ __html: task.description }}
                              />
                            </div>
                          )}

                          <div className="mt-4 flex gap-2 ml-7">
                            <Button
                              size="sm"
                              variant={task.status === "pending" ? "default" : "outline"}
                              onClick={() => handleStatusChange(task, "pending")}
                              disabled={updateTask.isPending}
                              className="text-xs"
                            >
                              Pending
                            </Button>
                            <Button
                              size="sm"
                              variant={task.status === "in_progress" ? "default" : "outline"}
                              onClick={() => handleStatusChange(task, "in_progress")}
                              disabled={updateTask.isPending}
                              className="text-xs"
                            >
                              In Progress
                            </Button>
                            <Button
                              size="sm"
                              variant={task.status === "completed" ? "default" : "outline"}
                              onClick={() => handleStatusChange(task, "completed")}
                              disabled={updateTask.isPending}
                              className="text-xs"
                            >
                              Completed
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {orderedTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No tasks found.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

export default DashboardTaskList;
