
export interface TextElement {
  type: 'heading' | 'paragraph' | 'list' | 'text';
  content: string;
  level?: number; // for headings (1-6)
  isOrdered?: boolean; // for lists
  items?: string[]; // for lists
}

export const convertHtmlToStructuredText = (html: string): TextElement[] => {
  if (!html) return [];

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '</p>\n');

  const elements: TextElement[] = [];

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        elements.push({
          type: 'text',
          content: text
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
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

        case 'li':
          // Skip li elements as they're handled by ul/ol
          break;

        case 'br':
          // Add line break as text
          elements.push({
            type: 'text',
            content: '\n'
          });
          break;

        case 'div':
          // Process div children, but add paragraph breaks
          const divText = element.textContent?.trim();
          if (divText) {
            elements.push({
              type: 'paragraph',
              content: divText
            });
          } else {
            // Process children if no direct text
            for (const child of Array.from(element.childNodes)) {
              processNode(child);
            }
          }
          break;

        case 'span':
        case 'strong':
        case 'em':
        case 'b':
        case 'i':
          // For inline elements, just extract text
          const inlineText = element.textContent?.trim();
          if (inlineText) {
            elements.push({
              type: 'text',
              content: inlineText
            });
          }
          break;

        default:
          // For any other elements, process children or extract text
          if (element.children.length > 0) {
            for (const child of Array.from(element.childNodes)) {
              processNode(child);
            }
          } else {
            const text = element.textContent?.trim();
            if (text) {
              elements.push({
                type: 'paragraph',
                content: text
              });
            }
          }
          break;
      }
    }
  };

  // Process all child nodes
  for (const child of Array.from(temp.childNodes)) {
    processNode(child);
  }

  // Clean up and merge adjacent text elements
  const cleanedElements: TextElement[] = [];
  let currentText = '';

  for (const element of elements) {
    if (element.type === 'text') {
      currentText += (currentText ? ' ' : '') + element.content;
    } else {
      if (currentText.trim()) {
        cleanedElements.push({
          type: 'paragraph',
          content: currentText.trim()
        });
        currentText = '';
      }
      cleanedElements.push(element);
    }
  }

  // Add any remaining text
  if (currentText.trim()) {
    cleanedElements.push({
      type: 'paragraph',
      content: currentText.trim()
    });
  }

  return cleanedElements;
};

export const convertStructuredTextToPlain = (elements: TextElement[]): string => {
  return elements.map(element => {
    switch (element.type) {
      case 'heading':
        return `\n\n${element.content.toUpperCase()}\n${'='.repeat(element.content.length)}\n`;
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
        return `${element.content} `;
      default:
        return '';
    }
  }).join('').trim();
};
