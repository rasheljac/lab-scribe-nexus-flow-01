
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

type EventType = "meeting" | "maintenance" | "experiment" | "training" | "booking";
type EventStatus = "scheduled" | "cancelled" | "completed";

interface FormData {
  title: string;
  description: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  location: string;
  attendees: string[];
  status: EventStatus;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  reminder_sent: boolean;
}

interface CreateEventDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultEventType?: EventType;
}

const CreateEventDialog = ({ open: controlledOpen, onOpenChange, defaultEventType }: CreateEventDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    event_type: defaultEventType || "meeting",
    start_time: "",
    end_time: "",
    location: "",
    attendees: [],
    status: "scheduled",
    reminder_enabled: false,
    reminder_minutes_before: 15,
    reminder_sent: false,
  });

  const { createEvent } = useCalendarEvents();
  const { toast } = useToast();

  // Use controlled or uncontrolled state for dialog open
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Update event type when defaultEventType changes
  useEffect(() => {
    if (defaultEventType) {
      setFormData(prev => ({ ...prev, event_type: defaultEventType }));
    }
  }, [defaultEventType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createEvent.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        event_type: defaultEventType || "meeting",
        start_time: "",
        end_time: "",
        location: "",
        attendees: [],
        status: "scheduled",
        reminder_enabled: false,
        reminder_minutes_before: 15,
        reminder_sent: false,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Event</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter event description..."
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="event_type">Event Type</Label>
          <Select 
            value={formData.event_type} 
            onValueChange={(value: EventType) => 
              setFormData({ ...formData, event_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="experiment">Experiment</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="booking">Booking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reminder_enabled"
              checked={formData.reminder_enabled}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, reminder_enabled: checked as boolean })
              }
            />
            <Label htmlFor="reminder_enabled">Enable reminder</Label>
          </div>
          
          {formData.reminder_enabled && (
            <div>
              <Label htmlFor="reminder_minutes">Remind me (minutes before)</Label>
              <Select
                value={formData.reminder_minutes_before.toString()}
                onValueChange={(value) => 
                  setFormData({ ...formData, reminder_minutes_before: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createEvent.isPending}>
            {createEvent.isPending ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // If controlled (has onOpenChange), don't render the trigger button
  if (onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // If uncontrolled, render with trigger button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};

export default CreateEventDialog;
