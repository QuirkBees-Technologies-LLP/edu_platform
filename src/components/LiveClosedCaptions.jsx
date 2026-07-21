import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCallStateHooks } from '@stream-io/video-react-sdk';

const LiveClosedCaptions = () => {
  const { useCallClosedCaptions, useIsCallLive } = useCallStateHooks();
  const closedCaptions = useCallClosedCaptions();
  const isLive = useIsCallLive();
  const [showCaptions, setShowCaptions] = useState(true);
  const [portalTarget, setPortalTarget] = useState(null);

  const toggleCaptions = useCallback(() => {
    setShowCaptions((prev) => !prev);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) {
        fsEl.style.position = 'relative';
        setPortalTarget(fsEl);
      } else {
        setPortalTarget(null);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  // Inject global CSS for fullscreen captions overlay
  useEffect(() => {
    const styleId = 'live-captions-fullscreen-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .captions-overlay-root {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          pointer-events: none !important;
          z-index: 99999 !important;
        }
        .captions-cc-btn {
          pointer-events: auto !important;
          z-index: 100000 !important;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  // Don't render anything if stream is not live
  if (!isLive) return null;

  const content = (
    <div className="captions-overlay-root">
      {/* CC Toggle Button */}
      <button
        className="captions-cc-btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCaptions();
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '60px',
          backgroundColor: showCaptions
            ? 'rgba(255, 255, 255, 0.25)'
            : 'rgba(255, 255, 255, 0.08)',
          color: showCaptions ? '#fff' : 'rgba(255, 255, 255, 0.4)',
          border: showCaptions
            ? '1px solid rgba(255, 255, 255, 0.5)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '4px',
          padding: '3px 6px',
          fontSize: '10px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.5px',
          lineHeight: '1',
          transition: 'all 0.2s ease',
        }}
        title={showCaptions ? 'Hide Captions' : 'Show Captions'}
      >
        CC
      </button>

      {/* Captions Text */}
      {showCaptions && closedCaptions && closedCaptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
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
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
      )}
    </div>
  );

  // Fullscreen: portal into fullscreen element
  if (portalTarget) {
    return createPortal(content, portalTarget);
  }

  // Normal mode
  return content;
};

export default LiveClosedCaptions;
