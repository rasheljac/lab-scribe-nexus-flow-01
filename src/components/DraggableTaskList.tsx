
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Calendar, User, CheckSquare, Clock, AlertCircle, Trash2 } from "lucide-react";
import EditTaskDialog from "@/components/EditTaskDialog";
import { useTasks, Task } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";

interface DraggableTaskListProps {
  tasks: Task[];
  searchTerm: string;
  filterStatus: string;
  filterPriority: string;
}

const DraggableTaskList = ({ 
  tasks, 
  searchTerm, 
  filterStatus, 
  filterPriority 
}: DraggableTaskListProps) => {
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const { updateTask, deleteTask, saveTaskOrder, getSavedTaskOrder } = useTasks();
  const { toast } = useToast();

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

  // Apply filters to tasks
  const filteredTasks = orderedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Initialize task order
  useEffect(() => {
    const initializeTaskOrder = async () => {
      if (tasks.length === 0) {
        setOrderedTasks([]);
        return;
      }

      const savedOrder = await getSavedTaskOrder();
      
      if (savedOrder.length > 0) {
        // Reorder tasks based on saved order
        const orderedTaskList: Task[] = [];
        const taskMap = new Map(tasks.map(task => [task.id, task]));
        
        // Add tasks in saved order
        savedOrder.forEach(taskId => {
          const task = taskMap.get(taskId);
          if (task) {
            orderedTaskList.push(task);
            taskMap.delete(taskId);
          }
        });
        
        // Add any new tasks that weren't in the saved order
        taskMap.forEach(task => {
          orderedTaskList.push(task);
        });
        
        setOrderedTasks(orderedTaskList);
      } else {
        setOrderedTasks(tasks);
      }
    };

    initializeTaskOrder();
  }, [tasks, getSavedTaskOrder]);

  const handleTaskStatusChange = (taskId: string, completed: boolean) => {
    const newStatus = completed ? "completed" : "pending";
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the ordered tasks with the new order
    const newOrderedTasks = [...orderedTasks];
    const sourceTask = orderedTasks[result.source.index];
    const destIndex = result.destination.index;
    
    // Remove from original position
    const sourceIndex = newOrderedTasks.findIndex(task => task.id === sourceTask.id);
    newOrderedTasks.splice(sourceIndex, 1);
    
    // Insert at new position
    newOrderedTasks.splice(destIndex, 0, sourceTask);
    
    setOrderedTasks(newOrderedTasks);

    // Save the new order
    const taskIds = newOrderedTasks.map(task => task.id);
    await saveTaskOrder(taskIds);
    
    toast({
      title: "Success",
      description: "Task order saved!",
    });
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No tasks found. Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {filteredTasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`hover:shadow-md transition-shadow ${
                      snapshot.isDragging ? "shadow-lg" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Checkbox 
                            id={`task-${task.id}`}
                            checked={task.status === "completed"}
                            onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <h3 className="font-semibold text-lg">{task.title}</h3>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <div 
                              className="text-gray-600 mb-3 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: task.description || 'No description' }}
                            />
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{task.assignee}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{task.due_date}</span>
                              </div>
                              <Badge variant="outline">{task.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
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
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableTaskList;
