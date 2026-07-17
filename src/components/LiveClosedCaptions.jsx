import React, { useEffect, useRef } from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

const LiveClosedCaptions = () => {
  const { useCallClosedCaptions } = useCallStateHooks();
  const closedCaptions = useCallClosedCaptions();
  const bottomRef = useRef(null);

  // Auto-scroll to latest caption
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [closedCaptions]);

  if (!closedCaptions || closedCaptions.length === 0) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center justify-end pointer-events-none z-[9999] p-4">
      <div className="flex flex-col items-center max-w-[80%] max-h-[150px] overflow-hidden">
        {closedCaptions.slice(-3).map((caption, index) => (
          <div 
            key={`${caption.startTime}-${index}`} 
            className="bg-black/60 text-white px-4 py-2 rounded-lg text-center mt-2 mb-1 shadow-lg backdrop-blur-sm transition-all"
          >
            <span className="font-semibold text-blue-300 mr-2">
              {caption.user?.name || caption.speakerId || "Speaker"}:
            </span>
            <span className="text-lg">{caption.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LiveClosedCaptions;
