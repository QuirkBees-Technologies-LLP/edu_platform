import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useRef } from "react";

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const container = playerRef.current;

    // Detect mobile
    const isMobile = window.innerWidth < 768;

    if (!isMobile) return; // Only apply on mobile

    // Delegate click to fullscreen icon
    const handleClick = (e) => {
      const fullscreenButton = e.target.closest(
        '[data-testid="fullscreen-button"]'
      );
      if (fullscreenButton) {
        e.stopPropagation();
        e.preventDefault();
        toggleFullscreen(container);
      }
    };

    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, []);

  const toggleFullscreen = async (element) => {
    if (!document.fullscreenElement) {
      try {
        await element.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn("Exit fullscreen failed:", err);
      }
    }
  };

  return (
    client && (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <div
            ref={playerRef}
            className="relative w-full h-full rounded-xl overflow-hidden live-player-container"
          >
            <LivestreamPlayer
              displayName="Hello guys"
              layoutProps={{
                showLiveBadge: true,
                showSpeakerName: true,
                showParticipantCount: false,
                showDuration: true,
                enableFullScreen: true,
              }}
              callType="livestream"
              callId={callId}
            />
          </div>
        </StreamCall>
      </StreamVideo>
    )
  );
};

export default ClientLiveSessionPlayer;
