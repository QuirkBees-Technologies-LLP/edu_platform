import {
  LivestreamPlayer,
  ParticipantView,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Copy, PhoneOff, Podcast, Radio, Route, RouteOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DefaultTooltip } from "@/components";
import { useNavigate } from "react-router";
import RecordingControls from "./RecordingControls";

const LiveSessionPlayer = ({
  client,
  callId,
  token,
  rtmp_stream_key,
  rtmp_url,
  setIsTooltipOpen,
  isTooltipOpen,
}) => {
  const [isCallEnd, setIsCallEnd] = useState(null);
  const [isCallStarted, setIsCallStarted] = useState(null);
  const call = useCall();
  const navigate = useNavigate();

  const { useIsCallLive, useCallMembers } = useCallStateHooks();

  const isLive = useIsCallLive();
  const members = useCallMembers(); // List of participants in the call

  useEffect(() => {
    if (!call) return;

    let subscriptions = [];

    const checkCallStatus = async () => {
      try {
        await call.get();

        // 🔥 Call start state
        const startedSub = call.state.startedAt$.subscribe((startedAt) => {
          console.log("Stream started at:", startedAt);
          setIsCallStarted(!!startedAt);
        });

        // 👥 Participants
        const participantsSub = call.state.participants$.subscribe(
          (participants) => {
            console.log("Participants List:", participants);
          }
        );

        // 📞 Call status
        const callingStateSub = call.state.callingState$.subscribe((state) => {
          console.log("Call state:", state);
        });

        // 🎬 Backstage status
        const backstageSub = call.state.backstage$.subscribe((isBackstage) => {
          console.log("🎭 isBackstage:", isBackstage);
        });

        // 🎥 RTMP Broadcast Event
        call.on("rtmp_broadcast_started", (event) => {
          console.log("🎥 RTMP Stream Started:", event);
        });

        // Save all subscriptions for cleanup
        subscriptions = [
          startedSub,
          participantsSub,
          callingStateSub,
          backstageSub,
        ];

        // Call End State
        setIsCallEnd(call.state.endedAt);
      } catch (error) {
        console.error("❌ Error checking call status:", error);
      }
    };

    checkCallStatus();

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [call]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsTooltipOpen((prevState) => ({
        ...prevState,
        [key]: true,
      }));

      setTimeout(() => {
        setIsTooltipOpen((prevState) => ({
          ...prevState,
          [key]: false,
        }));
      }, 1000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "unset" }}>
      <LivestreamPlayer
        displayName="Hello guys"
        layoutProps={{
          showLiveBadge: true,
          showSpeakerName: true,
          showParticipantCount: true,
          showDuration: true,
          enableFullScreen: true,
        }}
        callType="livestream"
        callId={callId}
      />

      {isCallEnd ? (
        <div className="flex flex-col justify-center items-center gap-5 pb-20 pt-20">
          <RouteOff size={44} className="text-primary" />
          <span className="text-gray-300 dark:text-gray-900 font-semibold text-2xl">
            IQ Academy Ended
          </span>
          <p className="text-gray-300 dark:text-gray-900 mb-0 font-semibold">
            Would you like to create a new livestream?
          </p>
          <button
            type="button"
            onClick={() => {
              navigate("/live-session");
            }}
            className="btn btn-md btn-light rounded-5 bg-primary border-0 text-gray-300 dark:text-gray-900 text-md font-semibold py-3"
          >
            <Radio size={20} className="shrink-0" />
            Create New IQ Academy
          </button>
        </div>
      ) : (
        <>
          {!isCallStarted && !isLive && (
            <div className="flex flex-col justify-center items-center gap-7">
              <Podcast size={44} className="text-primary" />
              <p className="text-gray-300 dark:text-gray-700 mb-0">
                To start streaming, select your preferred streaming app and
                <span className="font-bold text-white">
                  {" "}
                  enter the RTMP URL along with the RTMP Stream key.
                </span>
              </p>
              <div className="flex justify-center gap-3">
                <DefaultTooltip
                  title="Copied to clipboard!"
                  open={isTooltipOpen?.rtmp_url_left}
                  placement="bottom"
                  className="max-w-48"
                >
                  <button
                    type="button"
                    className="btn btn-md btn-light rounded-full text-gray-700 font-semibold py-3"
                    onClick={() => handleCopy(rtmp_url, "rtmp_url_left")}
                  >
                    Copy RTMP URL <Copy size={16} className="shrink-0" />
                  </button>
                </DefaultTooltip>
                <DefaultTooltip
                  title="Copied to clipboard!"
                  open={isTooltipOpen?.rtmp_stream_key_left}
                  placement="bottom"
                  className="max-w-48"
                >
                  <button
                    type="button"
                    className="btn btn-md btn-light rounded-full text-gray-700 font-semibold py-3"
                    onClick={() =>
                      handleCopy(rtmp_stream_key, "rtmp_stream_key_left")
                    }
                  >
                    Copy Stream Key <Copy size={16} className="shrink-0" />
                  </button>
                </DefaultTooltip>
              </div>
            </div>
          )}
          <div className="flex justify-center gap-3 mt-10">
            <RecordingControls call={call} />
            <button
              type="button"
              onClick={async () => {
                try {
                  await call.endCall();
                  setIsCallEnd(true);
                  console.log("Stream has ended completely!");
                } catch (error) {
                  console.error("Failed to end stream", error);
                }
              }}
              className="btn btn-md btn-danger"
            >
              <PhoneOff size={16} />
              End Call
            </button>
            <button
              type="button"
              className={`btn btn-md ${!isLive ? "btn-success" : "btn-danger"}`}
              onClick={() => (isLive ? call.stopLive() : call.goLive())}
            >
              {isLive ? <RouteOff size={16} /> : <Route size={16} />}
              {isLive ? "Stop Live" : "Go Live"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveSessionPlayer;
