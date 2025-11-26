import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState, useRef } from "react";
import { useLayout } from "../../../providers";

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
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
        </StreamCall>
      </StreamVideo>
    )
  );
};

export default ClientLiveSessionPlayer;
