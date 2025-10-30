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
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const videoEl = element.querySelector("video");

    try {
      // ENTER fullscreen
      if (!document.fullscreenElement) {
        if (isIOS && videoEl && videoEl.webkitEnterFullscreen) {
          // iOS-specific native fullscreen
          videoEl.webkitEnterFullscreen();
        } else if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }

        // Orientation lock for Android only
        if (isAndroid && screen.orientation?.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (err) {
            console.warn("Orientation lock failed:", err);
          }
        }
      } else {
        // EXIT fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }

        // Unlock orientation if supported
        if (isAndroid && screen.orientation?.unlock) {
          try {
            await screen.orientation.unlock();
          } catch (err) {
            console.warn("Orientation unlock failed:", err);
          }
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
            className="relative w-full h-full rounded-xl overflow-hidden bg-black live-player-container"
          >
            <LivestreamPlayer
              displayName="IQ Academy"
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
