
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

  // Render full HTML content with proper styling for headings and rich text
  return (
    <div 
      className={`prose prose-gray max-w-none 
        prose-headings:text-gray-900 prose-headings:mb-2 
        prose-p:text-gray-700 prose-strong:text-gray-900 
        prose-ul:mt-2 prose-ol:mt-2 prose-li:my-0
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
