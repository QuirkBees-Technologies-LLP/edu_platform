import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLayout } from "../../../providers";

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen using CSS-only approach (avoids SDK conflicts)
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when in fullscreen
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  //   const [volume, setVolume] = useState(1);
  //   const [isMuted, setIsMuted] = useState(false);
  //   const controlsRef = useRef(null);

  //   useEffect(() => {
  //     if (!call) return;
  //     try {
  //       call.setMasterOutputVolume(isMuted ? 0 : volume);
  //     } catch (err) {
  //       console.warn("Failed to set master output volume:", err);
  //     }
  //   }, [volume, isMuted, call]);

  //   const toggleMute = () => setIsMuted(!isMuted);

  const { useSpeakerState } = useCallStateHooks();

  const { speaker } = useSpeakerState();
  const { isMuted, volume } = useLayout();

  useEffect(() => {
    if (!speaker) return;

    const target = isMuted ? 0 : Number(volume ?? 1);
    speaker.setVolume(target);
  }, [speaker, volume, isMuted]);

  if (!client || !call) return null;
  return (
    client && (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <div
            ref={containerRef}
            className={`relative w-full h-full rounded-xl overflow-hidden live-player-container ${
              isFullscreen ? "css-fullscreen-active" : ""
            }`}
            style={{
              ...(isFullscreen && {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                maxWidth: "100vw",
                maxHeight: "100vh",
                borderRadius: 0,
                zIndex: 99999,
                backgroundColor: "#000",
              }),
            }}
          >
            {/* Custom fullscreen button */}
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
            {/* 
            <div
              ref={controlsRef}
              className="absolute bottom-3.5 right-14 flex items-center gap-2 group opacity-70 z-[99999] pointer-events-auto"
            >
              <button
                onClick={toggleMute}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition flex items-center justify-center"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>

              <div className="w-24  opacity-0 group-hover:opacity-100 transition duration-200">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    if (isMuted && val > 0) setIsMuted(false);
                  }}
                  className="w-full h-1 rounded-lg accent-yellow-300"
                />
              </div>
            </div> */}
          </div>
        </StreamCall>
      </StreamVideo>
    )
  );
};

export default ClientLiveSessionPlayer;
