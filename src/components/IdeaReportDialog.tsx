
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Download, Loader2 } from "lucide-react";
import { useIdeaReports } from "@/hooks/useIdeaReports";
import { useToast } from "@/hooks/use-toast";

interface IdeaReportDialogProps {
  ideaId?: string;
  ideaTitle?: string;
  variant?: "single" | "all";
}

const IdeaReportDialog = ({ ideaId, ideaTitle, variant = "single" }: IdeaReportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(true);
  const { toast } = useToast();
  const { generateIdeaReport, generateAllIdeasReport } = useIdeaReports();

  const handleGenerateReport = async () => {
    try {
      if (variant === "single" && ideaId) {
        await generateIdeaReport.mutateAsync({ ideaId, includeNotes });
        toast({
          title: "Success",
          description: `Report for "${ideaTitle}" generated successfully!`,
        });
      } else if (variant === "all") {
        await generateAllIdeasReport.mutateAsync();
        toast({
          title: "Success",
          description: "All ideas report generated successfully!",
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const isLoading = generateIdeaReport.isPending || generateAllIdeasReport.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          {variant === "single" ? "Export PDF" : "Export All"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            {variant === "single" 
              ? `Generate a comprehensive PDF report for "${ideaTitle}"`
              : "Generate a comprehensive PDF report for all experiment ideas"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Report Contents</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Basic Info</Badge>
                <span>Title, category, status, priority</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Details</Badge>
                <span>Description, hypothesis, methodology</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Planning</Badge>
                <span>Materials, timeline, budget</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Tags</Badge>
                <span>All associated tags</span>
              </div>
            </div>
          </div>

          {variant === "single" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-notes"
                checked={includeNotes}
                onCheckedChange={(checked) => setIncludeNotes(checked === true)}
              />
              <label
                htmlFor="include-notes"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include research notes
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaReportDialog;
