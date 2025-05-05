import React, { useState } from 'react';

const ShowMoreLess = ({
  text = '',
  html = '',
  limit = 120,
  showMoreText = ' Show More',
  showLessText = ' Show Less',
}) => {
  const [expanded, setExpanded] = useState(false);

  const isHtml = !!html;
  const content = isHtml ? html : text;
  const plainText = isHtml ? html.replace(/<[^>]+>/g, '') : text;
  const isLong = plainText.length > limit;

  const displayed = expanded || !isLong
    ? content
    : plainText.substring(0, limit);

  return (
    <div className="text-sm text-gray-700 leading-relaxed">
      {isHtml ? (
        <span dangerouslySetInnerHTML={{ __html: displayed }} />
      ) : (
        <span>{displayed}</span>
      )}
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 cursor-pointer hover:underline"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

export default ShowMoreLess;
