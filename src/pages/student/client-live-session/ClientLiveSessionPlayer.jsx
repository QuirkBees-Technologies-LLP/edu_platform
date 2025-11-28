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

/** ✅ Detect iOS device - comprehensive check */
const isIOSDevice = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  
  // Check for iOS devices
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  // Check for iPad on iOS 13+ (reports as MacIntel)
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  
  return isIOS || isIPadOS;
};

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const scrollPosRef = useRef(0);
  const isIOS = useRef(isIOSDevice()).current;

  /** ✅ Update viewport height - iOS needs this for accurate height */
  useEffect(() => {
    const updateHeight = () => {
      // Use setTimeout for iOS to get accurate height after UI changes
      setTimeout(() => {
        setViewportHeight(window.innerHeight);
      }, 100);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    
    // iOS-specific: also listen for scroll to catch address bar changes
    if (isIOS) {
      window.addEventListener("scroll", updateHeight);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
      if (isIOS) {
        window.removeEventListener("scroll", updateHeight);
      }
    };
  }, [isIOS]);

  /** ✅ Lock body scroll - iOS specific implementation */
  const lockBodyScroll = useCallback(() => {
    scrollPosRef.current = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add class for CSS
    document.documentElement.classList.add("ios-fullscreen-active");
    document.body.classList.add("ios-fullscreen-active");
    
    // iOS requires setting top position to maintain scroll position
    document.body.style.top = `-${scrollPosRef.current}px`;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
    
    // Also lock html element for iOS
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
  }, []);

  /** ✅ Unlock body scroll */
  const unlockBodyScroll = useCallback(() => {
    document.documentElement.classList.remove("ios-fullscreen-active");
    document.body.classList.remove("ios-fullscreen-active");
    
    // Reset styles
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.height = "";
    
    // Restore scroll position
    window.scrollTo(0, scrollPosRef.current);
  }, []);

  /** ✅ Toggle fullscreen */
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      // Update height before going fullscreen
      setViewportHeight(window.innerHeight);
    }
    setIsFullscreen((prev) => !prev);
  }, [isFullscreen]);

  /** ✅ Handle fullscreen state changes */
  useEffect(() => {
    if (isFullscreen) {
      lockBodyScroll();
      // Update height after a short delay for iOS
      setTimeout(() => {
        setViewportHeight(window.innerHeight);
      }, 50);
    } else {
      unlockBodyScroll();
    }

    // ESC key to exit (for desktop/keyboard)
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

  /** ✅ Cleanup on unmount */
  useEffect(() => {
    return () => {
      unlockBodyScroll();
    };
  }, [unlockBodyScroll]);

  /** ✅ Prevent scroll/touch when fullscreen on iOS */
  useEffect(() => {
    if (!isFullscreen) return;

    const preventScroll = (e) => {
      // Allow touches on interactive elements inside the player
      const target = e.target;
      if (target.tagName === "BUTTON" || target.closest("button")) {
        return;
      }
      // Allow touches inside the container but prevent default to stop scroll
      if (containerRef.current?.contains(target)) {
        // Allow video controls interaction
        if (target.tagName === "VIDEO" || target.closest(".str-video")) {
          return;
        }
      }
      e.preventDefault();
    };

    // Prevent touchmove on document
    document.addEventListener("touchmove", preventScroll, { passive: false });
    
    // Prevent scroll event
    const preventScrollEvent = (e) => {
      if (isFullscreen) {
        e.preventDefault();
      }
    };
    document.addEventListener("scroll", preventScrollEvent, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("scroll", preventScrollEvent);
    };
  }, [isFullscreen]);

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

  // Inline styles for fullscreen - these override CSS for precise control on iOS
  const fullscreenStyles = isFullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: `${viewportHeight}px`, // Use exact viewport height for iOS
        zIndex: 2147483647,
        backgroundColor: "#000",
        borderRadius: 0,
        overflow: "hidden",
        // iOS safe area
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        // Prevent iOS issues
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
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
          style={{
            ...fullscreenStyles,
            // Ensure children can receive pointer events
            pointerEvents: "auto",
          }}
        >
          {/* ✅ Fullscreen button - positioned for iOS visibility */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute bg-black/70 hover:bg-black/90 active:bg-black text-white rounded-lg p-3 transition-all custom-fullscreen-btn"
            style={{
              bottom: isFullscreen ? "70px" : "52px",
              right: "12px",
              zIndex: 2147483647,
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              minWidth: "48px",
              minHeight: "48px",
              pointerEvents: "auto",
              cursor: "pointer",
              // Ensure visibility on iOS
              WebkitAppearance: "none",
              appearance: "none",
              border: "none",
              outline: "none",
            }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
                width="24"
                height="24"
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
              enableFullScreen: false, // Disable SDK fullscreen, we use our own
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
