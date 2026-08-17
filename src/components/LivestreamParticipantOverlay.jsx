import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useCall,
  useCallStateHooks,
  useParticipantViewContext,
} from "@stream-io/video-react-sdk";
import { useLayout } from "../providers";
import { useLiveCaptions, CaptionsInlineControl, CaptionsTextOverlay } from "./LiveClosedCaptions";

/**
 * A fully custom control bar for the livestream player, rendered via
 * `layoutProps.ParticipantViewUI`. It replaces the SDK's default overlay
 * (which has no volume control at all) with one cohesive bar: live badge,
 * viewer count, speaker name, duration, captions, volume and fullscreen -
 * all laid out with flexbox so they can never overlap each other, however
 * the bar's content changes.
 *
 * This has to live inside `layoutProps.ParticipantViewUI` (not as a sibling
 * of <LivestreamPlayer/>) because that is the only slot the SDK renders
 * *inside* the DOM element it calls `.requestFullscreen()` on
 * (`str-video__participant-view`). Anything rendered outside that element
 * disappears from the OS fullscreen surface.
 */

const STYLE_ID = "iq-livestream-overlay-style";
const injectStylesOnce = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .iq-live-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .iq-live-icon-btn:hover {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }
    .iq-live-icon-btn--active {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }
    .iq-live-slider {
      -webkit-appearance: none;
      appearance: none;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(to right, #fff var(--iq-fill, 100%), rgba(255,255,255,0.28) var(--iq-fill, 100%));
      outline: none;
      cursor: pointer;
      vertical-align: middle;
    }
    .iq-live-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      cursor: pointer;
    }
    .iq-live-slider::-moz-range-track {
      height: 3px;
      border-radius: 999px;
      background: rgba(255,255,255,0.28);
    }
    .iq-live-slider::-moz-range-progress {
      height: 3px;
      border-radius: 999px;
      background: #fff;
    }
    .iq-live-slider::-moz-range-thumb {
      width: 11px;
      height: 11px;
      border: none;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
};

if (typeof document !== "undefined") {
  injectStylesOnce();
}

