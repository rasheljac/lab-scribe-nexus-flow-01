
import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
}

const RichTextDisplay = ({ content, className = "", maxLength }: RichTextDisplayProps) => {
  if (!content) return null;

  // If maxLength is specified, we need to truncate the HTML content
  let displayContent = content;
  
  if (maxLength) {
    // Strip HTML tags for length calculation
    const stripHtml = (html: string) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };
    
    const plainText = stripHtml(content);
    if (plainText.length > maxLength) {
      // For truncated content, show plain text with ellipsis
      return (
        <div className={className}>
          {plainText.substring(0, maxLength) + '...'}
        </div>
      );
    }
  }

  return (
    <div 
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: displayContent }}
    />
  );
};

export default RichTextDisplay;
