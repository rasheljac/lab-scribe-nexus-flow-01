
import jsPDF from 'jspdf';
import { convertHtmlToStructuredText } from './htmlToText';
import { PDFFormatter } from './pdfFormatting';
import { ProtocolPDFData, addLogoToPDF, addMetadataSection, addFooter } from './pdfExportUtils';

export const exportProtocolToPDF = async (protocol: ProtocolPDFData) => {
  console.log('Starting PDF export for protocol:', protocol.title);
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  console.log(`PDF dimensions: ${pageWidth}x${pageHeight}, content width: ${contentWidth}`);
  
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
  formatter.setCurrentY(formatter.getCurrentY() + (titleLines.length * 7) + 10); // Reduced spacing

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
    formatter.setCurrentY(formatter.getCurrentY() + 8); // Reduced from 10
    
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
  formatter.setCurrentY(formatter.getCurrentY() + 10); // Reduced from 15

  // Process and add content
  console.log('Processing protocol content...');
  const structuredContent = convertHtmlToStructuredText(protocol.content);
  console.log(`Processing ${structuredContent.length} content elements`);
  
  structuredContent.forEach((element, index) => {
    console.log(`Processing element ${index + 1}/${structuredContent.length}: ${element.type}`);
    console.log(`Current Y position: ${formatter.getCurrentY()}, Remaining space: ${formatter.getRemainingSpace()}`);
    
    try {
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
    } catch (error) {
      console.error(`Error processing element ${index}:`, error);
    }
  });

  // Add footer to all pages
  console.log('Adding footer to all pages...');
  addFooter(pdf, pageWidth, pageHeight, margin);

  // Save the PDF
  const fileName = `${protocol.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_protocol.pdf`;
  console.log('Saving PDF as:', fileName);
  console.log(`Final PDF has ${pdf.internal.pages.length - 1} pages`);
  
  pdf.save(fileName);
  console.log('PDF export completed successfully');
};

export type { ProtocolPDFData };
