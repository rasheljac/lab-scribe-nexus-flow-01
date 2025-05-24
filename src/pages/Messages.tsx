
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, MessageSquare, Plus, Paperclip, MoreVertical } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const conversations = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    lastMessage: "Can you review the protein analysis results?",
    timestamp: "2 min ago",
    unread: 2,
    avatar: "/avatars/sarah.jpg",
    online: true,
  },
  {
    id: 2,
    name: "Lab Team",
    lastMessage: "Meeting scheduled for tomorrow at 2 PM",
    timestamp: "15 min ago",
    unread: 0,
    avatar: "/avatars/team.jpg",
    online: false,
    isGroup: true,
  },
  {
    id: 3,
    name: "Dr. John Doe",
    lastMessage: "Thanks for the equipment calibration report",
    timestamp: "1 hour ago",
    unread: 1,
    avatar: "/avatars/john.jpg",
    online: false,
  },
  {
    id: 4,
    name: "Lab Tech Mike",
    lastMessage: "Inventory update completed",
    timestamp: "3 hours ago",
    unread: 0,
    avatar: "/avatars/mike.jpg",
    online: true,
  },
];

const messages = [
  {
    id: 1,
    sender: "Dr. Sarah Chen",
    content: "Hi! I've finished the protein analysis experiment. Could you take a look at the results when you have time?",
    timestamp: "10:30 AM",
    isOwn: false,
    avatar: "/avatars/sarah.jpg",
  },
  {
    id: 2,
    sender: "You",
    content: "Sure! I'll review them this afternoon. Can you share the data file?",
    timestamp: "10:32 AM",
    isOwn: true,
    avatar: "/avatars/you.jpg",
  },
  {
    id: 3,
    sender: "Dr. Sarah Chen",
    content: "I've uploaded the results to the shared drive. The file is named 'protein_analysis_results_2024.xlsx'",
    timestamp: "10:35 AM",
    isOwn: false,
    avatar: "/avatars/sarah.jpg",
  },
  {
    id: 4,
    sender: "You",
    content: "Perfect! I'll check it out and get back to you with feedback.",
    timestamp: "10:36 AM",
    isOwn: true,
    avatar: "/avatars/you.jpg",
  },
];

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-1">Communicate with your lab team</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle>Conversations</CardTitle>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.avatar} />
                              <AvatarFallback>
                                {conversation.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.name}
                                {conversation.isGroup && (
                                  <Badge variant="outline" className="ml-2">Group</Badge>
                                )}
                              </h3>
                              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                          </div>
                          {conversation.unread > 0 && (
                            <Badge className="bg-blue-600 text-white">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatars/sarah.jpg" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">Dr. Sarah Chen</h3>
                        <p className="text-sm text-gray-500">Online</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                      >
                        {!message.isOwn && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback>
                              {message.sender.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "text-right" : ""}`}>
                          <div
                            className={`p-3 rounded-lg ${
                              message.isOwn
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
