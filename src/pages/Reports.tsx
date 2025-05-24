
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, FileText, Calendar, User, BarChart3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const reports = [
  {
    id: 1,
    title: "Monthly Lab Activity Report",
    description: "Comprehensive overview of all laboratory activities for January 2024",
    type: "activity",
    status: "published",
    author: "Dr. Sarah Chen",
    createdDate: "2024-01-31",
    format: "PDF",
    size: "2.3 MB",
    downloads: 24,
  },
  {
    id: 2,
    title: "Protein Analysis Results",
    description: "Detailed analysis results from the protein structure study",
    type: "experiment",
    status: "draft",
    author: "Dr. John Doe",
    createdDate: "2024-01-28",
    format: "PDF",
    size: "5.7 MB",
    downloads: 8,
  },
  {
    id: 3,
    title: "Equipment Maintenance Log",
    description: "Quarterly maintenance report for all laboratory equipment",
    type: "maintenance",
    status: "published",
    author: "Lab Tech Mike",
    createdDate: "2024-01-25",
    format: "Excel",
    size: "1.1 MB",
    downloads: 15,
  },
  {
    id: 4,
    title: "Inventory Audit Report",
    description: "Complete inventory audit with recommendations for restocking",
    type: "inventory",
    status: "published",
    author: "Dr. Lisa Wong",
    createdDate: "2024-01-20",
    format: "PDF",
    size: "3.2 MB",
    downloads: 32,
  },
];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "experiment":
        return "bg-blue-100 text-blue-800";
      case "activity":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "inventory":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
                <h1 className="text-3xl font-bold text-gray-900">Report Generator</h1>
                <p className="text-gray-600 mt-1">Generate and manage laboratory reports</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics Report
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Report
                </Button>
              </div>
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
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{report.title}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge className={getTypeColor(report.type)}>
                              {report.type}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{report.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{report.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{report.createdDate}</span>
                            </div>
                            <span>{report.format}</span>
                            <span>{report.size}</span>
                            <span>{report.downloads} downloads</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
