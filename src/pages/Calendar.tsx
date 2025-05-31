
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2 
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateEventDialog from "@/components/CreateEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek, addDays } from "date-fns";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  const { events, isLoading, error } = useCalendarEvents();

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start_time), date)
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "experiment":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "conference":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Use consistent date calculations for the main calendar grid
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <p className="text-red-600">Error loading calendar events: {error.message}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Laboratory Calendar</h1>
                <p className="text-gray-600 mt-1">Schedule and manage laboratory activities</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setCreateEventOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar Navigation and Mini Calendar */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {format(selectedDate, "MMMM yyyy")}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateMonth("prev")}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateMonth("next")}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      weekStartsOn={0}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                {/* Today's Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getEventsForDate(new Date()).map((event) => (
                          <div
                            key={event.id}
                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getEventTypeColor(event.event_type)}>
                                {event.event_type}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(parseISO(event.start_time), "HH:mm")}</span>
                            </div>
                          </div>
                        ))}
                        {getEventsForDate(new Date()).length === 0 && (
                          <p className="text-gray-500 text-sm">No events today</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Main Calendar View */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {format(selectedDate, "MMMM yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar days - using calendarDays instead of monthDays */}
                        {calendarDays.map((day) => {
                          const dayEvents = getEventsForDate(day);
                          const isToday = isSameDay(day, new Date());
                          const isSelected = isSameDay(day, selectedDate);
                          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                          
                          return (
                            <div
                              key={day.toISOString()}
                              className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                isToday ? "bg-blue-50 border-blue-200" : "border-gray-200"
                              } ${isSelected ? "ring-2 ring-blue-500" : ""} ${
                                !isCurrentMonth ? "opacity-50" : ""
                              }`}
                              onClick={() => setSelectedDate(day)}
                            >
                              <div className={`text-sm font-medium mb-1 ${
                                isToday ? "text-blue-600" : isCurrentMonth ? "text-gray-900" : "text-gray-400"
                              }`}>
                                {format(day, "d")}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                  <div
                                    key={event.id}
                                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEvent(event);
                                    }}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <CreateEventDialog open={createEventOpen} onOpenChange={setCreateEventOpen} />
      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Calendar;
