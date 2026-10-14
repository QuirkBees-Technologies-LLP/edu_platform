import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createLivestreamParticipantOverlay } from "@/components";

const USER_ACTIVATION_EVENTS = ["pointerdown", "click", "keydown", "touchend"];

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const ParticipantViewUI = useMemo(
    () => createLivestreamParticipantOverlay({ showParticipantCount: false }),
    []
  );

  const containerRef = useRef(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // The SDK calls audio.play() once, outside any user gesture; when the browser's
  // autoplay policy rejects it the <audio> stays paused forever while the (muted)
  // video keeps playing, so it has to be retried from a real user interaction.
  const getBlockedAudioElements = useCallback(() => {
    const container = containerRef.current;
    if (!container) return [];
    return Array.from(container.querySelectorAll("audio")).filter(
      (audio) => audio.srcObject && audio.paused
    );
  }, []);

  const resumeAudio = useCallback(() => {
    getBlockedAudioElements().forEach((audio) => {
      audio
        .play()
        .then(() => setAudioBlocked(false))
        .catch(() => {});
    });
  }, [getBlockedAudioElements]);

  useEffect(() => {
    if (!client || !call) return;

    // Requires two consecutive hits so the short gap between the SDK attaching
    // the stream and its own play() resolving doesn't flash the prompt.
    let blockedTicks = 0;
    const interval = setInterval(() => {
      blockedTicks = getBlockedAudioElements().length > 0 ? blockedTicks + 1 : 0;
      setAudioBlocked(blockedTicks >= 2);
    }, 1000);

    USER_ACTIVATION_EVENTS.forEach((type) =>
      document.addEventListener(type, resumeAudio, true)
    );

    return () => {
      clearInterval(interval);
      USER_ACTIVATION_EVENTS.forEach((type) =>
        document.removeEventListener(type, resumeAudio, true)
      );
    };
  }, [client, call, getBlockedAudioElements, resumeAudio]);

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div
          ref={containerRef}
          className="relative w-full h-full rounded-xl overflow-hidden live-player-container"
        >
          <LivestreamPlayer
            displayName="Hello guys"
            layoutProps={{
              ParticipantViewUI,
            }}
            callType="livestream"
            callId={callId}
          />
          {audioBlocked && (
            <button
              type="button"
              onClick={resumeAudio}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 bg-black/75 hover:bg-black/90 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg shadow-lg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              Tap to enable sound
            </button>
          )}
        </div>
      </StreamCall>
    </StreamVideo>
  );
};

export default ClientLiveSessionPlayer;
