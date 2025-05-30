import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Download, FileText, Eye, Calendar, User, Loader2, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateReportDialog from "@/components/CreateReportDialog";
import EnhancedReportDialog from "@/components/EnhancedReportDialog";
import { useReports } from "@/hooks/useReports";
import { useProjectExperimentReports } from "@/hooks/useProjectExperimentReports";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { reports, isLoading, error, updateReport, deleteReport } = useReports();
  const { generateProjectReport } = useProjectExperimentReports();
  const { toast } = useToast();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "experiment":
        return "bg-blue-100 text-blue-800";
      case "activity":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "inventory":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewReport = async (reportId: string, title: string) => {
    try {
      // Increment downloads count
      const report = reports.find(r => r.id === reportId);
      if (report) {
        await updateReport.mutateAsync({
          id: reportId,
          downloads: report.downloads + 1
        });
      }
      
      // Generate and show the comprehensive PDF report using new system
      await generateProjectReport.mutateAsync({
        projectId: '', // For legacy reports, generate general report
        projectTitle: title,
        includeNotes: true,
        includeAttachments: true
      });

      toast({
        title: "Report Generated",
        description: "Report has been generated and downloaded for viewing",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report for viewing",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      // Increment downloads count
      const report = reports.find(r => r.id === reportId);
      if (report) {
        await updateReport.mutateAsync({
          id: reportId,
          downloads: report.downloads + 1
        });
      }

      // Generate comprehensive PDF report using new system
      await generateProjectReport.mutateAsync({
        projectId: '', // For legacy reports, generate general report
        projectTitle: title,
        includeNotes: true,
        includeAttachments: true
      });

      toast({
        title: "Download Started",
        description: "Comprehensive PDF report download has begun",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport.mutateAsync(reportId);
      toast({
        title: "Success",
        description: "Report deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
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
                <p className="text-red-600">Error loading reports: {error.message}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600 mt-1">Generate and manage laboratory reports</p>
              </div>
              <div className="flex gap-2">
                <EnhancedReportDialog />
                <CreateReportDialog />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-xl font-bold">{reports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-xl font-bold">
                        {reports.filter(r => r.status === "published").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-xl font-bold">
                        {reports.filter(r => r.status === "draft").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <Download className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                      <p className="text-xl font-bold">
                        {reports.reduce((sum, r) => sum + r.downloads, 0)}
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
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{report.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Report Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{report.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-400" />
                          <span>{report.downloads} downloads</span>
                        </div>
                      </div>

                      {/* Type and Format */}
                      <div className="flex justify-between items-center pt-2">
                        <Badge className={getTypeColor(report.type)}>
                          {report.type}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{report.format}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewReport(report.id, report.title)}
                          disabled={generateProjectReport.isPending}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {generateProjectReport.isPending ? "Generating..." : "View"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDownloadReport(report.id, report.title)}
                          disabled={generateProjectReport.isPending}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {generateProjectReport.isPending ? "Downloading..." : "Download"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredReports.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No reports found. Create your first report to get started.</p>
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

export default Reports;