const isIOS = () => {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

const formatDuration = (durationInSeconds) => {
  const days = Math.floor(durationInSeconds / 86400);
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;
  return `${days ? days + " " : ""}${hours ? hours + ":" : ""}${minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const useCallDuration = () => {
  const { useIsCallLive, useCallSession } = useCallStateHooks();
  const isCallLive = useIsCallLive();
  const session = useCallSession();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!session?.live_started_at) return;
    const startedAt = new Date(session.live_started_at).getTime();
    setDuration(Math.floor((Date.now() - startedAt) / 1000));
  }, [session?.live_started_at]);

  useEffect(() => {
    if (!isCallLive) return;
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [isCallLive]);

  return duration;
};

const VolumeIcon = ({ muted }) =>
  muted ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );

const FullscreenIcon = ({ active }) =>
  active ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );

/**
 * @param {{ showParticipantCount?: boolean }} options
 */
export function createLivestreamParticipantOverlay({
  showParticipantCount = true,
} = {}) {
  return function LivestreamParticipantOverlay() {
    const call = useCall();
    const { participant, participantViewElement } =
      useParticipantViewContext();
    const { useParticipantCount } = useCallStateHooks();
    const participantCount = useParticipantCount();
    const duration = useCallDuration();
    const { isMuted, volume, setIsMuted, setVolume } = useLayout();
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(
      () => !!document.fullscreenElement
    );
    const isIOSDevice = useMemo(() => isIOS(), []);
    const captions = useLiveCaptions();

    // Auto-hide control bar: hidden by default, appears on mouse movement inside
    // the player and fades out again after a few seconds of inactivity.
    const [mouseActive, setMouseActive] = useState(false);
    const hideTimerRef = useRef(null);

    useEffect(() => {
      const el = participantViewElement;
      if (!el) return;

      const revealControls = () => {
        setMouseActive(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setMouseActive(false), 3500);
      };

      // Note: deliberately NOT hiding on "mouseleave". On touch devices (iPhone,
      // in-app WebViews) a single tap synthesizes a mouse-event sequence that
      // fires a mouseleave/hover-reset almost immediately after the tap - that
      // was hiding the bar before there was time to tap a button. The inactivity
      // timer above is enough to hide it once the pointer actually stops.
      el.addEventListener("mousemove", revealControls);
      el.addEventListener("mouseenter", revealControls);
      el.addEventListener("touchstart", revealControls);

      return () => {
        el.removeEventListener("mousemove", revealControls);
        el.removeEventListener("mouseenter", revealControls);
        el.removeEventListener("touchstart", revealControls);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      };
    }, [participantViewElement]);

    // Keep the bar visible while a control is actively being used, even if the mouse stops moving
    const controlsVisible =
      mouseActive || showVolumeSlider || captions.showLangMenu;

    useEffect(() => {
      const handler = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handler);
      return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    useEffect(() => {
      const video = participantViewElement?.querySelector("video");
      if (!video) return;
      const handleEnd = () => setIsFullscreen(false);
      video.addEventListener("webkitendfullscreen", handleEnd);
      return () => video.removeEventListener("webkitendfullscreen", handleEnd);
    }, [participantViewElement]);

    useEffect(() => {
      const target = Math.min(
        Math.max(isMuted ? 0 : Number(volume ?? 1), 0),
        1
      );
      try {
        call?.speaker?.setVolume(target);
      } catch (e) {
        // setVolume unsupported in this environment - nothing else to fall back to safely
      }
    }, [isMuted, volume, call]);

    const toggleMute = () => setIsMuted((prev) => !prev);
    const handleVolumeChange = (e) => {
      const next = Number(e.target.value);
      setVolume(next);
      setIsMuted(next === 0);
    };

    const toggleFullscreen = useCallback(() => {
      if (isFullscreen) {
        document.exitFullscreen?.().catch(() => { });
        return;
      }
      if (isIOSDevice) {
        const video = participantViewElement?.querySelector("video");
        if (video?.webkitEnterFullscreen) {
          try {
            video.webkitEnterFullscreen();
            return;
          } catch (e) {
            // fall through to the standard Fullscreen API below
          }
        }
      }
      participantViewElement?.requestFullscreen?.().catch(() => { });
    }, [isFullscreen, isIOSDevice, participantViewElement]);

    const effectiveVolume = isMuted ? 0 : Number(volume ?? 1);

    return (
      <>
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"
            }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-4 py-3 transition-opacity duration-300 ${controlsVisible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
            }`}
        >
          <span className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold tracking-wide px-2 py-1 rounded-md leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
            LIVE
          </span>

          {showParticipantCount && (
            <span className="shrink-0 inline-flex items-center gap-1 text-white/70 text-xs leading-none">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {participantCount}
            </span>
          )}

          <span
            className="min-w-0 flex-1 truncate text-white/90 text-sm font-medium"
            title={participant?.name || participant?.userId || ""}
          >
            {participant?.name || participant?.userId || ""}
          </span>

          <span className="shrink-0 text-white/60 text-xs font-mono tabular-nums leading-none">
            {formatDuration(duration)}
          </span>

          <div className="shrink-0 w-px h-4 bg-white/15 mx-0.5" />

          <div className="shrink-0 flex items-center gap-0.5">
            <CaptionsInlineControl
              captions={captions}
              iconButtonClassName="iq-live-icon-btn"
            />

            <div
              className="flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <div
                className="overflow-hidden transition-all duration-200 ease-out"
                style={{ width: showVolumeSlider ? 64 : 0 }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effectiveVolume}
                  onChange={handleVolumeChange}
                  className="iq-live-slider w-14"
                  style={{ "--iq-fill": `${effectiveVolume * 100}%` }}
                  aria-label="Volume"
                />
              </div>
              <button
                type="button"
                className="iq-live-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <VolumeIcon muted={isMuted || volume === 0} />
              </button>
            </div>

            <button
              type="button"
              className="iq-live-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <FullscreenIcon active={isFullscreen} />
            </button>
          </div>
        </div>

        <CaptionsTextOverlay captions={captions} />
      </>
    );
  };
}
