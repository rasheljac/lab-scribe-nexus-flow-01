
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
  GripVertical,
  Calendar,
  User
} from "lucide-react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";
import EditTaskDialog from "@/components/EditTaskDialog";

const DraggableTaskList = () => {
  const { tasks, isLoading, updateTask, deleteTask, saveTaskOrder, getSavedTaskOrder } = useTasks();
  const { toast } = useToast();
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);

  // Load tasks and their saved order
  useEffect(() => {
    if (tasks.length === 0) return;

    const loadTasksWithOrder = async () => {
      try {
        const savedOrder = await getSavedTaskOrder();
        
        // If there's a saved order, use it to arrange tasks
        if (savedOrder.length > 0) {
          const taskMap = new Map(tasks.map(task => [task.id, task]));
          
          // First, add tasks that are in the saved order
          const orderedList = savedOrder
            .filter(id => taskMap.has(id))
            .map(id => taskMap.get(id)!);
          
          // Then add any tasks that weren't in the saved order
          const remainingTasks = tasks.filter(task => !savedOrder.includes(task.id));
          setOrderedTasks([...orderedList, ...remainingTasks]);
        } else {
          // No saved order, use tasks as they are
          setOrderedTasks([...tasks]);
        }
      } catch (error) {
        console.error("Failed to load task order:", error);
        setOrderedTasks([...tasks]);
      }
    };

    loadTasksWithOrder();
  }, [tasks, getSavedTaskOrder]);

  // Save the current task order to user preferences
  const handleSaveTaskOrder = async () => {
    try {
      const taskIds = orderedTasks.map(task => task.id);
      await saveTaskOrder(taskIds);
    } catch (error) {
      console.error("Failed to save task order:", error);
      toast({
        title: "Error",
        description: "Failed to save task order",
        variant: "destructive",
      });
    }
  };

  // Handle drag end event
  const onDragEnd = (result: any) => {
    // Drop outside the list
    if (!result.destination) {
      return;
    }

    // Same position
    if (result.destination.index === result.source.index) {
      return;
    }

    const reordered = [...orderedTasks];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setOrderedTasks(reordered);
    // Save the new order
    setTimeout(() => {
      handleSaveTaskOrder();
    }, 100);
  };

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

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            className="space-y-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {orderedTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="relative"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              {...provided.dragHandleProps} 
                              className="cursor-move hover:text-gray-700 text-gray-400"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>
                            {getStatusIcon(task.status)}
                            <CardTitle className="text-lg">{task.title}</CardTitle>
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
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: task.description || 'No description' }}
                        />
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant={task.status === "pending" ? "default" : "outline"}
                            onClick={() => handleStatusChange(task, "pending")}
                            disabled={updateTask.isPending}
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            variant={task.status === "in_progress" ? "default" : "outline"}
                            onClick={() => handleStatusChange(task, "in_progress")}
                            disabled={updateTask.isPending}
                          >
                            In Progress
                          </Button>
                          <Button
                            size="sm"
                            variant={task.status === "completed" ? "default" : "outline"}
                            onClick={() => handleStatusChange(task, "completed")}
                            disabled={updateTask.isPending}
                          >
                            Completed
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
  );
};

export default DraggableTaskList;
