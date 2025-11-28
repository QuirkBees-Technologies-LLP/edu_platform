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

/** ✅ Check if device is iOS */
const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const scrollPosRef = useRef(0);
  const isIOSDevice = isIOS();

  /** ✅ Update viewport height */
  useEffect(() => {
    const updateHeight = () => {
      setTimeout(() => setViewportHeight(window.innerHeight), 100);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  /** ✅ Lock body scroll */
  const lockBodyScroll = useCallback(() => {
    scrollPosRef.current = window.pageYOffset || document.documentElement.scrollTop;
    document.documentElement.classList.add("ios-fullscreen-active");
    document.body.classList.add("ios-fullscreen-active");
    document.body.style.top = `-${scrollPosRef.current}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }, []);

  /** ✅ Unlock body scroll */
  const unlockBodyScroll = useCallback(() => {
    document.documentElement.classList.remove("ios-fullscreen-active");
    document.body.classList.remove("ios-fullscreen-active");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, scrollPosRef.current);
  }, []);

  /** ✅ iOS Native Fullscreen - uses webkitEnterFullscreen on video element */
  const enterIOSFullscreen = useCallback(() => {
    const container = containerRef.current;
    console.log("🟡 Container:", container);
    if (!container) {
      console.log("🔴 No container found!");
      return false;
    }

    // Find the video element inside the Stream SDK
    const video = container.querySelector("video");
    console.log("🟡 Video element:", video);
    console.log("🟡 Video has webkitEnterFullscreen:", video?.webkitEnterFullscreen ? "YES" : "NO");
    console.log("🟡 Video has webkitSetPresentationMode:", video?.webkitSetPresentationMode ? "YES" : "NO");
    
    if (!video) {
      console.log("🔴 No video element found!");
      return false;
    }

    // Try iOS native fullscreen
    if (video.webkitEnterFullscreen) {
      try {
        console.log("🟢 Calling webkitEnterFullscreen...");
        video.webkitEnterFullscreen();
        return true;
      } catch (e) {
        console.log("🔴 webkitEnterFullscreen failed:", e);
      }
    }

    // Try webkit presentation mode
    if (video.webkitSetPresentationMode) {
      try {
        console.log("🟢 Calling webkitSetPresentationMode...");
        video.webkitSetPresentationMode("fullscreen");
        return true;
      } catch (e) {
        console.log("🔴 webkitSetPresentationMode failed:", e);
      }
    }

    return false;
  }, []);

  /** ✅ Toggle fullscreen */
  const toggleFullscreen = useCallback(() => {
    // DEBUG: Check if button click is registered
    console.log("🔵 Fullscreen button clicked!");
    console.log("🔵 isIOS:", isIOSDevice);
    console.log("🔵 Current isFullscreen:", isFullscreen);

    if (!isFullscreen) {
      // Try iOS native fullscreen first
      if (isIOSDevice) {
        console.log("🔵 Trying iOS native fullscreen...");
        const success = enterIOSFullscreen();
        console.log("🔵 iOS fullscreen result:", success);
        if (success) {
          return;
        }
        console.log("🔵 iOS native failed, falling back to CSS fullscreen");
      }
      // Fall back to CSS fullscreen
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  }, [isFullscreen, isIOSDevice, enterIOSFullscreen]);

  /** ✅ Handle fullscreen state changes */
  useEffect(() => {
    if (isFullscreen) {
      lockBodyScroll();
      setViewportHeight(window.innerHeight);
    } else {
      unlockBodyScroll();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, lockBodyScroll, unlockBodyScroll]);

  /** ✅ Listen for iOS native fullscreen exit */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const video = container.querySelector("video");
    if (!video) return;

    const handleFullscreenEnd = () => {
      setIsFullscreen(false);
    };

    // iOS fullscreen exit events
    video.addEventListener("webkitendfullscreen", handleFullscreenEnd);
    video.addEventListener("webkitpresentationmodechanged", (e) => {
      if (video.webkitPresentationMode === "inline") {
        setIsFullscreen(false);
      }
    });

    return () => {
      video.removeEventListener("webkitendfullscreen", handleFullscreenEnd);
    };
  }, [call]); // Re-run when call changes

  /** ✅ Cleanup on unmount */
  useEffect(() => {
    return () => unlockBodyScroll();
  }, [unlockBodyScroll]);

  const { isMuted, volume } = useLayout();

  /** ✅ Sync volume with media elements */
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

  const fullscreenStyles = isFullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: `${viewportHeight}px`,
        zIndex: 99999,
        backgroundColor: "#000",
        borderRadius: 0,
        overflow: "hidden",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }
    : undefined;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div
          ref={containerRef}
          className={`relative w-full h-full rounded-xl overflow-hidden live-player-container ${
            isFullscreen ? "css-fullscreen-active" : ""
          }`}
          style={fullscreenStyles}
        >
          {/* ✅ Fullscreen button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // DEBUG: Show alert to confirm button tap is detected
              alert("Button tapped! isFullscreen: " + isFullscreen);
              toggleFullscreen();
            }}
            className="absolute bottom-[52px] right-3 z-[100000] bg-black/60 hover:bg-black/80 text-white rounded p-1.5 transition-all custom-fullscreen-btn"
            style={{
              pointerEvents: "auto",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "rgba(255,255,255,0.3)",
            }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
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
