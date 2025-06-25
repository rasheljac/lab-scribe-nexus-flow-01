import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Printer, QrCode, Barcode, FileText, Download, Plus, Trash2 } from "lucide-react";
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
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useLabels, Label as LabelData } from "@/hooks/useLabels";
import jsPDF from 'jspdf';

interface LabelTemplate {
  id: number;
  name: string;
  type: string;
  size: string;
}

const initialTemplates: LabelTemplate[] = [
  { id: 1, name: "Sample Label", type: "sample", size: "2x1 inch" },
  { id: 2, name: "Equipment Tag", type: "equipment", size: "1.5x1 inch" },
  { id: 3, name: "Chemical Bottle", type: "chemical", size: "3x2 inch" },
  { id: 4, name: "Storage Box", type: "storage", size: "4x2 inch" },
];

const LabelPrinter = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templates] = useState<LabelTemplate[]>(initialTemplates);
  const [printQueue, setPrintQueue] = useState<LabelData[]>([]);
  const { labels, loading, addLabel, deleteLabel } = useLabels();
  const { toast } = useToast();

  const [labelData, setLabelData] = useState({
    title: "",
    subtitle: "",
    date: "",
    researcher: "",
    notes: "",
    barcode_data: "",
    quantity: 1,
  });

  const handleInputChange = (field: keyof typeof labelData, value: string | number) => {
    setLabelData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = async () => {
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

    try {
      await addLabel({
        ...labelData,
        template_name: selectedTemplate,
      });
      
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
        barcode_data: "",
        quantity: 1,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print labels",
        variant: "destructive",
      });
    }
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

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Define label dimensions (matching preview proportions)
      const labelWidth = 60;
      const labelHeight = 40;
      const startX = 20;
      const startY = 30;
      const padding = 4;

      const drawSingleLabel = (x: number, y: number) => {
        // Draw label border with rounded corners effect
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(x, y, labelWidth, labelHeight);

        // White background
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, labelWidth, labelHeight, 'F');

        let currentY = y + padding + 6; // Start with more padding from top

        // Add title
        if (labelData.title) {
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 0, 0);
          const titleText = labelData.title;
          
          // Split text if too long
          const maxWidth = labelWidth - (padding * 2);
          const titleLines = doc.splitTextToSize(titleText, maxWidth);
          
          // Center align each line
          titleLines.forEach((line: string, index: number) => {
            const lineWidth = doc.getTextWidth(line);
            const titleX = x + (labelWidth - lineWidth) / 2;
            doc.text(line, titleX, currentY + (index * 5));
          });
          
          currentY += titleLines.length * 5 + 3; // Add space after title
        }

        // Add subtitle if present
        if (labelData.subtitle) {
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(120, 120, 120);
          const subtitleText = labelData.subtitle;
          const maxWidth = labelWidth - (padding * 2);
          const subtitleLines = doc.splitTextToSize(subtitleText, maxWidth);
          
          subtitleLines.forEach((line: string, index: number) => {
            const lineWidth = doc.getTextWidth(line);
            const subtitleX = x + (labelWidth - lineWidth) / 2;
            doc.text(line, subtitleX, currentY + (index * 4));
          });
          
          currentY += subtitleLines.length * 4 + 4; // Add space after subtitle
        }

        // Add barcode area (matching the preview style exactly)
        if (labelData.barcode_data) {
          const barcodeHeight = 8;
          const barcodeWidth = labelWidth - (padding * 2);
          const barcodeX = x + padding;
          
          // Dark background for barcode
          doc.setFillColor(35, 35, 55);
          doc.rect(barcodeX, currentY, barcodeWidth, barcodeHeight, 'F');
          
          // Add barcode lines (simulating barcode appearance)
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.3);
          for (let i = 0; i < 10; i++) {
            const lineX = barcodeX + 2 + (i * (barcodeWidth - 4) / 10);
            doc.line(lineX, currentY + 1, lineX, currentY + barcodeHeight - 1);
          }
          
          // Add barcode text
          doc.setFontSize(6);
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'normal');
          const barcodeText = labelData.barcode_data.toUpperCase();
          const barcodeTextWidth = doc.getTextWidth(barcodeText);
          const barcodeTextX = barcodeX + (barcodeWidth - barcodeTextWidth) / 2;
          doc.text(barcodeText, barcodeTextX, currentY + barcodeHeight - 1.5);
          
          currentY += barcodeHeight + 4; // Add space after barcode
        }

        // Add date and researcher info (with proper spacing)
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        if (labelData.date) {
          const dateText = labelData.date;
          const dateWidth = doc.getTextWidth(dateText);
          const dateX = x + (labelWidth - dateWidth) / 2;
          doc.text(dateText, dateX, currentY);
          currentY += 4; // Space between date and researcher
        }
        
        if (labelData.researcher) {
          const researcherText = labelData.researcher;
          const researcherWidth = doc.getTextWidth(researcherText);
          const researcherX = x + (labelWidth - researcherWidth) / 2;
          doc.text(researcherText, researcherX, currentY);
          currentY += 4; // Space after researcher
        }

        // Add notes if present and there's space (smaller font, bottom of label)
        if (labelData.notes) {
          const availableSpace = (y + labelHeight - padding) - currentY;
          if (availableSpace > 6) { // Only add notes if there's enough space
            doc.setFontSize(6);
            doc.setTextColor(100, 100, 100);
            doc.setFont(undefined, 'normal');
            const maxNoteWidth = labelWidth - (padding * 2);
            const notesLines = doc.splitTextToSize(labelData.notes, maxNoteWidth);
            const maxLines = Math.floor(availableSpace / 2.5); // Calculate max lines that fit
            const linesToShow = Math.min(notesLines.length, maxLines);
            
            for (let i = 0; i < linesToShow; i++) {
              const noteLineWidth = doc.getTextWidth(notesLines[i]);
              const noteX = x + (labelWidth - noteLineWidth) / 2;
              doc.text(notesLines[i], noteX, currentY + (i * 2.5));
            }
          }
        }
      };

      // Draw first label
      drawSingleLabel(startX, startY);

      // Add multiple copies if quantity > 1
      if (labelData.quantity > 1) {
        const labelsPerRow = 2;
        const labelsPerPage = 8;
        const horizontalSpacing = 15;
        const verticalSpacing = 15;
        
        for (let i = 1; i < Math.min(labelData.quantity, labelsPerPage); i++) {
          const row = Math.floor(i / labelsPerRow);
          const col = i % labelsPerRow;
          const x = startX + col * (labelWidth + horizontalSpacing);
          const y = startY + row * (labelHeight + verticalSpacing);
          
          // Check if we need a new page
          if (y + labelHeight > 280) {
            doc.addPage();
            // Reset to first position on new page
            drawSingleLabel(startX, startY);
            break;
          }
          
          drawSingleLabel(x, y);
        }
      }

      // Save the PDF
      doc.save(`label-${labelData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
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

    const queueItem: any = {
      id: Date.now().toString(),
      ...labelData,
      template_name: selectedTemplate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: "",
    };

    setPrintQueue(prev => [...prev, queueItem]);
    
    toast({
      title: "Success",
      description: "Added to print queue",
    });
  };

  const removeFromQueue = (id: string) => {
    setPrintQueue(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: "Removed from print queue",
    });
  };

  const processQueue = async () => {
    if (printQueue.length === 0) {
      toast({
        title: "Error",
        description: "Print queue is empty",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const item of printQueue) {
        await addLabel({
          title: item.title,
          subtitle: item.subtitle,
          date: item.date,
          researcher: item.researcher,
          notes: item.notes,
          barcode_data: item.barcode_data,
          quantity: item.quantity,
          template_name: item.template_name,
        });
      }

      setPrintQueue([]);
      toast({
        title: "Success",
        description: `Processed ${printQueue.length} print jobs`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process print queue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLabel = async (label: LabelData) => {
    await deleteLabel(label.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">Loading labels...</div>
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
                      <Label htmlFor="barcode_data">Barcode/QR Code Data</Label>
                      <Input
                        id="barcode_data"
                        value={labelData.barcode_data}
                        onChange={(e) => handleInputChange("barcode_data", e.target.value)}
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
                        <div className="text-sm font-bold text-center">{labelData.title || "Sample Title"}</div>
                        {labelData.subtitle && (
                          <div className="text-xs text-gray-600 text-center mt-1">{labelData.subtitle}</div>
                        )}
                        <div className="my-3">
                          <div className="bg-gray-900 h-8 w-full flex items-center justify-center rounded text-white text-xs font-mono">
                            <span className="tracking-wider">
                              {labelData.barcode_data ? `||| ${labelData.barcode_data.toUpperCase()} |||` : "||| BARCODE |||"}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs space-y-1 text-center">
                          {labelData.date && <div>{labelData.date}</div>}
                          {labelData.researcher && <div>{labelData.researcher}</div>}
                          {labelData.notes && (
                            <div className="text-gray-500 mt-2 text-wrap break-words text-[10px]">
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
                                <div className="font-medium text-sm">{job.title}</div>
                                <div className="text-xs text-gray-600">
                                  {job.quantity} labels • {job.template_name}
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
                      {labels.slice(0, 5).map((label) => (
                        <div key={label.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{label.title}</div>
                              <div className="text-xs text-gray-600">
                                {label.quantity} labels • {new Date(label.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Badge className="bg-green-100 text-green-800">
                                completed
                              </Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Label</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this label? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteLabel(label)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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
