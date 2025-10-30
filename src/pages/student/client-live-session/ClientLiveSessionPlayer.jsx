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
    const isMobile = window.innerWidth < 768;

    if (!isMobile) return; // Only handle on mobile

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

    return () => container.removeEventListener("click", handleClick);
  }, []);

  const toggleFullscreen = async (element) => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }

        // Try to lock to landscape
        try {
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock("landscape");
          }
        } catch (err) {
          console.warn("Orientation lock failed:", err);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }

        // Unlock to portrait again
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        } catch (err) {
          console.warn("Orientation unlock failed:", err);
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
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
