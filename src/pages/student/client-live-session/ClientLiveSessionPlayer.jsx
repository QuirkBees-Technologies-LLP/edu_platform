import {
  LivestreamPlayer,
  StreamCall,
  StreamVideo,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState, useRef } from "react";
// import { Volume2, VolumeX } from "lucide-react";

const ClientLiveSessionPlayer = ({ callId, client, call }) => {
//   const [volume, setVolume] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
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

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       const fsElement = document.fullscreenElement;
//       setIsFullscreen(!!fsElement);

//       if (fsElement && controlsRef.current) {
//         fsElement.appendChild(controlsRef.current);
//       } else if (!fsElement && controlsRef.current && document.body) {
//         const playerContainer = document.querySelector(
//           ".live-player-container"
//         );
//         if (playerContainer) playerContainer.appendChild(controlsRef.current);
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     return () =>
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//   }, []);

  return (
    client && (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          {/* <div className="relative w-full h-full rounded-xl overflow-hidden live-player-container"> */}
            <LivestreamPlayer
              displayName="Hello guys"
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
          {/* </div> */}
        </StreamCall>
      </StreamVideo>
    )
  );
};

export default ClientLiveSessionPlayer;
