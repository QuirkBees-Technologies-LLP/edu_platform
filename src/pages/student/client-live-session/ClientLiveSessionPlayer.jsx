import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLayout } from "../../../providers";

/** ✅ Get real media elements (Stream SDK fallback) */
const getStreamMediaElements = () =>
  Array.from(document.querySelectorAll("audio, video")).filter(
    (el) => el.srcObject
  );

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(null);

  /** ✅ Fix mobile viewport height */
  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", () =>
      setTimeout(updateViewportHeight, 100)
    );
    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  /** ✅ Fullscreen toggle */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((p) => !p);
  }, []);

  /** ✅ ESC exit fullscreen + prevent body scroll */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const { isMuted, volume } = useLayout();

  useEffect(() => {
    const medias = getStreamMediaElements();
    if (!medias.length) return;

    const target = isMuted ? 0 : Number(volume ?? 1);

    medias.forEach((media) => {
      media.muted = target === 0;
      media.volume = Math.min(Math.max(target, 0), 1);
    });
  }, [isMuted, volume]);

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div
          ref={containerRef}
          className={`relative w-full h-full rounded-xl overflow-hidden live-player-container ${
            isFullscreen ? "css-fullscreen-active" : ""
          }`}
          style={
            isFullscreen
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: viewportHeight ? `${viewportHeight}px` : "100vh",
                  zIndex: 99999,
                  backgroundColor: "#000",
                  borderRadius: 0,
                }
              : undefined
          }
        >
          {/* ✅ Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-[52px] right-3 z-[100000] bg-black/60 hover:bg-black/80 text-white rounded p-1.5 transition-all custom-fullscreen-btn"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              // Exit fullscreen icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              // Enter fullscreen icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>

          {/* ✅ Stream player */}
          <LivestreamPlayer
            displayName="Hello guys"
            layoutProps={{
              showLiveBadge: true,
              showSpeakerName: true,
              showParticipantCount: false,
              showDuration: true,
              enableFullScreen: true,
              muted: isMuted,
            }}
            callType="livestream"
            callId={callId}
          />
        </div>
      </StreamCall>
    </StreamVideo>
  );
};

export default ClientLiveSessionPlayer;
