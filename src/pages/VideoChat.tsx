
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Users, 
  Settings,
  Calendar,
  Plus
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const ongoingMeetings = [
  {
    id: 1,
    title: "Lab Team Standup",
    participants: ["Dr. Sarah Chen", "Dr. John Doe", "Lab Tech Mike"],
    startTime: "2:00 PM",
    duration: "15 min",
    status: "active",
  },
  {
    id: 2,
    title: "Project Review Meeting",
    participants: ["Dr. Lisa Wong", "Dr. Emily Davis"],
    startTime: "3:30 PM",
    duration: "45 min",
    status: "scheduled",
  },
];

const recentMeetings = [
  {
    id: 1,
    title: "Equipment Training Session",
    participants: 8,
    date: "2024-01-24",
    duration: "60 min",
    recording: true,
  },
  {
    id: 2,
    title: "Weekly Lab Meeting",
    participants: 12,
    date: "2024-01-23",
    duration: "45 min",
    recording: true,
  },
  {
    id: 3,
    title: "Experiment Review",
    participants: 4,
    date: "2024-01-22",
    duration: "30 min",
    recording: false,
  },
];

const VideoChat = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  const handleJoinCall = () => {
    setIsInCall(true);
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Video Chat</h1>
                <p className="text-gray-600 mt-1">Connect with your lab team via video calls</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Meeting
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start Instant Meeting
                </Button>
              </div>
            </div>

            {!isInCall ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Video Area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Start */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Quick Start
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-lg p-8 mb-6">
                          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Ready to start a meeting?</h3>
                          <p className="text-gray-600 mb-6">
                            Join an ongoing meeting or start an instant meeting with your team
                          </p>
                          <div className="flex justify-center gap-4">
                            <Button onClick={handleJoinCall} className="gap-2">
                              <Video className="h-4 w-4" />
                              Start Meeting
                            </Button>
                            <Button variant="outline" className="gap-2">
                              <Users className="h-4 w-4" />
                              Join Meeting
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Meetings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentMeetings.map((meeting) => (
                          <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <Video className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{meeting.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{meeting.date}</span>
                                  <span>{meeting.participants} participants</span>
                                  <span>{meeting.duration}</span>
                                  {meeting.recording && (
                                    <Badge variant="outline">Recorded</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {meeting.recording && (
                                <Button variant="outline" size="sm">
                                  Watch Recording
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Ongoing Meetings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ongoing Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ongoingMeetings.map((meeting) => (
                          <div key={meeting.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-sm">{meeting.title}</h3>
                              <Badge className={meeting.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {meeting.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              {meeting.startTime} • {meeting.duration}
                            </div>
                            <div className="flex items-center gap-1 mb-3">
                              {meeting.participants.slice(0, 3).map((participant, index) => (
                                <Avatar key={index} className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {participant.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {meeting.participants.length > 3 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  +{meeting.participants.length - 3} more
                                </span>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={handleJoinCall}
                            >
                              Join Meeting
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full gap-2">
                          <Monitor className="h-4 w-4" />
                          Screen Share Test
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                          <Settings className="h-4 w-4" />
                          Audio/Video Settings
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                          <Calendar className="h-4 w-4" />
                          View Calendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              /* Video Call Interface */
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                {/* Main Video */}
                <div className="lg:col-span-3">
                  <Card className="h-full">
                    <CardContent className="p-0 h-full">
                      <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Avatar className="h-32 w-32 mx-auto mb-4">
                              <AvatarFallback className="text-2xl">SC</AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-semibold">Dr. Sarah Chen</h3>
                            <p className="text-gray-300">Presenting screen</p>
                          </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                            <Button
                              size="sm"
                              variant={isAudioOn ? "secondary" : "destructive"}
                              onClick={() => setIsAudioOn(!isAudioOn)}
                            >
                              {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant={isVideoOn ? "secondary" : "destructive"}
                              onClick={() => setIsVideoOn(!isVideoOn)}
                            >
                              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Monitor className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={handleLeaveCall}
                            >
                              <PhoneOff className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Participants */}
                <div>
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Participants (3)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {["Dr. Sarah Chen", "Dr. John Doe", "You"].map((participant, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {participant.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{participant}</p>
                            <div className="flex items-center gap-1">
                              <Mic className="h-3 w-3 text-green-500" />
                              <Video className="h-3 w-3 text-green-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoChat;
