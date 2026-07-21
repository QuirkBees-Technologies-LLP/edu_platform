import React from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

const LiveClosedCaptions = () => {
  const { useCallClosedCaptions } = useCallStateHooks();
  const closedCaptions = useCallClosedCaptions();

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
          maxHeight: '120px',
          overflow: 'hidden',
        }}
      >
        {closedCaptions.slice(-2).map((caption, index) => (
          <div
            key={`${caption.startTime}-${index}`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              textAlign: 'center',
              marginTop: '4px',
              backdropFilter: 'blur(4px)',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            {caption.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveClosedCaptions;
