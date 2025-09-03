import {
  LivestreamPlayer,
  ParticipantView,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Copy, PhoneOff, Podcast, Radio, Route, RouteOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DefaultTooltip } from "@/components";
import { toast } from "sonner";
import { useEndCallMutation } from "../../../store/api/educator/educatorLiveStreamApiSlice";
import { useNavigate } from "react-router";
import RecordingControls from "./RecordingControls";
import { useEducatorLiveStreamStatusUpdateMutation } from "../../../store/api/educator/educatorLiveStreamApiSlice";

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
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [streamRecordings, setStreamRecordings] = useState([]);
  const call = useCall();
  const navigate = useNavigate();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const [endCall, { isLoading: isEnding }] = useEndCallMutation();
  const [updateLiveStatus, { isLoading: isUpdating }] =
    useEducatorLiveStreamStatusUpdateMutation();

  const { useIsCallLive, useCallMembers } = useCallStateHooks();
  const [goLiveStartedAt, setGoLiveStartedAt] = useState(null);

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
        setIsCallEnd(!!call.state.endedAt);
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

  console.log(call?.state?.backstage, "call1234");

  // useEffect(() => {
  //   const handleStart = async () => {
  //     try {
  //       await call.startRecording();
  //       console.log("Recording started");
  //     } catch (err) {
  //       console.error("Failed to start recording:", err);
  //     }
  //   };
  //   !isRecording && handleStart();
  // }, [call, isRecording]);

  // useEffect(() => {
  //   if (!call) return;

  //   const autoStartRecording = async () => {
  //     try {
  //       if (!isRecording && isLive) {
  //         await call.startRecording();
  //         console.log("✅ Auto recording started as stream went live");
  //       }
  //     } catch (err) {
  //       console.error("❌ Failed to start recording:", err);
  //     }
  //   };

  //   autoStartRecording();
  // }, [call, isRecording, isLive]);

  const fetchStreamRecordings = async () => {
    setIsLoadingRecordings(true);
    try {
      const response = await call.queryRecordings();
      console.log("Recordings response:", response);
      if (response && response.recordings) {
        setStreamRecordings(response.recordings);
      } else {
        setStreamRecordings([]);
      }
    } catch (err) {
      console.error("Failed to fetch stream recordings:", err);
      setStreamRecordings([]);
    } finally {
      setIsLoadingRecordings(false);
    }
  };

  // // Fetch recordings when live stream stops
  // useEffect(() => {
  //   if (!isLive && call) {
  //     // Add a small delay to ensure the server has processed the stop request
  //     const timer = setTimeout(() => {
  //       fetchStreamRecordings();
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [isLive, call]);

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
      {/* <div>{isLive ? `Live: ${participantCount}` : `In Backstage`}</div> */}
      {/* {firstParticipant ? (
                <ParticipantView participant={firstParticipant} />
            ) : (
                <div>The host hasn't joined yet</div>
            )}
            <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => (isLive ? call.stopLive() : call.goLive())}>
                    {isLive ? "Stop Live" : "Go Live"}
                </button>
                <button onClick={() => cam.toggle()}>
                    {isCamEnabled ? "Disable camera" : "Enable camera"}
                </button>
                <button onClick={() => mic.toggle()}>
                    {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
                </button>

                <button
                    style={{ backgroundColor: "red", color: "white" }}
                    onClick={async () => {
                        try {
                            await call.endCall();
                            console.log("Stream has ended completely!");
                        } catch (error) {
                            console.error("Failed to end stream", error);
                        }
                    }}
                >
                    End Stream
                </button>
            </div> */}

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
          {!isCallStarted && (
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
            {/* <RecordingControls call={call} /> */}
            {/* <button
              type="button"
              onClick={async () => {
                try {
                  if (!callId) {
                    toast.error("Missing callId");
                    return;
                  }
                  await endCall({ callId }).unwrap();
                  setIsCallEnd(true);
                  toast.success("Call ended successfully");
                } catch (error) {
                  console.error("Failed to end stream", error);
                  const message = error?.data?.message || "Failed to end call";
                  toast.error(message);
                }
              }}
              disabled={isEnding}
              className="btn btn-md btn-danger"
            >
              <PhoneOff size={16} />
              End Call
            </button> */}
            <button
              type="button"
              onClick={async () => {
                try {
                  if (!callId) {
                    toast.error("Missing callId");
                    return;
                  }

                  if (isRecording) {
                    console.log(
                      "👉 Stopping last recording before ending call..."
                    );
                    await call.stopRecording();
                  }

                  await endCall({ callId }).unwrap();
                  setIsCallEnd(true);

                  // ✅ Get only last Go Live recording
                  const res = await call.queryRecordings();
                  if (res?.recordings?.length) {
                    let filtered = res.recordings;

                    if (goLiveStartedAt) {
                      filtered = res.recordings.filter((rec) => {
                        const recStart = new Date(rec.start_time);
                        return recStart >= goLiveStartedAt;
                      });
                    }

                    const lastRecording = filtered[filtered.length - 1];
                    console.log("✅ Last session recording:", lastRecording);
                    setStreamRecordings(lastRecording ? [lastRecording] : []);
                  }

                  toast.success("Call ended successfully");
                } catch (error) {
                  console.error("Failed to end stream", error);
                  const message = error?.data?.message || "Failed to end call";
                  toast.error(message);
                }
              }}
              disabled={isEnding}
              className="btn btn-md btn-danger"
            >
              <PhoneOff size={16} />
              End Call
            </button>

           <button
  type="button"
  className={`btn btn-md ${!isLive ? "btn-success" : "btn-danger"}`}
  onClick={async () => {
    try {
      if (isLive) {
        console.log("👉 Stopping live for:", callId);

        // ✅ Stop recording if active
        if (isRecording) {
          console.log("👉 Stopping recording...");
          try {
            await call.stopRecording();
          } catch (err) {
            console.warn("⚠ stopRecording failed or already stopped:", err);
          }
        } else {
          console.log("⚠ No active recording, skipping stopRecording()");
        }

        await call.stopLive();

        await updateLiveStatus({
          callId,
          status: "pending",
        }).unwrap();

        // ✅ Fetch last recording after stop
        const res = await call.queryRecordings();
        if (res?.recordings?.length) {
          const lastRecording = res.recordings[res.recordings.length - 1];
          console.log("✅ Recording for this session:", lastRecording);
        }

        toast.success("Stream stopped successfully");
      } else {
        console.log("👉 Going live for:", callId);

        await call.goLive();
        setGoLiveStartedAt(new Date());

        // ✅ Wait for stream to settle
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // ✅ Start recording only if not already recording
        try {
          if (!isRecording) {
            console.log("👉 Starting new recording session...");
            await call.startRecording();
          } else {
            console.log("⚠ Recording already in progress, skipping startRecording()");
          }
        } catch (err) {
          if (err?.message?.includes("already being recorded")) {
            console.warn("⚠ Recording already running, ignoring...");
          } else {
            throw err;
          }
        }

        await updateLiveStatus({
          callId,
          status: "active",
        }).unwrap();

        toast.success("Stream started successfully");
      }
    } catch (err) {
      console.error("❌ Error updating live status:", err);
      toast.error(err?.data?.message || "Failed to update live status");
    }
  }}
  disabled={isLoadingRecordings || isUpdating}
>
  {isLive ? <RouteOff size={16} /> : <Route size={16} />}
  {isLive ? "Stop Live" : "Go Live"}
</button>

          </div>

          {/* Loading indicator for recordings */}
          {isLoadingRecordings && (
            <div className="text-center mt-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading recordings...</span>
              </div>
              <p className="mt-2">Fetching recordings...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LiveSessionPlayer;
