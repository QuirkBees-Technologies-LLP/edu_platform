import {
  Audio,
  CallingState,
  LivestreamLayout,
  StreamCall,
  StreamVideo,
  hasAudio,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createLivestreamParticipantOverlay } from "@/components";
import { useLayout } from "../../../providers";
import { isSafari } from "../../../utils/Devices";

const AUDIO_UNLOCK_EVENT = "iq-live-audio-unlock";

const startRemoteAudio = async (root) => {
  if (!root) return { blocked: 0, hasElements: false };
  const safari = isSafari();
  const audios = Array.from(root.querySelectorAll("audio"));
  if (audios.length === 0) return { blocked: 0, hasElements: false };

  const results = await Promise.all(
    audios.map(async (audio) => {
      // Safari plays through an AudioContext and keeps this element muted on purpose.
      // Other browsers play the element itself, which autoplay may have paused.
      if (!safari) audio.muted = false;
      try {
        await audio.play();
        return audio.paused;
      } catch {
        return true;
      }
    })
  );

  return {
    blocked: results.filter(Boolean).length,
    hasElements: true,
  };
};

const UnpublishedAudioFallback = () => {
  const { useRemoteParticipants } = useCallStateHooks();
  const participants = useRemoteParticipants();
  const missing = participants.filter((participant) => {
    const tracks = participant.publishedTracks || [];
    const publishedAudio =
      (Array.isArray(tracks) && tracks.includes("audio")) ||
      (typeof tracks?.includes === "function" && tracks.includes("audio"));
    const layoutAlreadyPlays = hasAudio(participant) && participant.audioStream;
    return (
      !layoutAlreadyPlays &&
      (publishedAudio || participant.audioStream || participant.screenShareAudioStream)
    );
  });

  if (missing.length === 0) return null;

  return missing.map((participant) => (
    <Audio key={participant.sessionId} participant={participant} />
  ));
};

const StudentLivestreamAudio = () => {
  const call = useCall();
  const { isMuted, volume } = useLayout();
  const [needsGesture, setNeedsGesture] = useState(false);
  const { useRemoteParticipants } = useCallStateHooks();
  const participants = useRemoteParticipants();

  useEffect(() => {
    if (!call?.speaker) return;
    const target = Math.min(Math.max(isMuted ? 0 : Number(volume ?? 1), 0), 1);
    try {
      call.speaker.setVolume(target);
    } catch {
      // setVolume is unsupported in this browser
    }
  }, [call, isMuted, volume]);

  const unlock = useCallback(async () => {
    const root = document.querySelector(".student-live-player");
    const result = await startRemoteAudio(root);
    setNeedsGesture(!isMuted && result.hasElements && result.blocked > 0);
  }, [isMuted]);

  useEffect(() => {
    const timer = window.setTimeout(unlock, 400);
    return () => window.clearTimeout(timer);
  }, [participants, unlock]);

  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      unlock();
      if (attempts >= 8) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [unlock]);

  useEffect(() => {
    const onUnlock = () => {
      unlock();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") unlock();
    };

    window.addEventListener(AUDIO_UNLOCK_EVENT, onUnlock);
    document.addEventListener("pointerdown", onUnlock, true);
    document.addEventListener("keydown", onUnlock);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(AUDIO_UNLOCK_EVENT, onUnlock);
      document.removeEventListener("pointerdown", onUnlock, true);
      document.removeEventListener("keydown", onUnlock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [unlock]);

  if (!needsGesture) return null;

  return (
    <button
      type="button"
      className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg"
      onClick={() => {
        unlock();
      }}
    >
      Tap for sound
    </button>
  );
};

const StudentLivestreamStage = ({ ParticipantViewUI }) => {
  const call = useCall();
  const [callingState, setCallingState] = useState(
    () => call?.state?.callingState
  );
  const [joinFailed, setJoinFailed] = useState(false);

  useEffect(() => {
    if (!call) return undefined;
    setCallingState(call.state.callingState);
    const subscription = call.state.callingState$.subscribe(setCallingState);
    return () => subscription.unsubscribe();
  }, [call]);

  useEffect(() => {
    if (!call) return undefined;
    let cancelled = false;

    const join = async () => {
      const state = call.state.callingState;
      if (state === CallingState.JOINED || state === CallingState.JOINING) return;
      try {
        await call.join();
        // Viewers watch only. Publishing a camera or microphone is not part of this flow.
        await call.camera.disable().catch(() => {});
        await call.microphone.disable().catch(() => {});
      } catch (error) {
        const message = String(error?.message || "");
        const alreadyJoined = message.includes("shall be called only once");
        if (!cancelled && !alreadyJoined) {
          console.error("Failed to join livestream:", error);
          setJoinFailed(true);
        }
      }
    };

    join();
    return () => {
      cancelled = true;
    };
  }, [call]);

  const ready =
    callingState === CallingState.JOINED ||
    callingState === CallingState.RECONNECTING;

  if (joinFailed && !ready) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white">
        Unable to connect to the live stream. Refresh the page and try again.
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white">
        Connecting to the live stream…
      </div>
    );
  }

  return (
    <>
      <UnpublishedAudioFallback />
      <StudentLivestreamAudio />
      <LivestreamLayout ParticipantViewUI={ParticipantViewUI} muted={false} />
    </>
  );
};

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const ParticipantViewUI = useMemo(
    () => createLivestreamParticipantOverlay({ showParticipantCount: false }),
    []
  );

  if (!client || !call || !callId) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="student-live-player live-player-container relative h-full w-full overflow-hidden rounded-xl">
          <StudentLivestreamStage ParticipantViewUI={ParticipantViewUI} />
        </div>
      </StreamCall>
    </StreamVideo>
  );
};

export default ClientLiveSessionPlayer;
