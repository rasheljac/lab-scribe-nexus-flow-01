
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Printer, QrCode, Barcode, FileText, Download, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const labelTemplates = [
  { id: 1, name: "Sample Label", type: "sample", size: "2x1 inch" },
  { id: 2, name: "Equipment Tag", type: "equipment", size: "1.5x1 inch" },
  { id: 3, name: "Chemical Bottle", type: "chemical", size: "3x2 inch" },
  { id: 4, name: "Storage Box", type: "storage", size: "4x2 inch" },
];

const recentPrints = [
  { id: 1, template: "Sample Label", quantity: 50, date: "2024-01-25", status: "completed" },
  { id: 2, template: "Equipment Tag", quantity: 25, date: "2024-01-24", status: "completed" },
  { id: 3, template: "Chemical Bottle", quantity: 10, date: "2024-01-23", status: "failed" },
];

const LabelPrinter = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [labelData, setLabelData] = useState({
    title: "",
    subtitle: "",
    date: "",
    researcher: "",
    notes: "",
    barcodeData: "",
    quantity: 1,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setLabelData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    console.log("Printing labels:", { template: selectedTemplate, data: labelData });
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
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Print Queue
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
                          {labelTemplates.map((template) => (
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
                        onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
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
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <QrCode className="h-4 w-4" />
                        Preview
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
                      <div className="bg-white border border-gray-200 rounded p-4 inline-block min-w-[200px]">
                        <div className="text-sm font-bold">{labelData.title || "Sample Title"}</div>
                        <div className="text-xs text-gray-600">{labelData.subtitle || "Subtitle"}</div>
                        <div className="my-2">
                          <div className="bg-gray-900 h-8 w-full flex items-center justify-center">
                            <Barcode className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="text-xs">
                          <div>{labelData.date || "Date"}</div>
                          <div>{labelData.researcher || "Researcher"}</div>
                        </div>
                        {labelData.notes && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {labelData.notes}
                          </div>
                        )}
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
                      {labelTemplates.map((template) => (
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

                {/* Recent Prints */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Prints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentPrints.map((print) => (
                        <div key={print.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{print.template}</div>
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
