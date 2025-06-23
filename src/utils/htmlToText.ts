
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
  temp.innerHTML = html;

  const elements: TextElement[] = [];

  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
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

        case 'br':
          // Skip br tags in this structured approach
          break;

        case 'div':
        case 'span':
        case 'strong':
        case 'em':
        case 'b':
        case 'i':
          // For these elements, process their children
          for (const child of Array.from(element.childNodes)) {
            processNode(child);
          }
          break;

        default:
          // For any other elements, just extract text content
          const text = element.textContent?.trim();
          if (text) {
            elements.push({
              type: 'text',
              content: text
            });
          }
          break;
      }
    }
  };

  // Process all child nodes
  for (const child of Array.from(temp.childNodes)) {
    processNode(child);
  }

  return elements;
};

export const convertStructuredTextToPlain = (elements: TextElement[]): string => {
  return elements.map(element => {
    switch (element.type) {
      case 'heading':
        return `\n\n${element.content.toUpperCase()}\n\n`;
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
