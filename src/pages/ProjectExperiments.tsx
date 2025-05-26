
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ArrowLeft, 
  Beaker, 
  Calendar, 
  User, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useExperiments } from "@/hooks/useExperiments";
import { useProjects } from "@/hooks/useProjects";

const ProjectExperiments = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { experiments, isLoading, error } = useExperiments();
  const { projects } = useProjects();

  const project = projects.find(p => p.id === projectId);
  const projectExperiments = experiments.filter(exp => exp.project_id === projectId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "planning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Beaker className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredExperiments = projectExperiments.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleExperimentClick = (experimentId: string) => {
    navigate(`/experiments/${experimentId}/notes`);
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
                <p className="text-red-600">Error loading experiments: {error.message}</p>
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
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/projects")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {project?.title || "Project"} - Experiments
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {projectExperiments.length} experiments in this project
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search experiments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Experiments Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredExperiments.map((experiment) => (
                  <Card 
                    key={experiment.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleExperimentClick(experiment.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(experiment.status)}
                          <CardTitle className="text-lg">{experiment.title}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(experiment.status)}>
                          {experiment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{experiment.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{experiment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${experiment.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Experiment Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{experiment.researcher}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{experiment.start_date} - {experiment.end_date || "Ongoing"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{experiment.protocols} protocols, {experiment.samples} samples</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="pt-2">
                        <Badge variant="outline">{experiment.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredExperiments.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No experiments found in this project. 
                      {searchTerm ? " Try adjusting your search." : ""}
                    </p>
                    {!searchTerm && (
                      <Button 
                        className="mt-4 gap-2" 
                        onClick={() => navigate("/experiments")}
                      >
                        <Plus className="h-4 w-4" />
                        Create New Experiment
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectExperiments;
