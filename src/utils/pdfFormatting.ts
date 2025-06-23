
import jsPDF from 'jspdf';
import { TextElement } from './htmlToText';

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

  constructor(pdf: jsPDF, options: PDFFormattingOptions) {
    this.pdf = pdf;
    this.options = options;
    this.currentY = options.margin;
  }

  addHeading(text: string, level: number = 1): void {
    this.checkPageBreak(15);
    
    // Add space before heading
    this.currentY += level === 1 ? 10 : 8;
    
    // Set font based on heading level
    const fontSize = Math.max(16 - (level - 1) * 2, 12);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.options.contentWidth);
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += lines.length * 6 + 8;
  }

  addParagraph(text: string): void {
    this.checkPageBreak(10);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.options.contentWidth);
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += lines.length * 5.5 + 6;
  }

  addList(items: string[], isOrdered: boolean = false): void {
    this.checkPageBreak(items.length * 6);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    items.forEach((item, index) => {
      const prefix = isOrdered ? `${index + 1}. ` : '• ';
      const fullText = `${prefix}${item}`;
      
      const lines = this.pdf.splitTextToSize(fullText, this.options.contentWidth - 5);
      this.pdf.text(lines, this.options.margin + 5, this.currentY);
      this.currentY += lines.length * 5.5 + 2;
    });
    
    this.currentY += 6;
  }

  addText(text: string): void {
    this.checkPageBreak(8);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(text, this.options.contentWidth);
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += lines.length * 5.5 + 3;
  }

  addSeparator(): void {
    this.checkPageBreak(5);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.options.margin, this.currentY, this.options.pageWidth - this.options.margin, this.currentY);
    this.currentY += 10;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.options.pageHeight - this.options.margin) {
      this.pdf.addPage();
      this.currentY = this.options.margin + 25; // Leave space for header
    }
  }

  getCurrentY(): number {
    return this.currentY;
  }

  setCurrentY(y: number): void {
    this.currentY = y;
  }
}
