
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
      className={`prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
