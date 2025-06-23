
import jsPDF from 'jspdf';
import { FormattingSpan } from './htmlToText';

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
  private lineHeight: number = 5;

  constructor(pdf: jsPDF, options: PDFFormattingOptions) {
    this.pdf = pdf;
    this.options = options;
    this.currentY = options.margin;
  }

  addHeading(text: string, level: number = 1): void {
    if (!text.trim()) return;
    
    const spaceAbove = level === 1 ? 8 : 6;
    
    // Set font based on heading level
    const fontSize = Math.max(16 - (level - 1) * 2, 12);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    // Split text and calculate required height
    const lines = this.pdf.splitTextToSize(text.trim(), this.options.contentWidth);
    const textHeight = lines.length * (fontSize * 0.35);
    const totalHeight = spaceAbove + textHeight + 5;
    
    // Check for page break
    this.checkPageBreak(totalHeight);
    
    // Add space above
    this.currentY += spaceAbove;
    
    // Add the heading
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += textHeight + 5;
  }

  addParagraph(text: string, formatting?: FormattingSpan[]): void {
    if (!text.trim()) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    
    // Clean the text
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (formatting && formatting.length > 0) {
      this.addFormattedText(cleanText, formatting);
    } else {
      this.pdf.setFont('helvetica', 'normal');
      const lines = this.pdf.splitTextToSize(cleanText, this.options.contentWidth);
      const textHeight = lines.length * this.lineHeight;
      const totalHeight = textHeight + 4;
      
      this.checkPageBreak(totalHeight);
      
      this.pdf.text(lines, this.options.margin, this.currentY);
      this.currentY += textHeight + 4;
    }
  }

  private addFormattedText(text: string, formatting: FormattingSpan[]): void {
    // Sort formatting spans by start position
    const sortedFormatting = [...formatting].sort((a, b) => a.start - b.start);
    
    let currentPos = 0;
    let currentX = this.options.margin;
    const startY = this.currentY;
    
    // Calculate total height needed
    const words = text.split(' ');
    let testText = '';
    let lineCount = 1;
    
    words.forEach((word, index) => {
      const testLine = testText + (index > 0 ? ' ' : '') + word;
      const lineWidth = this.pdf.getTextWidth(testLine);
      
      if (lineWidth > this.options.contentWidth && testText) {
        lineCount++;
        testText = word;
      } else {
        testText = testLine;
      }
    });
    
    const totalHeight = lineCount * this.lineHeight + 4;
    this.checkPageBreak(totalHeight);
    
    // Reset position after potential page break
    currentX = this.options.margin;
    this.currentY = this.getCurrentY();
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Check if we're at the start of a formatting span
      const activeSpan = sortedFormatting.find(span => i >= span.start && i < span.end);
      
      // Set font style based on active formatting
      if (activeSpan?.bold) {
        this.pdf.setFont('helvetica', 'bold');
      } else {
        this.pdf.setFont('helvetica', 'normal');
      }
      
      // Handle line wrapping
      if (char === ' ') {
        // Check if next word fits on current line
        const nextSpaceIndex = text.indexOf(' ', i + 1);
        const nextWord = nextSpaceIndex === -1 ? text.substring(i + 1) : text.substring(i + 1, nextSpaceIndex);
        const nextWordWidth = this.pdf.getTextWidth(nextWord);
        
        if (currentX + this.pdf.getTextWidth(' ') + nextWordWidth > this.options.pageWidth - this.options.margin) {
          // Move to next line
          this.currentY += this.lineHeight;
          currentX = this.options.margin;
          continue; // Skip the space at the beginning of a new line
        }
      }
      
      // Add the character
      this.pdf.text(char, currentX, this.currentY);
      currentX += this.pdf.getTextWidth(char);
      
      currentPos++;
    }
    
    this.currentY += this.lineHeight + 4;
  }

  addList(items: string[], isOrdered: boolean = false, formatting?: FormattingSpan[]): void {
    if (!items || items.length === 0) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    
    items.forEach((item, index) => {
      const trimmedItem = item.trim();
      if (!trimmedItem) return;
      
      const prefix = isOrdered ? `${index + 1}. ` : '• ';
      const fullText = `${prefix}${trimmedItem}`;
      
      // For now, render list items without formatting (could be enhanced later)
      this.pdf.setFont('helvetica', 'normal');
      const lines = this.pdf.splitTextToSize(fullText, this.options.contentWidth - 10);
      const itemHeight = lines.length * this.lineHeight + 2;
      
      this.checkPageBreak(itemHeight);
      
      this.pdf.text(lines, this.options.margin + 10, this.currentY);
      this.currentY += itemHeight;
    });
    
    this.currentY += 3;
  }

  addText(text: string, formatting?: FormattingSpan[]): void {
    if (!text.trim()) return;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(0, 0, 0);
    
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    if (formatting && formatting.length > 0) {
      this.addFormattedText(cleanText, formatting);
    } else {
      this.pdf.setFont('helvetica', 'normal');
      const lines = this.pdf.splitTextToSize(cleanText, this.options.contentWidth);
      const textHeight = lines.length * this.lineHeight;
      const totalHeight = textHeight + 3;
      
      this.checkPageBreak(totalHeight);
      
      this.pdf.text(lines, this.options.margin, this.currentY);
      this.currentY += textHeight + 3;
    }
  }

  addSeparator(): void {
    const separatorHeight = 10;
    this.checkPageBreak(separatorHeight);
    
    this.currentY += 3;
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(
      this.options.margin, 
      this.currentY, 
      this.options.pageWidth - this.options.margin, 
      this.currentY
    );
    this.currentY += 7;
  }

  private checkPageBreak(requiredSpace: number): void {
    const bottomMargin = this.options.margin + 25;
    const maxY = this.options.pageHeight - bottomMargin;
    
    if (this.currentY + requiredSpace > maxY) {
      console.log(`Page break triggered: currentY=${this.currentY}, requiredSpace=${requiredSpace}, maxY=${maxY}`);
      this.pdf.addPage();
      this.currentY = this.options.margin + 10;
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
    this.currentY = this.options.margin + 10;
  }

  getRemainingSpace(): number {
    const bottomMargin = this.options.margin + 25;
    const maxY = this.options.pageHeight - bottomMargin;
    return maxY - this.currentY;
  }
}
