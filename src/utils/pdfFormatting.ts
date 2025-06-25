
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
  private lineHeight: number = 4.5;

  constructor(pdf: jsPDF, options: PDFFormattingOptions) {
    this.pdf = pdf;
    this.options = options;
    this.currentY = options.margin;
  }

  addHeading(text: string, level: number = 1): void {
    if (!text.trim()) return;
    
    const spaceAbove = level === 1 ? 6 : 4;
    
    // Set font based on heading level
    const fontSize = Math.max(16 - (level - 1) * 2, 12);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    // Split text and calculate required height
    const lines = this.pdf.splitTextToSize(text.trim(), this.options.contentWidth);
    const textHeight = lines.length * (fontSize * 0.35);
    const totalHeight = spaceAbove + textHeight + 4;
    
    // Check for page break
    this.checkPageBreak(totalHeight);
    
    // Add space above
    this.currentY += spaceAbove;
    
    // Add the heading
    this.pdf.text(lines, this.options.margin, this.currentY);
    this.currentY += textHeight + 4;
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
      const totalHeight = textHeight + 3;
      
      this.checkPageBreak(totalHeight);
      
      this.pdf.text(lines, this.options.margin, this.currentY);
      this.currentY += textHeight + 3;
    }
  }

  private addFormattedText(text: string, formatting: FormattingSpan[]): void {
    // Sort formatting spans by start position
    const sortedFormatting = [...formatting].sort((a, b) => a.start - b.start);
    
    // Calculate total height needed for proper page break
    const estimatedLines = Math.ceil(this.pdf.getTextWidth(text) / this.options.contentWidth);
    const totalHeight = estimatedLines * this.lineHeight + 3;
    this.checkPageBreak(totalHeight);
    
    let currentX = this.options.margin;
    const startY = this.currentY;
    let charIndex = 0;
    
    // Process each character with its formatting
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Find active formatting spans for this character
      const activeSpans = sortedFormatting.filter(span => i >= span.start && i < span.end);
      
      // Determine font style and size
      let fontStyle = 'normal';
      let fontSize = 11;
      let yOffset = 0;
      
      if (activeSpans.length > 0) {
        // Apply formatting - prioritize in order: bold, italic, superscript, subscript
        const hasBold = activeSpans.some(span => span.bold);
        const hasItalic = activeSpans.some(span => span.italic);
        const hasSuperscript = activeSpans.some(span => span.superscript);
        const hasSubscript = activeSpans.some(span => span.subscript);
        
        if (hasBold && hasItalic) {
          fontStyle = 'bolditalic';
        } else if (hasBold) {
          fontStyle = 'bold';
        } else if (hasItalic) {
          fontStyle = 'italic';
        }
        
        // Handle superscript and subscript
        if (hasSuperscript) {
          fontSize = 8;
          yOffset = -2; // Move up for superscript
        } else if (hasSubscript) {
          fontSize = 8;
          yOffset = 1; // Move down for subscript
        }
      }
      
      this.pdf.setFont('helvetica', fontStyle);
      this.pdf.setFontSize(fontSize);
      
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
      
      // Add the character at the appropriate position
      this.pdf.text(char, currentX, this.currentY + yOffset);
      currentX += this.pdf.getTextWidth(char);
      
      charIndex++;
    }
    
    this.currentY += this.lineHeight + 3;
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
      const itemHeight = lines.length * this.lineHeight + 1.5;
      
      this.checkPageBreak(itemHeight);
      
      this.pdf.text(lines, this.options.margin + 10, this.currentY);
      this.currentY += itemHeight;
    });
    
    this.currentY += 2;
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
      const totalHeight = textHeight + 2;
      
      this.checkPageBreak(totalHeight);
      
      this.pdf.text(lines, this.options.margin, this.currentY);
      this.currentY += textHeight + 2;
    }
  }

  addSeparator(): void {
    const separatorHeight = 8;
    this.checkPageBreak(separatorHeight);
    
    this.currentY += 2;
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(
      this.options.margin, 
      this.currentY, 
      this.options.pageWidth - this.options.margin, 
      this.currentY
    );
    this.currentY += 6;
  }

  private checkPageBreak(requiredSpace: number): void {
    const bottomMargin = this.options.margin + 25;
    const maxY = this.options.pageHeight - bottomMargin;
    
    if (this.currentY + requiredSpace > maxY) {
      console.log(`Page break triggered: currentY=${this.currentY}, requiredSpace=${requiredSpace}, maxY=${maxY}`);
      this.pdf.addPage();
      this.currentY = this.options.margin + 8;
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
    this.currentY = this.options.margin + 8;
  }

  getRemainingSpace(): number {
    const bottomMargin = this.options.margin + 25;
    const maxY = this.options.pageHeight - bottomMargin;
    return maxY - this.currentY;
  }
}
