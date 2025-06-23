
export interface TextElement {
  type: 'heading' | 'paragraph' | 'list' | 'text';
  content: string;
  level?: number; // for headings (1-6)
  isOrdered?: boolean; // for lists
  items?: string[]; // for lists
}

export const convertHtmlToStructuredText = (html: string): TextElement[] => {
  if (!html) return [];

  console.log('Converting HTML to structured text...');
  
  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  const elements: TextElement[] = [];

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
        const paragraphText = element.textContent?.trim();
        if (paragraphText) {
          elements.push({
            type: 'paragraph',
            content: paragraphText
          });
        }
        break;

      case 'ul':
      case 'ol':
        const listItems = Array.from(element.querySelectorAll('li'))
          .map(li => li.textContent?.trim())
          .filter(text => text && text.length > 0) as string[];
        
        if (listItems.length > 0) {
          elements.push({
            type: 'list',
            content: '',
            isOrdered: tagName === 'ol',
            items: listItems
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
          const divText = element.textContent?.trim();
          if (divText) {
            elements.push({
              type: 'paragraph',
              content: divText
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
          const text = element.textContent?.trim();
          if (text) {
            elements.push({
              type: 'text',
              content: text
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
    const allText = temp.textContent?.trim();
    if (allText) {
      // Split by double line breaks to create paragraphs
      const paragraphs = allText.split(/\n\s*\n/).filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        elements.push({
          type: 'paragraph',
          content: paragraph.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ')
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
