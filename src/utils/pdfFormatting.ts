
import jsPDF from 'jspdf';

export interface PDFFormattingOptions {
  margin: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
}

export class PDFFormatter {
  private pdf: jsPDF;
  private options: PDFFormattingOptions;
  private currentY: number;
  private lineHeight: number = 5; // Reduced from 6

  constructor(pdf: jsPDF, options: PDFFormattingOptions) {
    this.pdf = pdf;
    this.options = options;
    this.currentY = options.margin;
  }

  addHeading(text: string, level: number = 1): void {
    if (!text.trim()) return;
    
    // Reduced space above heading
    const spaceAbove = level === 1 ? 8 : 6; // Reduced from 15/10
    
    // Set font based on heading level
    const fontSize = Math.max(16 - (level - 1) * 2, 12);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    // Split text and calculate required height
    const lines = this.pdf.splitTextToSize(text.trim(), this.options.contentWidth);
    const textHeight = lines.length * (fontSize * 0.35); // Reduced multiplier
    const totalHeight = spaceAbove + textHeight + 5; // Reduced bottom spacing
    
    // Check for page break
    this.checkPageBreak(totalHeight);
    
    // Add space above
    this.currentY += spaceAbove;
    
    // Add the heading
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += textHeight + 5; // Reduced from 8
  }

  addParagraph(text: string): void {
    if (!text.trim()) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    // Clean the text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    const lines = this.pdf.splitTextToSize(cleanText, this.options.contentWidth);
    const textHeight = lines.length * this.lineHeight;
    const totalHeight = textHeight + 4; // Reduced from 8
    
    // Check for page break
    this.checkPageBreak(totalHeight);
    
    // Add the paragraph
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += textHeight + 4; // Reduced from 8
  }

  addList(items: string[], isOrdered: boolean = false): void {
    if (!items || items.length === 0) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    items.forEach((item, index) => {
      const trimmedItem = item.trim();
      if (!trimmedItem) return;
      
      const prefix = isOrdered ? `${index + 1}. ` : '• ';
      const fullText = `${prefix}${trimmedItem}`;
      
      const lines = this.pdf.splitTextToSize(fullText, this.options.contentWidth - 10);
      const itemHeight = lines.length * this.lineHeight + 2; // Reduced from 3
      
      // Check for page break before each item
      this.checkPageBreak(itemHeight);
      
      this.pdf.text(lines, this.options.margin + 10, this.currentY);
      this.currentY += itemHeight;
    });
    
    // Reduced space after the list
    this.currentY += 3; // Reduced from 6
  }

  addText(text: string): void {
    if (!text.trim()) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const cleanText = text.trim().replace(/\s+/g, ' ');
    const lines = this.pdf.splitTextToSize(cleanText, this.options.contentWidth);
    const textHeight = lines.length * this.lineHeight;
    const totalHeight = textHeight + 3; // Reduced from 4
    
    this.checkPageBreak(totalHeight);
    
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += textHeight + 3; // Reduced from 4
  }

  addSeparator(): void {
    const separatorHeight = 10; // Reduced from 15
    this.checkPageBreak(separatorHeight);
    
    this.currentY += 3; // Reduced from 5
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(
      this.options.margin, 
      this.currentY, 
      this.options.pageWidth - this.options.margin, 
      this.currentY
    );
    this.currentY += 7; // Reduced from 10
  }

  private checkPageBreak(requiredSpace: number): void {
    // Leave more space at bottom for footer
    const bottomMargin = this.options.margin + 25;
    const maxY = this.options.pageHeight - bottomMargin;
    
    if (this.currentY + requiredSpace > maxY) {
      console.log(`Page break triggered: currentY=${this.currentY}, requiredSpace=${requiredSpace}, maxY=${maxY}`);
      this.pdf.addPage();
      this.currentY = this.options.margin + 10; // Reduced from 15
    }
  }

  getCurrentY(): number {
    return this.currentY;
  }

  setCurrentY(y: number): void {
    this.currentY = Math.max(y, this.options.margin);
  }

  addPageBreak(): void {
    this.pdf.addPage();
    this.currentY = this.options.margin + 10; // Reduced from 15
  }

  getRemainingSpace(): number {
    const bottomMargin = this.options.margin + 25;
    const maxY = this.options.pageHeight - bottomMargin;
    return maxY - this.currentY;
  }
}
