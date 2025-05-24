
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Plus, 
  Beaker, 
  Calendar, 
  User, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Flask
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const experiments = [
  {
    id: 1,
    title: "Protein Analysis Study",
    description: "Analyzing protein structures in bacterial samples",
    status: "in_progress",
    progress: 75,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    researcher: "Dr. Sarah Chen",
    protocols: 3,
    samples: 24,
    category: "Biochemistry",
  },
  {
    id: 2,
    title: "Cell Culture Viability Test",
    description: "Testing cell viability under different conditions",
    status: "planning",
    progress: 25,
    startDate: "2024-01-20",
    endDate: "2024-03-01",
    researcher: "Dr. Lisa Wong",
    protocols: 2,
    samples: 12,
    category: "Cell Biology",
  },
  {
    id: 3,
    title: "DNA Sequencing Project",
    description: "Complete genome sequencing of novel bacterial strain",
    status: "completed",
    progress: 100,
    startDate: "2023-12-01",
    endDate: "2024-01-10",
    researcher: "Dr. John Doe",
    protocols: 5,
    samples: 8,
    category: "Genomics",
  },
];

const Experiments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "planning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Flask className="h-4 w-4 text-gray-600" />;
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

  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || exp.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
                <p className="text-gray-600 mt-1">Manage and track your laboratory experiments</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Experiment
              </Button>
            </div>

            {/* Search and Filter */}
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
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Experiments</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredExperiments.map((experiment) => (
                    <Card key={experiment.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                            <span>{experiment.startDate} - {experiment.endDate}</span>
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Experiments;
