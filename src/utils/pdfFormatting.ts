
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
  private lineHeight: number = 5.5;

  constructor(pdf: jsPDF, options: PDFFormattingOptions) {
    this.pdf = pdf;
    this.options = options;
    this.currentY = options.margin;
  }

  addHeading(text: string, level: number = 1): void {
    // Add space before heading
    const spaceAbove = level === 1 ? 15 : 12;
    this.checkPageBreak(spaceAbove + 12);
    this.currentY += spaceAbove;
    
    // Set font based on heading level
    const fontSize = Math.max(16 - (level - 1) * 2, 12);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.options.contentWidth);
    
    // Check if we have enough space for the heading
    const requiredHeight = lines.length * 6;
    this.checkPageBreak(requiredHeight + 8);
    
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += requiredHeight + 8;
  }

  addParagraph(text: string): void {
    if (!text.trim()) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.options.contentWidth);
    const requiredHeight = lines.length * this.lineHeight + 6;
    
    // Check if we need a page break
    this.checkPageBreak(requiredHeight);
    
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += requiredHeight;
  }

  addList(items: string[], isOrdered: boolean = false): void {
    if (!items || items.length === 0) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    items.forEach((item, index) => {
      if (!item.trim()) return;
      
      const prefix = isOrdered ? `${index + 1}. ` : '• ';
      const fullText = `${prefix}${item.trim()}`;
      
      const lines = this.pdf.splitTextToSize(fullText, this.options.contentWidth - 8);
      const itemHeight = lines.length * this.lineHeight + 2;
      
      this.checkPageBreak(itemHeight);
      
      this.pdf.text(lines, this.options.margin + 8, this.currentY);
      this.currentY += itemHeight;
    });
    
    this.currentY += 6; // Space after list
  }

  addText(text: string): void {
    if (!text.trim()) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.options.contentWidth);
    const requiredHeight = lines.length * this.lineHeight + 3;
    
    this.checkPageBreak(requiredHeight);
    
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += requiredHeight;
  }

  addSeparator(): void {
    this.checkPageBreak(15);
    this.currentY += 5;
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(
      this.options.margin, 
      this.currentY, 
      this.options.pageWidth - this.options.margin, 
      this.currentY
    );
    this.currentY += 10;
  }

  private checkPageBreak(requiredSpace: number): void {
    const bottomMargin = this.options.margin + 20; // Extra space for footer
    const availableSpace = this.options.pageHeight - bottomMargin - this.currentY;
    
    if (availableSpace < requiredSpace) {
      this.pdf.addPage();
      this.currentY = this.options.margin + 10; // Start with some margin from top
    }
  }

  getCurrentY(): number {
    return this.currentY;
  }

  setCurrentY(y: number): void {
    this.currentY = y;
  }

  addPageBreak(): void {
    this.pdf.addPage();
    this.currentY = this.options.margin + 10;
  }
}
