
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

  // Improved HTML to text processing
  const processHtmlContent = (html: string) => {
    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let result = '';
    
    const processElement = (element: Element): string => {
      let text = '';
      
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          // Clean up text content - normalize whitespace but preserve intentional breaks
          const textContent = node.textContent || '';
          const cleanText = textContent.replace(/\s+/g, ' ').trim();
          if (cleanText) {
            text += cleanText;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const childElement = node as Element;
          const tagName = childElement.tagName.toLowerCase();
          
          switch (tagName) {
            case 'p':
              const pText = processElement(childElement).trim();
              if (pText) {
                text += pText + '\n\n';
              }
              break;
            case 'br':
              text += '\n';
              break;
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              const hText = processElement(childElement).trim();
              if (hText) {
                text += '\n\n' + hText.toUpperCase() + '\n\n';
              }
              break;
            case 'strong':
            case 'b':
            case 'em':
            case 'i':
              text += processElement(childElement);
              break;
            case 'ul':
            case 'ol':
              const listItems = Array.from(childElement.children)
                .filter(child => child.tagName.toLowerCase() === 'li')
                .map((li, index) => {
                  const content = processElement(li).trim();
                  if (!content) return '';
                  return tagName === 'ol' ? `${index + 1}. ${content}` : `• ${content}`;
                })
                .filter(item => item.length > 0);
              
              if (listItems.length > 0) {
                text += '\n' + listItems.join('\n') + '\n\n';
              }
              break;
            case 'li':
              text += processElement(childElement);
              break;
            case 'div':
              const divText = processElement(childElement);
              if (divText.trim()) {
                text += divText;
                // Only add newline if the div content doesn't already end with one
                if (!divText.endsWith('\n')) {
                  text += '\n';
                }
              }
              break;
            default:
              text += processElement(childElement);
              break;
          }
        }
      }
      
      return text;
    };
    
    result = processElement(temp);
    
    // Final cleanup
    return result
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive newlines with 2
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .replace(/\n /g, '\n') // Remove spaces at beginning of lines
      .replace(/ \n/g, '\n') // Remove spaces at end of lines
      .trim();
  };

  const cleanContent = processHtmlContent(protocol.content);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  
  // Split content into paragraphs and process each one
  const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
  const lineHeight = 5.5;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;
    
    // Check if this is a heading (all uppercase and reasonable length)
    const isHeading = trimmedParagraph === trimmedParagraph.toUpperCase() && 
                     trimmedParagraph.length < 100 && 
                     !trimmedParagraph.includes('.') &&
                     trimmedParagraph.split(' ').length < 10;
    
    if (isHeading) {
      // Add some space before headings
      currentY += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
    }
    
    // Handle numbered lists and bullet points with proper indentation
    const isListItem = /^(\d+\.|•)/.test(trimmedParagraph);
    const textMargin = isListItem ? margin + 5 : margin;
    const textWidth = isListItem ? contentWidth - 5 : contentWidth;
    
    // Split paragraph into lines that fit the page width
    const lines = pdf.splitTextToSize(trimmedParagraph, textWidth);
    
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
      
      const lineText = lines[i].trim();
      if (lineText) {
        pdf.text(lineText, textMargin, currentY);
      }
      currentY += lineHeight;
    }
    
    // Add extra space after paragraphs, less for list items
    currentY += isListItem ? 2 : 4;
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
