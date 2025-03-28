import React from "react";

const RichTextContent = ({ content, className = "" }) => {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 italic">No content yet</p>
      </div>
    );
  }

  return (
    <div
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextContent;
