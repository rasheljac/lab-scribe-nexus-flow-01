
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
  
  console.log('Starting PDF export for protocol:', protocol.title);
  
  // Initialize formatter
  const formatter = new PDFFormatter(pdf, {
    margin,
    pageWidth,
    pageHeight,
    contentWidth
  });

  // Add logo
  console.log('Adding logo...');
  const logoHeight = await addLogoToPDF(pdf, pageWidth, margin);
  formatter.setCurrentY(margin + logoHeight);

  // Add title
  console.log('Adding title...');
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  const titleLines = pdf.splitTextToSize(protocol.title, contentWidth - 20);
  pdf.text(titleLines, margin, formatter.getCurrentY());
  formatter.setCurrentY(formatter.getCurrentY() + (titleLines.length * 7) + 15);

  // Add metadata
  console.log('Adding metadata...');
  const metadataEndY = addMetadataSection(pdf, protocol, margin, contentWidth, formatter.getCurrentY());
  formatter.setCurrentY(metadataEndY);

  // Add description if available
  if (protocol.description && protocol.description.trim()) {
    console.log('Adding description...');
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Description:', margin, formatter.getCurrentY());
    formatter.setCurrentY(formatter.getCurrentY() + 8);
    
    formatter.addParagraph(protocol.description);
  }

  // Add separator
  formatter.addSeparator();

  // Add content section header
  console.log('Adding content header...');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Protocol Steps & Instructions:', margin, formatter.getCurrentY());
  formatter.setCurrentY(formatter.getCurrentY() + 12);

  // Process and add content using structured approach
  console.log('Processing content...');
  const structuredContent = convertHtmlToStructuredText(protocol.content);
  console.log('Structured content elements:', structuredContent.length);
  
  structuredContent.forEach((element, index) => {
    console.log(`Processing element ${index + 1}/${structuredContent.length}:`, element.type);
    
    switch (element.type) {
      case 'heading':
        formatter.addHeading(element.content, element.level || 1);
        break;
      case 'paragraph':
        formatter.addParagraph(element.content);
        break;
      case 'list':
        if (element.items && element.items.length > 0) {
          formatter.addList(element.items, element.isOrdered);
        }
        break;
      case 'text':
        formatter.addText(element.content);
        break;
      default:
        console.warn('Unknown element type:', element.type);
    }
  });

  // Add footer to all pages
  console.log('Adding footer...');
  addFooter(pdf, pageWidth, pageHeight, margin);

  // Save the PDF
  const fileName = `${protocol.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_protocol.pdf`;
  console.log('Saving PDF as:', fileName);
  pdf.save(fileName);
  
  console.log('PDF export completed successfully');
};

export type { ProtocolPDFData };
