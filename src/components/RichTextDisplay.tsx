
import React from 'react';

interface RichTextDisplayProps {
  content: string;
  className?: string;
  maxLength?: number;
}

const RichTextDisplay = ({ content, className = "", maxLength }: RichTextDisplayProps) => {
  if (!content) return null;

  // Strip HTML tags for plain text display
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const plainText = stripHtml(content);
  const displayText = maxLength && plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText;

  return (
    <div className={className}>
      {displayText}
    </div>
  );
};

export default RichTextDisplay;
