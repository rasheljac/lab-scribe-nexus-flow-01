
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Printer, QrCode, Barcode, FileText, Download, Plus, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

interface LabelTemplate {
  id: number;
  name: string;
  type: string;
  size: string;
}

interface LabelData {
  title: string;
  subtitle: string;
  date: string;
  researcher: string;
  notes: string;
  barcodeData: string;
  quantity: number;
}

interface PrintJob {
  id: number;
  template: string;
  quantity: number;
  date: string;
  status: string;
  data: LabelData;
}

const initialTemplates: LabelTemplate[] = [
  { id: 1, name: "Sample Label", type: "sample", size: "2x1 inch" },
  { id: 2, name: "Equipment Tag", type: "equipment", size: "1.5x1 inch" },
  { id: 3, name: "Chemical Bottle", type: "chemical", size: "3x2 inch" },
  { id: 4, name: "Storage Box", type: "storage", size: "4x2 inch" },
];

const initialPrintJobs: PrintJob[] = [
  { 
    id: 1, 
    template: "Sample Label", 
    quantity: 50, 
    date: "2024-01-25", 
    status: "completed",
    data: {
      title: "DNA Sample #123",
      subtitle: "Experiment A",
      date: "2024-01-25",
      researcher: "Dr. Smith",
      notes: "Keep frozen",
      barcodeData: "DNA123",
      quantity: 50
    }
  },
  { 
    id: 2, 
    template: "Equipment Tag", 
    quantity: 25, 
    date: "2024-01-24", 
    status: "completed",
    data: {
      title: "Centrifuge #5",
      subtitle: "Lab Equipment",
      date: "2024-01-24",
      researcher: "Lab Tech",
      notes: "Maintenance due: Q2 2024",
      barcodeData: "CENT005",
      quantity: 25
    }
  },
];

const LabelPrinter = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templates, setTemplates] = useState<LabelTemplate[]>(initialTemplates);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(initialPrintJobs);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>([]);
  const { toast } = useToast();

  const [labelData, setLabelData] = useState<LabelData>({
    title: "",
    subtitle: "",
    date: "",
    researcher: "",
    notes: "",
    barcodeData: "",
    quantity: 1,
  });

  const handleInputChange = (field: keyof LabelData, value: string | number) => {
    setLabelData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    if (!labelData.title) {
      toast({
        title: "Error",
        description: "Please enter a title for the label",
        variant: "destructive",
      });
      return;
    }

    const newPrintJob: PrintJob = {
      id: Date.now(),
      template: selectedTemplate,
      quantity: labelData.quantity,
      date: new Date().toISOString().split('T')[0],
      status: "completed",
      data: { ...labelData }
    };

    setPrintJobs(prev => [newPrintJob, ...prev]);
    
    toast({
      title: "Success",
      description: `Printed ${labelData.quantity} labels successfully`,
    });

    // Reset form
    setLabelData({
      title: "",
      subtitle: "",
      date: "",
      researcher: "",
      notes: "",
      barcodeData: "",
      quantity: 1,
    });
  };

  const handleDownloadPDF = () => {
    if (!selectedTemplate || !labelData.title) {
      toast({
        title: "Error",
        description: "Please complete the label design first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "PDF downloaded successfully",
    });
  };

  const handlePreview = () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Preview",
      description: "Label preview updated",
    });
  };

  const addToQueue = () => {
    if (!selectedTemplate || !labelData.title) {
      toast({
        title: "Error",
        description: "Please complete the label design first",
        variant: "destructive",
      });
      return;
    }

    const queueItem: PrintJob = {
      id: Date.now(),
      template: selectedTemplate,
      quantity: labelData.quantity,
      date: new Date().toISOString().split('T')[0],
      status: "queued",
      data: { ...labelData }
    };

    setPrintQueue(prev => [...prev, queueItem]);
    
    toast({
      title: "Success",
      description: "Added to print queue",
    });
  };

  const removeFromQueue = (id: number) => {
    setPrintQueue(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Removed from print queue",
    });
  };

  const processQueue = () => {
    if (printQueue.length === 0) {
      toast({
        title: "Error",
        description: "Print queue is empty",
        variant: "destructive",
      });
      return;
    }

    const processedJobs = printQueue.map(job => ({
      ...job,
      status: "completed"
    }));

    setPrintJobs(prev => [...processedJobs, ...prev]);
    setPrintQueue([]);

    toast({
      title: "Success",
      description: `Processed ${processedJobs.length} print jobs`,
    });
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Label Printer</h1>
                <p className="text-gray-600 mt-1">Design and print laboratory labels</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
                <Button variant="outline" className="gap-2" onClick={processQueue}>
                  <FileText className="h-4 w-4" />
                  Process Queue ({printQueue.length})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Label Designer */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Printer className="h-5 w-5" />
                      Label Designer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Template Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="template">Label Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.name}>
                              {template.name} ({template.size})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Label Content */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={labelData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Sample name or title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          value={labelData.subtitle}
                          onChange={(e) => handleInputChange("subtitle", e.target.value)}
                          placeholder="Additional info"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={labelData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="researcher">Researcher</Label>
                        <Input
                          id="researcher"
                          value={labelData.researcher}
                          onChange={(e) => handleInputChange("researcher", e.target.value)}
                          placeholder="Researcher name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcodeData">Barcode/QR Code Data</Label>
                      <Input
                        id="barcodeData"
                        value={labelData.barcodeData}
                        onChange={(e) => handleInputChange("barcodeData", e.target.value)}
                        placeholder="Data to encode in barcode"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={labelData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Additional notes or instructions"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={labelData.quantity}
                        onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                        min={1}
                        max={1000}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" />
                        Print Labels
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={handlePreview}>
                        <QrCode className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={addToQueue}>
                        <Plus className="h-4 w-4" />
                        Add to Queue
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Label Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Label Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 p-8 rounded-lg text-center">
                      <div className="bg-white border border-gray-200 rounded p-4 inline-block min-w-[200px] max-w-[300px]">
                        <div className="text-sm font-bold">{labelData.title || "Sample Title"}</div>
                        <div className="text-xs text-gray-600">{labelData.subtitle || "Subtitle"}</div>
                        <div className="my-2">
                          <div className="bg-gray-900 h-8 w-full flex items-center justify-center rounded">
                            <Barcode className="h-4 w-4 text-white" />
                            <span className="text-white text-xs ml-1">
                              {labelData.barcodeData || "BARCODE"}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs space-y-1">
                          <div>{labelData.date || "Date"}</div>
                          <div>{labelData.researcher || "Researcher"}</div>
                          {labelData.notes && (
                            <div className="text-gray-500 mt-1 text-wrap break-words">
                              {labelData.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Templates and History */}
              <div className="space-y-6">
                {/* Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Label Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate === template.name
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedTemplate(template.name)}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.size}</div>
                          <Badge variant="outline" className="mt-1">
                            {template.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Print Queue */}
                {printQueue.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Print Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {printQueue.map((job) => (
                          <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{job.data.title}</div>
                                <div className="text-xs text-gray-600">
                                  {job.quantity} labels • {job.template}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromQueue(job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Prints */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Prints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {printJobs.slice(0, 5).map((print) => (
                        <div key={print.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{print.data.title}</div>
                              <div className="text-xs text-gray-600">
                                {print.quantity} labels • {print.date}
                              </div>
                            </div>
                            <Badge 
                              className={
                                print.status === "completed" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {print.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LabelPrinter;
