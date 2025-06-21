
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
        prose-headings:text-gray-900 prose-headings:mb-2 prose-headings:mt-4
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:text-gray-700 prose-p:mb-3 prose-p:leading-relaxed
        prose-strong:text-gray-900 prose-strong:font-semibold
        prose-em:italic prose-em:text-gray-700
        prose-ul:mt-2 prose-ul:mb-3 prose-ol:mt-2 prose-ol:mb-3 
        prose-li:my-1 prose-li:text-gray-700
        prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
        prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-img:rounded prose-img:shadow-sm
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
