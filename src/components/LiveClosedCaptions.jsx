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

  // Debug: log captions to console
  useEffect(() => {
    if (closedCaptions && closedCaptions.length > 0) {
      console.log("🎤 Closed Captions received:", closedCaptions);
    }
  }, [closedCaptions]);

  if (!closedCaptions || closedCaptions.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '64px',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '80%',
          maxHeight: '150px',
          overflow: 'hidden',
        }}
      >
        {closedCaptions.slice(-3).map((caption, index) => (
          <div
            key={`${caption.startTime}-${index}`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '8px',
              marginBottom: '4px',
              backdropFilter: 'blur(4px)',
              fontSize: '16px',
              lineHeight: '1.4',
            }}
          >
            <span style={{ fontWeight: 600, color: '#93c5fd', marginRight: '8px' }}>
              {caption.user?.name || caption.speakerId || "Speaker"}:
            </span>
            <span>{caption.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LiveClosedCaptions;
