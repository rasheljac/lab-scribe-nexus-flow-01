
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Calendar,
  Loader2,
  BookOpen,
  Tag
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateProtocolDialog from "@/components/CreateProtocolDialog";
import EditProtocolDialog from "@/components/EditProtocolDialog";
import { useProtocols } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";

const Protocols = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createProtocolOpen, setCreateProtocolOpen] = useState(false);
  
  const { toast } = useToast();
  const { protocols, isLoading, error, deleteProtocol } = useProtocols();

  const categories = ["all", ...Array.from(new Set(protocols.map(p => p.category)))];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (protocol.description && protocol.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProtocol = async (protocolId: string, protocolTitle: string) => {
    try {
      await deleteProtocol.mutateAsync(protocolId);
      toast({
        title: "Success",
        description: `Protocol "${protocolTitle}" deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete protocol",
        variant: "destructive",
      });
    }
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
                <p className="text-red-600">Error loading protocols: {error.message}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Protocols</h1>
                <p className="text-gray-600 mt-1">
                  {protocols.length} protocols available for reuse
                </p>
              </div>
              <Button onClick={() => setCreateProtocolOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Protocol
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search protocols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Protocols Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProtocols.map((protocol) => (
                  <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{protocol.title}</CardTitle>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Badge variant="outline" className="capitalize">
                            {protocol.category}
                          </Badge>
                          <EditProtocolDialog protocol={protocol} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Protocol</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{protocol.title}"? This action cannot be undone and will remove this protocol from all experiments and notes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProtocol(protocol.id, protocol.title)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {protocol.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {protocol.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Protocol Content Preview */}
                      <div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {stripHtmlTags(protocol.content)}
                        </p>
                      </div>

                      {/* Protocol Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Created {new Date(protocol.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span>Version {protocol.version}</span>
                          {protocol.is_template && (
                            <Badge variant="secondary" className="text-xs">Template</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredProtocols.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm || selectedCategory !== "all" ? "No protocols found matching your criteria." : "No protocols found."}
                    </p>
                    <Button 
                      className="mt-4 gap-2" 
                      onClick={() => setCreateProtocolOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create First Protocol
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <CreateProtocolDialog 
        open={createProtocolOpen} 
        onOpenChange={setCreateProtocolOpen}
      />
    </div>
  );
};

export default Protocols;
