
import jsPDF from 'jspdf';
import { convertHtmlToStructuredText } from './htmlToText';
import { PDFFormatter } from './pdfFormatting';
import { ProtocolPDFData, addLogoToPDF, addMetadataSection, addFooter } from './pdfExportUtils';

export const exportProtocolToPDF = async (protocol: ProtocolPDFData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Initialize formatter
  const formatter = new PDFFormatter(pdf, {
    margin,
    pageWidth,
    pageHeight,
    contentWidth
  });

  // Add logo
  const logoHeight = await addLogoToPDF(pdf, pageWidth, margin);
  formatter.setCurrentY(margin + logoHeight);

  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(protocol.title, contentWidth - 50);
  pdf.text(titleLines, margin, formatter.getCurrentY());
  formatter.setCurrentY(formatter.getCurrentY() + (titleLines.length * 8) + 10);

  // Add metadata
  const metadataEndY = addMetadataSection(pdf, protocol, margin, contentWidth, formatter.getCurrentY());
  formatter.setCurrentY(metadataEndY);

  // Add description if available
  if (protocol.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Description:', margin, formatter.getCurrentY());
    formatter.setCurrentY(formatter.getCurrentY() + 7);
    
    formatter.addParagraph(protocol.description);
  }

  // Add separator
  formatter.addSeparator();

  // Add content section header
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Protocol Steps & Instructions:', margin, formatter.getCurrentY());
  formatter.setCurrentY(formatter.getCurrentY() + 10);

  // Process and add content using structured approach
  const structuredContent = convertHtmlToStructuredText(protocol.content);
  
  structuredContent.forEach(element => {
    switch (element.type) {
      case 'heading':
        formatter.addHeading(element.content, element.level || 1);
        break;
      case 'paragraph':
        formatter.addParagraph(element.content);
        break;
      case 'list':
        if (element.items) {
          formatter.addList(element.items, element.isOrdered);
        }
        break;
      case 'text':
        formatter.addText(element.content);
        break;
    }
  });

  // Add footer
  addFooter(pdf, pageWidth, pageHeight, margin);

  // Save the PDF
  const fileName = `${protocol.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_protocol.pdf`;
  pdf.save(fileName);
};

export type { ProtocolPDFData };
