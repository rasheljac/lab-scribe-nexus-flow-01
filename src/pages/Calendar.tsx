
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const events = [
  {
    id: 1,
    title: "Lab Meeting",
    type: "meeting",
    time: "14:00 - 15:00",
    location: "Conference Room A",
    attendees: 8,
    date: "2024-01-24",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Equipment Maintenance",
    type: "maintenance",
    time: "09:00 - 11:00",
    location: "Lab B",
    attendees: 2,
    date: "2024-01-25",
    color: "bg-orange-500",
  },
  {
    id: 3,
    title: "Sample Collection",
    type: "experiment",
    time: "13:00 - 17:00",
    location: "Field Site",
    attendees: 4,
    date: "2024-01-26",
    color: "bg-green-500",
  },
  {
    id: 4,
    title: "Training Session",
    type: "training",
    time: "10:00 - 12:00",
    location: "Training Room",
    attendees: 12,
    date: "2024-01-27",
    color: "bg-purple-500",
  },
];

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

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

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `2024-01-${day.toString().padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
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
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
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
                                day ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-gray-50"
                              }`}
                            >
                              {day && (
                                <>
                                  <div className="text-sm font-medium mb-1">{day}</div>
                                  <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                      <div
                                        key={event.id}
                                        className={`text-xs p-1 rounded text-white ${event.color}`}
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
                      {events.slice(0, 4).map(event => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full ${event.color} mt-1 flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{event.title}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="h-3 w-3" />
                                <span>{event.attendees} attendees</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      <Plus className="h-4 w-4" />
                      Schedule Meeting
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <CalendarIcon className="h-4 w-4" />
                      Book Equipment
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Clock className="h-4 w-4" />
                      Set Reminder
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
