
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Filter, Calendar, Users, FolderOpen, BarChart3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const projects = [
  {
    id: 1,
    title: "Protein Structure Analysis",
    description: "Comprehensive analysis of bacterial protein structures using X-ray crystallography",
    status: "active",
    progress: 65,
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    teamMembers: ["Dr. Sarah Chen", "Dr. John Doe", "Lab Tech Mike"],
    experiments: 8,
    budget: "$50,000",
    category: "Biochemistry",
  },
  {
    id: 2,
    title: "Drug Discovery Pipeline",
    description: "Development of novel compounds for treating antibiotic-resistant bacteria",
    status: "planning",
    progress: 15,
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    teamMembers: ["Dr. Lisa Wong", "Dr. Mike Johnson"],
    experiments: 3,
    budget: "$75,000",
    category: "Pharmacology",
  },
  {
    id: 3,
    title: "Environmental Microbiome Study",
    description: "Analysis of microbial communities in various environmental samples",
    status: "completed",
    progress: 100,
    startDate: "2023-09-01",
    endDate: "2023-12-31",
    teamMembers: ["Dr. Emily Davis", "Dr. Tom Wilson", "Lab Tech Sarah"],
    experiments: 12,
    budget: "$30,000",
    category: "Environmental Science",
  },
];

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                <p className="text-gray-600 mt-1">Organize and track your research projects</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{project.startDate} - {project.endDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{project.teamMembers.length} team members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                        <span>{project.experiments} experiments</span>
                      </div>
                    </div>

                    {/* Budget and Category */}
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant="outline">{project.category}</Badge>
                      <span className="text-sm font-medium text-green-600">{project.budget}</span>
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

export default Projects;
