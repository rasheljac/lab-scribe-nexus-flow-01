
import jsPDF from 'jspdf';

interface ProtocolPDFData {
  title: string;
  description?: string;
  content: string;
  category: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export const exportProtocolToPDF = async (protocol: ProtocolPDFData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Load and add logo
  try {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
      logo.src = '/lovable-uploads/305ae0c2-f9ba-42cc-817b-eda518f05406.png';
    });

    // Calculate logo dimensions maintaining aspect ratio
    const logoAspectRatio = logo.width / logo.height;
    const maxLogoWidth = 40;
    const maxLogoHeight = 20;
    
    let logoWidth = maxLogoWidth;
    let logoHeight = logoWidth / logoAspectRatio;
    
    if (logoHeight > maxLogoHeight) {
      logoHeight = maxLogoHeight;
      logoWidth = logoHeight * logoAspectRatio;
    }

    // Add logo to top right
    pdf.addImage(logo, 'PNG', pageWidth - margin - logoWidth, currentY, logoWidth, logoHeight);
    currentY += logoHeight + 10;
  } catch (error) {
    console.warn('Could not load logo for PDF export:', error);
    currentY += 10;
  }

  // Add title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(protocol.title, contentWidth - 50);
  pdf.text(titleLines, margin, currentY);
  currentY += (titleLines.length * 8) + 10;

  // Add metadata section
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  
  const metadata = [
    `Category: ${protocol.category.charAt(0).toUpperCase() + protocol.category.slice(1)}`,
    `Version: v${protocol.version}`,
    `Created: ${new Date(protocol.createdAt).toLocaleDateString()}`,
    `Updated: ${new Date(protocol.updatedAt).toLocaleDateString()}`
  ];
  
  metadata.forEach(line => {
    pdf.text(line, margin, currentY);
    currentY += 5;
  });
  currentY += 10;

  // Add description if available
  if (protocol.description) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Description:', margin, currentY);
    currentY += 7;
    
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(protocol.description, contentWidth);
    pdf.text(descLines, margin, currentY);
    currentY += (descLines.length * 5) + 10;
  }

  // Add separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Add content section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Protocol Steps & Instructions:', margin, currentY);
  currentY += 10;

  // Enhanced HTML to text processing
  const processHtmlContent = (html: string) => {
    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Process different HTML elements
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Handle different HTML elements
        switch (tagName) {
          case 'p':
            const pContent = Array.from(element.childNodes).map(processNode).join('');
            return pContent.trim() ? pContent + '\n\n' : '';
          case 'br':
            return '\n';
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            const hContent = Array.from(element.childNodes).map(processNode).join('');
            return hContent.trim() ? '\n' + hContent.toUpperCase() + '\n\n' : '';
          case 'strong':
          case 'b':
            return Array.from(element.childNodes).map(processNode).join('');
          case 'em':
          case 'i':
            return Array.from(element.childNodes).map(processNode).join('');
          case 'ul':
          case 'ol':
            const listItems = Array.from(element.children)
              .filter(child => child.tagName.toLowerCase() === 'li')
              .map((li, index) => {
                const content = Array.from(li.childNodes).map(processNode).join('').trim();
                return tagName === 'ol' ? `${index + 1}. ${content}` : `• ${content}`;
              })
              .join('\n');
            return listItems ? listItems + '\n\n' : '';
          case 'li':
            return Array.from(element.childNodes).map(processNode).join('');
          case 'div':
            const divContent = Array.from(element.childNodes).map(processNode).join('');
            return divContent + '\n';
          default:
            return Array.from(element.childNodes).map(processNode).join('');
        }
      }
      
      return '';
    };
    
    return Array.from(temp.childNodes).map(processNode).join('');
  };

  const cleanContent = processHtmlContent(protocol.content)
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace from start and end
    .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  
  // Split content into paragraphs and process each one
  const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
  const lineHeight = 6;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;
    
    // Check if this is a heading (all uppercase)
    const isHeading = trimmedParagraph === trimmedParagraph.toUpperCase() && 
                     trimmedParagraph.length < 100 && 
                     !trimmedParagraph.includes('.');
    
    if (isHeading) {
      // Add some space before headings
      currentY += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
    }
    
    // Split paragraph into lines that fit the page width
    const lines = pdf.splitTextToSize(trimmedParagraph, contentWidth);
    
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (currentY + lineHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
        
        // Add logo to new page header
        try {
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          logo.src = '/lovable-uploads/305ae0c2-f9ba-42cc-817b-eda518f05406.png';
          
          await new Promise((resolve) => {
            logo.onload = () => {
              const logoAspectRatio = logo.width / logo.height;
              const logoWidth = 30;
              const logoHeight = logoWidth / logoAspectRatio;
              pdf.addImage(logo, 'PNG', pageWidth - margin - logoWidth, 10, logoWidth, logoHeight);
              resolve(null);
            };
            logo.onerror = () => resolve(null);
          });
        } catch (error) {
          // Silently continue if logo fails to load
        }
        
        currentY = margin + 25;
      }
      
      pdf.text(lines[i], margin, currentY);
      currentY += lineHeight;
    }
    
    // Add extra space after paragraphs
    currentY += 4;
  }

  // Add footer with branding
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated by Kapelczak Lab Management System`, margin, pageHeight - 10);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save the PDF
  const fileName = `${protocol.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_protocol.pdf`;
  pdf.save(fileName);
};
