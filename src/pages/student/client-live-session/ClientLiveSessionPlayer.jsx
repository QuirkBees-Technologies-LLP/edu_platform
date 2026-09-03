import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import React, { useMemo } from "react";
import { createLivestreamParticipantOverlay } from "@/components";

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
  const ParticipantViewUI = useMemo(
    () => createLivestreamParticipantOverlay({ showParticipantCount: false }),
    []
  );

  if (!client || !call) return null;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="relative w-full h-full rounded-xl overflow-hidden live-player-container">
          <LivestreamPlayer
            displayName="Hello guys"
            layoutProps={{
              ParticipantViewUI,
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
