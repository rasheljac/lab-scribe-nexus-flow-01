
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Calendar,
  Tag,
  BookOpen,
  Edit,
  Loader2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RichTextDisplay from "@/components/RichTextDisplay";
import EditProtocolDialog from "@/components/EditProtocolDialog";
import { useProtocols } from "@/hooks/useProtocols";

const ProtocolDetails = () => {
  const { protocolId } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { protocols, isLoading, error } = useProtocols();
  
  const protocol = protocols.find(p => p.id === protocolId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {error ? `Error loading protocol: ${error.message}` : "Protocol not found"}
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/protocols')}
                >
                  Back to Protocols
                </Button>
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/protocols')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Protocols
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{protocol.title}</h1>
                  {protocol.description && (
                    <p className="text-gray-600 mt-1">{protocol.description}</p>
                  )}
                </div>
              </div>
              <Button onClick={() => setEditDialogOpen(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Protocol
              </Button>
            </div>

            {/* Protocol Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Protocol Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="capitalize">
                        {protocol.category}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Version</label>
                    <p className="mt-1 text-sm">v{protocol.version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Template</label>
                    <div className="mt-1">
                      {protocol.is_template ? (
                        <Badge variant="secondary">Template</Badge>
                      ) : (
                        <Badge variant="outline">Instance</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Created: {new Date(protocol.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Updated: {new Date(protocol.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protocol Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Protocol Steps & Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <RichTextDisplay content={protocol.content} />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {editDialogOpen && (
        <EditProtocolDialog 
          protocol={protocol} 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};

export default ProtocolDetails;
