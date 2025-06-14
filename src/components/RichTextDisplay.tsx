
import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
}

const RichTextDisplay = ({ content, className = "", maxLength }: RichTextDisplayProps) => {
  if (!content) return null;

  // If maxLength is specified, strip HTML for length calculation and truncation
  if (maxLength) {
    const stripHtml = (html: string) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    const plainText = stripHtml(content);
    if (plainText.length > maxLength) {
      const truncatedPlainText = plainText.substring(0, maxLength) + '...';
      return (
        <div className={className}>
          {truncatedPlainText}
        </div>
      );
    }
  }

  // Render full HTML content with proper styling
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
