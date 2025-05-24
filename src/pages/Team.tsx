
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Mail, Phone, Calendar, Users, UserPlus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const teamMembers = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Principal Investigator",
    department: "Biochemistry",
    email: "sarah.chen@kapelczak.com",
    phone: "+1 (555) 123-4567",
    avatar: "/avatars/sarah.jpg",
    status: "active",
    joinDate: "2022-03-15",
    expertise: ["Protein Analysis", "X-ray Crystallography"],
    currentProjects: 3,
    experimentsCompleted: 45,
  },
  {
    id: 2,
    name: "Dr. John Doe",
    role: "Senior Researcher",
    department: "Molecular Biology",
    email: "john.doe@kapelczak.com",
    phone: "+1 (555) 234-5678",
    avatar: "/avatars/john.jpg",
    status: "active",
    joinDate: "2021-11-20",
    expertise: ["Cell Culture", "Gene Expression"],
    currentProjects: 2,
    experimentsCompleted: 38,
  },
  {
    id: 3,
    name: "Dr. Lisa Wong",
    role: "Research Scientist",
    department: "Pharmacology",
    email: "lisa.wong@kapelczak.com",
    phone: "+1 (555) 345-6789",
    avatar: "/avatars/lisa.jpg",
    status: "active",
    joinDate: "2023-01-10",
    expertise: ["Drug Discovery", "Compound Screening"],
    currentProjects: 4,
    experimentsCompleted: 22,
  },
  {
    id: 4,
    name: "Lab Tech Mike",
    role: "Laboratory Technician",
    department: "General Lab",
    email: "mike.tech@kapelczak.com",
    phone: "+1 (555) 456-7890",
    avatar: "/avatars/mike.jpg",
    status: "active",
    joinDate: "2020-08-05",
    expertise: ["Equipment Maintenance", "Sample Preparation"],
    currentProjects: 1,
    experimentsCompleted: 67,
  },
  {
    id: 5,
    name: "Dr. Emily Davis",
    role: "Postdoctoral Fellow",
    department: "Environmental Science",
    email: "emily.davis@kapelczak.com",
    phone: "+1 (555) 567-8901",
    avatar: "/avatars/emily.jpg",
    status: "inactive",
    joinDate: "2023-06-01",
    expertise: ["Microbiome Analysis", "Environmental Sampling"],
    currentProjects: 1,
    experimentsCompleted: 12,
  },
];

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const departments = [...new Set(teamMembers.map(member => member.department))];
  const roles = [...new Set(teamMembers.map(member => member.role))];

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
                <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600 mt-1">Manage your laboratory team members</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Team Calendar
                </Button>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Members</p>
                      <p className="text-xl font-bold">{teamMembers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Members</p>
                      <p className="text-xl font-bold">
                        {teamMembers.filter(member => member.status === "active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Departments</p>
                      <p className="text-xl font-bold">{departments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Projects</p>
                      <p className="text-xl font-bold">
                        {(teamMembers.reduce((sum, member) => sum + member.currentProjects, 0) / teamMembers.length).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-lg">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                        <p className="text-blue-600 font-medium text-sm">{member.role}</p>
                        <p className="text-gray-600 text-sm">{member.department}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {member.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">{member.currentProjects}</p>
                        <p className="text-xs text-gray-600">Active Projects</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{member.experimentsCompleted}</p>
                        <p className="text-xs text-gray-600">Experiments</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Team;
