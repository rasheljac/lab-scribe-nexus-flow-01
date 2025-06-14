
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { Search, Calendar, FolderOpen, BarChart3, Loader2, Eye, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import EditProjectDialog from "@/components/EditProjectDialog";
import { useProjects } from "@/hooks/useProjects";
import { useExperiments } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { projects, isLoading, error, deleteProject } = useProjects();
  const { experiments } = useExperiments();

  // Update search params when search term changes
  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const getProjectExperiments = (projectId: string) => {
    return experiments.filter(exp => exp.project_id === projectId);
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && stripHtmlTags(project.description).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}/experiments`);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast({
        title: "Success",
        description: "Project deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <p className="text-red-600">Error loading projects: {error.message}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                <p className="text-gray-600 mt-1">Organize and track your research projects</p>
              </div>
              <CreateProjectDialog />
            </div>

            {/* Search */}
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
            </div>

            {/* Results Count */}
            {!isLoading && (
              <div className="text-sm text-gray-600">
                Showing {paginatedProjects.length} of {filteredProjects.length} projects
                {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </div>
            )}

            {/* Projects Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProjects.map((project) => {
                    const projectExperiments = getProjectExperiments(project.id);
                    return (
                      <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3" onClick={() => handleProjectClick(project.id)}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-5 w-5 text-blue-600" />
                              <CardTitle className="text-lg hover:text-blue-600">
                                {project.title}
                              </CardTitle>
                            </div>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{project.title}"? This action cannot be undone and will also delete all associated experiments.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {project.description ? stripHtmlTags(project.description) : ""}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4" onClick={() => handleProjectClick(project.id)}>
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
                              <span>{project.start_date} - {project.end_date || "Ongoing"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span>{projectExperiments.length} experiments</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between items-center pt-2">
                            <Badge variant="outline">{project.category}</Badge>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <EditProjectDialog project={project} />
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProjectClick(project.id);
                                }}
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            </div>
                          </div>
                          
                          {project.budget && (
                            <div className="text-sm font-medium text-green-600 text-center">
                              Budget: {project.budget}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {paginatedProjects.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12">
                      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No projects found. Create your first project to get started.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage - 1);
                              }}
                            />
                          </PaginationItem>
                        )}
                        
                        {currentPage > 3 && totalPages > 5 && (
                          <>
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(1);
                                }}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          </>
                        )}
                        
                        {getPageNumbers().map((pageNum) => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={pageNum === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(pageNum);
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        {currentPage < totalPages - 2 && totalPages > 5 && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(totalPages);
                                }}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage + 1);
                              }}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projects;
