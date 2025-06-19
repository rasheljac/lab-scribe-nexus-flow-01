
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { 
  Search, 
  Lightbulb, 
  Clock, 
  Target,
  Trash2,
  Loader2,
  ArrowRight,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateIdeaDialog from "@/components/CreateIdeaDialog";
import EditIdeaDialog from "@/components/EditIdeaDialog";
import IdeaReportDialog from "@/components/IdeaReportDialog";
import RichTextDisplay from "@/components/RichTextDisplay";
import DraggableGrid from "@/components/DraggableGrid";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

const ExperimentIdeas = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { ideas, isLoading, error, deleteIdea, convertToExperiment, updateIdeaOrder } = useExperimentIdeas();

  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <Target className="h-4 w-4 text-green-600" />;
      case "planning":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "researching":
        return <Search className="h-4 w-4 text-orange-600" />;
      case "brainstorming":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "researching":
        return "bg-orange-100 text-orange-800";
      case "brainstorming":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idea.description && idea.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (idea.hypothesis && idea.hypothesis.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || idea.status === filterStatus;
    const matchesPriority = filterPriority === "all" || idea.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || idea.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredIdeas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentIdeas = filteredIdeas.slice(startIndex, endIndex);

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await deleteIdea.mutateAsync(ideaId);
      toast({
        title: "Success",
        description: "Experiment idea deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast({
        title: "Error",
        description: "Failed to delete experiment idea",
        variant: "destructive",
      });
    }
  };

  const handleConvertToExperiment = async (ideaId: string, ideaTitle: string) => {
    try {
      await convertToExperiment.mutateAsync(ideaId);
      toast({
        title: "Success",
        description: `"${ideaTitle}" converted to experiment successfully!`,
      });
    } catch (error) {
      console.error("Error converting idea:", error);
      toast({
        title: "Error",
        description: "Failed to convert idea to experiment",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (reorderedItems: any[]) => {
    // Update the order based on global position, not just current page
    const reorderedWithGlobalOrder = reorderedItems.map((item, index) => ({
      id: item.id,
      display_order: startIndex + index + 1
    }));

    try {
      await updateIdeaOrder.mutateAsync(reorderedWithGlobalOrder);
    } catch (error) {
      console.error("Error updating idea order:", error);
      toast({
        title: "Error",
        description: "Failed to update idea order",
        variant: "destructive",
      });
    }
  };

  const renderIdeaCard = (idea: any, index: number) => (
    <Card key={idea.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {getStatusIcon(idea.status)}
            <CardTitle className="text-lg">{idea.title}</CardTitle>
          </div>
          <div className="flex gap-1 items-center">
            <Badge className={getStatusColor(idea.status)}>
              {idea.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(idea.priority)}>
              {idea.priority}
            </Badge>
          </div>
        </div>
        {idea.description && (
          <RichTextDisplay 
            content={idea.description}
            className="text-sm text-gray-600 mt-2"
            maxLength={150}
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {idea.hypothesis && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-1">Hypothesis</h4>
            <RichTextDisplay 
              content={idea.hypothesis}
              className="text-sm text-gray-600"
              maxLength={100}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {idea.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{idea.estimated_duration}</span>
            </div>
          )}
          {idea.budget_estimate && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span>{idea.budget_estimate}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Badge variant="outline">{idea.category}</Badge>
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {idea.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {idea.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/experiment-ideas/${idea.id}/notes`)}
            className="gap-1"
          >
            <FileText className="h-3 w-3" />
            Notes
          </Button>
          <EditIdeaDialog idea={idea} />
          <IdeaReportDialog 
            ideaId={idea.id} 
            ideaTitle={idea.title}
            variant="single" 
          />
          {idea.status === 'ready' && (
            <Button
              size="sm"
              onClick={() => handleConvertToExperiment(idea.id, idea.title)}
              disabled={convertToExperiment.isPending}
              className="gap-1"
            >
              <ArrowRight className="h-3 w-3" />
              Convert
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6 ml-auto">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Experiment Idea</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{idea.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteIdea(idea.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <p className="text-red-600">Error loading experiment ideas: {error.message}</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Experiment Ideas</h1>
                <p className="text-gray-600 mt-1">Document and develop your experimental concepts</p>
              </div>
              <div className="flex gap-2">
                <IdeaReportDialog variant="all" />
                <CreateIdeaDialog />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="brainstorming">Brainstorming</SelectItem>
                  <SelectItem value="researching">Researching</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="molecular-biology">Molecular Biology</SelectItem>
                  <SelectItem value="cell-biology">Cell Biology</SelectItem>
                  <SelectItem value="genetics">Genetics</SelectItem>
                  <SelectItem value="microbiology">Microbiology</SelectItem>
                  <SelectItem value="immunology">Immunology</SelectItem>
                  <SelectItem value="neuroscience">Neuroscience</SelectItem>
                  <SelectItem value="pharmacology">Pharmacology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {currentIdeas.length > 0 ? (
                  <DraggableGrid
                    items={currentIdeas}
                    onReorder={handleReorder}
                    renderItem={renderIdeaCard}
                    droppableId="experiment-ideas"
                  />
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? "No experiment ideas found matching your search." : "No experiment ideas found. Create your first idea to get started."}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Items count */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  Showing {Math.min(startIndex + 1, filteredIdeas.length)} to {Math.min(endIndex, filteredIdeas.length)} of {filteredIdeas.length} ideas
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExperimentIdeas;
