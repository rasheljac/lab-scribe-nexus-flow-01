
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Loader2 } from "lucide-react";
import { useProjectExperimentReports } from "@/hooks/useProjectExperimentReports";
import { useProjects } from "@/hooks/useProjects";
import { useExperiments } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";

interface EnhancedReportDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EnhancedReportDialog = ({ open, onOpenChange }: EnhancedReportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<"project" | "experiment">("project");
  const [selectedId, setSelectedId] = useState("");
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);

  const { generateProjectReport, generateExperimentReport } = useProjectExperimentReports();
  const { projects } = useProjects();
  const { experiments } = useExperiments();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedId) {
      toast({
        title: "Error",
        description: `Please select a ${reportType}`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (reportType === "project") {
        const project = projects.find(p => p.id === selectedId);
        if (!project) throw new Error("Project not found");
        
        await generateProjectReport.mutateAsync({
          projectId: selectedId,
          projectTitle: project.title,
          includeNotes,
          includeAttachments
        });
      } else {
        const experiment = experiments.find(e => e.id === selectedId);
        if (!experiment) throw new Error("Experiment not found");
        
        await generateExperimentReport.mutateAsync({
          experimentId: selectedId,
          experimentTitle: experiment.title,
          includeNotes,
          includeAttachments
        });
      }

      toast({
        title: "Success",
        description: "Report generated and downloaded successfully",
      });
      
      setSelectedId("");
      const shouldClose = onOpenChange ? true : true;
      if (shouldClose) {
        onOpenChange?.(false);
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const isGenerating = generateProjectReport.isPending || generateExperimentReport.isPending;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Enhanced Report</DialogTitle>
          <DialogDescription>
            Create a comprehensive PDF report for a specific project or experiment, including all notes and attachments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={(value: "project" | "experiment") => {
              setReportType(value);
              setSelectedId("");
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project Report</SelectItem>
                <SelectItem value="experiment">Experiment Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select {reportType === "project" ? "Project" : "Experiment"}</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${reportType}...`} />
              </SelectTrigger>
              <SelectContent>
                {reportType === "project" 
                  ? projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))
                  : experiments.map((experiment) => (
                      <SelectItem key={experiment.id} value={experiment.id}>
                        {experiment.title}
                      </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Include in Report</Label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeNotes" 
                checked={includeNotes}
                onCheckedChange={setIncludeNotes}
              />
              <Label htmlFor="includeNotes" className="text-sm">Include Notes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeAttachments" 
                checked={includeAttachments}
                onCheckedChange={setIncludeAttachments}
              />
              <Label htmlFor="includeAttachments" className="text-sm">Include Attachments List</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedReportDialog;
