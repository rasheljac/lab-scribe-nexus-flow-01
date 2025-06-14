
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
      className={`prose prose-sm max-w-none 
        prose-headings:font-bold prose-headings:text-gray-900 prose-headings:leading-tight
        prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-2xl prose-h2:mb-5 prose-h2:mt-7
        prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-6
        prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-5
        prose-h5:text-base prose-h5:mb-3 prose-h5:mt-4
        prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-3
        prose-p:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed
        prose-ul:mb-4 prose-ul:ml-6 prose-ul:list-disc
        prose-ol:mb-4 prose-ol:ml-6 prose-ol:list-decimal
        prose-li:mb-1 prose-li:text-gray-700
        prose-strong:font-semibold prose-strong:text-gray-900
        prose-em:italic
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
