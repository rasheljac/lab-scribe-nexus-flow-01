export interface TextElement {
  type: 'heading' | 'paragraph' | 'list' | 'text';
  content: string;
  level?: number; // for headings (1-6)
  isOrdered?: boolean; // for lists
  items?: string[]; // for lists
  formatting?: FormattingSpan[]; // for styled text
}

export interface FormattingSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  start: number;
  end: number;
}

export const convertHtmlToStructuredText = (html: string): TextElement[] => {
  if (!html) return [];

  console.log('Converting HTML to structured text...');
  
  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  const elements: TextElement[] = [];

  const extractFormattedText = (element: Element): { text: string; formatting: FormattingSpan[] } => {
    const formatting: FormattingSpan[] = [];
    let text = '';
    let currentPos = 0;

    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent || '';
        text += textContent;
        currentPos += textContent.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        const tagName = elem.tagName.toLowerCase();
        const startPos = currentPos;
        
        // Process child nodes first to get the text
        const childNodes = Array.from(elem.childNodes);
        childNodes.forEach(child => processNode(child));
        
        const endPos = currentPos;
        
        // Add formatting span for this element
        if (endPos > startPos) {
          const span: FormattingSpan = {
            text: text.substring(startPos, endPos),
            start: startPos,
            end: endPos
          };
          
          if (tagName === 'strong' || tagName === 'b') {
            span.bold = true;
          }
          if (tagName === 'em' || tagName === 'i') {
            span.italic = true;
          }
          if (tagName === 'sup') {
            span.superscript = true;
          }
          if (tagName === 'sub') {
            span.subscript = true;
          }
          
          if (span.bold || span.italic || span.superscript || span.subscript) {
            formatting.push(span);
          }
        }
      }
    };

    // Process all child nodes
    Array.from(element.childNodes).forEach(child => processNode(child));
    
    return { text: text.trim(), formatting };
  };

  const processElement = (element: Element): void => {
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const headingText = element.textContent?.trim();
        if (headingText) {
          elements.push({
            type: 'heading',
            content: headingText,
            level: parseInt(tagName.charAt(1))
          });
        }
        break;

      case 'p':
        const { text: paragraphText, formatting: paragraphFormatting } = extractFormattedText(element);
        if (paragraphText) {
          elements.push({
            type: 'paragraph',
            content: paragraphText,
            formatting: paragraphFormatting
          });
        }
        break;

      case 'ul':
      case 'ol':
        const listItems = Array.from(element.querySelectorAll('li'))
          .map(li => {
            const { text, formatting } = extractFormattedText(li);
            return { text: text.trim(), formatting };
          })
          .filter(item => item.text && item.text.length > 0);
        
        if (listItems.length > 0) {
          elements.push({
            type: 'list',
            content: '',
            isOrdered: tagName === 'ol',
            items: listItems.map(item => item.text),
            formatting: listItems.flatMap((item, index) => 
              item.formatting.map(span => ({
                ...span,
                // Adjust positions to account for list item prefixes
                start: span.start,
                end: span.end
              }))
            )
          });
        }
        break;

      case 'div':
        // Check if div has block-level children
        const hasBlockChildren = Array.from(element.children).some(child => 
          ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'].includes(child.tagName.toLowerCase())
        );
        
        if (hasBlockChildren) {
          // Process children recursively
          Array.from(element.children).forEach(child => processElement(child));
        } else {
          // Treat as paragraph if it has text content
          const { text: divText, formatting: divFormatting } = extractFormattedText(element);
          if (divText) {
            elements.push({
              type: 'paragraph',
              content: divText,
              formatting: divFormatting
            });
          }
        }
        break;

      case 'br':
        // Skip line breaks - they're handled by paragraph structure
        break;

      case 'li':
        // Skip - handled by ul/ol processing
        break;

      default:
        // For other elements, check if they have children or text content
        if (element.children.length > 0) {
          Array.from(element.children).forEach(child => processElement(child));
        } else {
          const { text, formatting } = extractFormattedText(element);
          if (text) {
            elements.push({
              type: 'text',
              content: text,
              formatting: formatting
            });
          }
        }
        break;
    }
  };

  // Process all direct children
  Array.from(temp.children).forEach(element => processElement(element));
  
  // If no structured elements were found, fall back to extracting all text as paragraphs
  if (elements.length === 0) {
    const { text: allText, formatting } = extractFormattedText(temp);
    if (allText) {
      // Split by double line breaks to create paragraphs
      const paragraphs = allText.split(/\n\s*\n/).filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        elements.push({
          type: 'paragraph',
          content: paragraph.trim().replace(/\n/g, ' ').replace(/\s+/g, ' '),
          formatting: formatting
        });
      });
    }
  }

  console.log(`Extracted ${elements.length} text elements`);
  return elements;
};

export const convertStructuredTextToPlain = (elements: TextElement[]): string => {
  return elements.map(element => {
    switch (element.type) {
      case 'heading':
        return `\n${element.content}\n${'='.repeat(Math.min(element.content.length, 50))}\n`;
      case 'paragraph':
        return `${element.content}\n\n`;
      case 'list':
        if (element.items) {
          return element.items.map((item, index) => {
            const prefix = element.isOrdered ? `${index + 1}. ` : '• ';
            return `${prefix}${item}`;
          }).join('\n') + '\n\n';
        }
        return '';
      case 'text':
        return `${element.content}\n`;
      default:
        return '';
    }
  }).join('').trim();
};
