
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateEventDialog from "@/components/CreateEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { events, isLoading } = useCalendarEvents();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getFormattedDateForDay = (day: number | null) => {
    if (!day) return null;
    const date = new Date(currentDate);
    date.setDate(day);
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    
    const dateStr = getFormattedDateForDay(day);
    if (!dateStr) return [];

    return events.filter(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "meeting":
        return "bg-blue-500";
      case "maintenance":
        return "bg-orange-500";
      case "experiment":
        return "bg-green-500";
      case "training":
        return "bg-purple-500";
      case "booking":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  const upcomingEvents = [...events]
    .filter(event => new Date(event.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 4);

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-600 mt-1">Schedule and manage lab activities</p>
              </div>
              <CreateEventDialog />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {formatDate(currentDate)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <Button
                            variant={view === "month" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setView("month")}
                          >
                            Month
                          </Button>
                          <Button
                            variant={view === "week" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setView("week")}
                          >
                            Week
                          </Button>
                          <Button
                            variant={view === "day" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setView("day")}
                          >
                            Day
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {view === "month" && (
                      <div className="grid grid-cols-7 gap-1">
                        {/* Day headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar days */}
                        {getDaysInMonth(currentDate).map((day, index) => {
                          const dayEvents = getEventsForDate(day);
                          return (
                            <div
                              key={index}
                              className={`min-h-[100px] p-2 border border-gray-200 ${
                                day ? "bg-white hover:bg-gray-50" : "bg-gray-50"
                              }`}
                            >
                              {day && (
                                <>
                                  <div className="text-sm font-medium mb-1">{day}</div>
                                  <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                      <div
                                        key={event.id}
                                        className={`text-xs p-1 rounded text-white ${getEventColor(event.event_type)} cursor-pointer`}
                                        onClick={() => setSelectedEvent(event)}
                                      >
                                        {event.title}
                                      </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                      <div 
                                        className="text-xs text-gray-500 cursor-pointer hover:underline"
                                        onClick={() => {
                                          // TODO: Show all events for the day
                                          console.log("Show all events for day", day);
                                        }}
                                      >
                                        +{dayEvents.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full ${getEventColor(event.event_type)} mt-1 flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{event.title}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatEventTime(event.start_time, event.end_time)}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Users className="h-3 w-3" />
                                  <span>{event.attendees.length} attendees</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingEvents.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No upcoming events
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      Schedule Meeting
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      Book Equipment
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      Set Reminder
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {selectedEvent && (
            <EventDetailsDialog 
              event={selectedEvent}
              open={!!selectedEvent}
              onOpenChange={(open) => {
                if (!open) setSelectedEvent(null);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Calendar;
