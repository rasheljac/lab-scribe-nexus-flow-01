
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateTemplateDialog from "@/components/CreateTemplateDialog";
import EditTemplateDialog from "@/components/EditTemplateDialog";
import { useLabelTemplates } from "@/hooks/useLabelTemplates";
import { useToast } from "@/hooks/use-toast";

const LabelPrinter = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { templates, isLoading, error, deleteTemplate } = useLabelTemplates();
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    return template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete template",
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
                <p className="text-red-600">Error loading templates: {error.message}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Label Templates</h1>
                <p className="text-gray-600 mt-1">
                  {templates.length} templates available
                </p>
              </div>
              <CreateTemplateDialog />
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Templates List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <EditTemplateDialog template={template} />
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{template.type}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-700">
                            Size: {template.size}
                          </p>
                          <p className="text-sm text-gray-700">
                            Dimensions: {template.width_mm}mm x {template.height_mm}mm
                          </p>
                          <div className="flex justify-end mt-4 gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      try {
                                        await deleteTemplate.mutateAsync(template.id);
                                        toast({
                                          title: "Success",
                                          description: "Template deleted successfully",
                                        });
                                      } catch (error) {
                                        toast({
                                          title: "Error", 
                                          description: "Failed to delete template",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      {searchTerm ? "No templates found matching your criteria." : "No templates available."}
                    </p>
                    <CreateTemplateDialog>
                      <Button className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Create First Template
                      </Button>
                    </CreateTemplateDialog>
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

export default LabelPrinter;
