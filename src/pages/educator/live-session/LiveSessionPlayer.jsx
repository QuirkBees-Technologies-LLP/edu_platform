import {
  LivestreamPlayer,
  ParticipantView,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Copy, PhoneOff, Podcast, Radio, Route, RouteOff } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { DefaultTooltip, createLivestreamParticipantOverlay } from "@/components";
import { toast } from "sonner";
import {
  useEducatorChangeLiveStreamStatusUpdateMutation,
  useEndAndCreateMutation,
  useEndCallMutation,
  useStartCaptionsMutation,
  useStopCaptionsMutation,
} from "../../../store/api/educator/educatorLiveStreamApiSlice";
import { useNavigate } from "react-router";
import RecordingControls from "./RecordingControls";
import { useEducatorLiveStreamStatusUpdateMutation } from "../../../store/api/educator/educatorLiveStreamApiSlice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const LiveSessionPlayer = ({
  client,
  callId,
  token,
  rtmp_stream_key,
  rtmp_url,
  setIsTooltipOpen,
  isTooltipOpen,
  checkLastRecurrence,
  isRecurent,
  id,
}) => {
  const [isCallEnd, setIsCallEnd] = useState(null);
  const [isCallStarted, setIsCallStarted] = useState(null);
  const [isOBSConnected, setIsOBSConnected] = useState(false);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [streamRecordings, setStreamRecordings] = useState([]);
  const call = useCall();
  const navigate = useNavigate();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();
  const [endCall, { isLoading: isEnding }] = useEndCallMutation();
  const [updateLiveStatus, { isLoading: isUpdating }] =
    useEducatorLiveStreamStatusUpdateMutation();
  const [updateChangeLiveStatus, { isLoading: isLoading }] =
    useEducatorChangeLiveStreamStatusUpdateMutation();
  const [startCaptions] = useStartCaptionsMutation();
  const [stopCaptions] = useStopCaptionsMutation();

  const { useIsCallLive, useCallMembers } = useCallStateHooks();
  const [goLiveStartedAt, setGoLiveStartedAt] = useState(null);

  const isLive = useIsCallLive();
  const members = useCallMembers(); // List of participants in the call
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [lastRecurrence, setLastRecurrence] = useState(true);
  const [endAndCreate, { isLoading: isEndingAndCreating }] =
    useEndAndCreateMutation();
  const [lastNote, setLastNote] = useState(false);

  const ParticipantViewUI = useMemo(
    () => createLivestreamParticipantOverlay({ showParticipantCount: true }),
    []
  );

  useEffect(() => {
    if (!call) return;

    let subscriptions = [];

    const checkCallStatus = async () => {
      try {
        await call.get();

        // 🔥 Call start state
        const startedSub = call.state.startedAt$.subscribe((startedAt) => {
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

        // 🎥 RTMP Broadcast Events — track OBS connection
        call.on("rtmp_broadcast_started", (event) => {
          console.log("🎥 OBS/RTMP Connected:", event);
          setIsOBSConnected(true);
        });

        call.on("rtmp_broadcast_stopped", (event) => {
          console.log("🛑 OBS/RTMP Disconnected:", event);
          setIsOBSConnected(false);
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

  const fetchStreamRecordings = async () => {
    setIsLoadingRecordings(true);
    try {
      const response = await call.queryRecordings();

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

  const handleEndCall = async (callId) => {
    try {
      if (!callId) {
        toast.error("Missing callId");
        return;
      }

      if (isRecording) {
        console.log("👉 Stopping last recording before ending call...");
        await call.stopRecording();
      }

      await endCall({ callId }).unwrap();
      await updateLiveStatus({
        callId,
        status: "ended",
      }).unwrap();
      setIsCallEnd(true);

      // ✅ Fetch ALL recordings instead of last only
      await fetchStreamRecordings();

      toast.success("Call ended successfully");
    } catch (error) {
      console.error("Failed to end stream", error);
      const message = error?.data?.message || "Failed to end call";
      toast.error(message);
    }
  };

  const handleEndAndcreate = async (callId) => {
    try {
      if (!callId) {
        toast.error("Missing callId");
        return;
      }

      if (isRecording) {
        console.log("👉 Stopping last recording before ending call...");
        await call.stopRecording();
      }

      await endAndCreate({ callId }).unwrap();
      await updateLiveStatus({
        callId,
        status: "ended",
      }).unwrap();
      setIsCallEnd(true);

      // ✅ Fetch ALL recordings instead of last only
      await fetchStreamRecordings();

      toast.success("Call ended successfully");
    } catch (error) {
      console.error("Failed to end stream", error);
      const message = error?.data?.message || "Failed to end call";
      toast.error(message);
    }
  };

  const handleEndCallModel = () => {
    setIsEndOpen(true);
    if (!!isRecurent) {
      if (!!checkLastRecurrence) {
        setLastRecurrence(false);
        setLastNote(true);
      } else {
        setLastRecurrence(true);
      }
    } else {
      setLastRecurrence(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "unset" }}>
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

      {isCallEnd ? (
        <div className="flex flex-col justify-center items-center gap-5 pb-20 pt-20">
          <RouteOff size={44} className="text-primary" />
          <span className="text-gray-300 dark:text-gray-900 font-semibold text-2xl">
            Session Ended
          </span>
          <p className="text-gray-300 dark:text-gray-900 mb-0 font-semibold">
            Would you like to create a new livestream?
          </p>
          <button
            type="button"
            onClick={() => {
              navigate("/educator/stream-schedule");
            }}
            className="btn btn-md btn-light rounded-5 bg-primary border-0 text-gray-300 dark:text-gray-900 text-md font-semibold py-3"
          >
            <Radio size={20} className="shrink-0" />
            Create New Session
          </button>
        </div>
      ) : (
        <>
          {!isOBSConnected ? (
            // ✅ Show RTMP instructions + all controls ONLY when OBS is NOT yet connected
            <>
              {!isLive && (
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
                <div className="flex justify-center gap-3 mt-10">
                  {/* ✅ End Call */}
                  <button
                    type="button"
                    className="btn btn-md btn-danger"
                    onClick={handleEndCallModel}
                  >
                    <PhoneOff size={16} />
                    End Call
                  </button>

                  {/* ✅ Go Live / Stop Live */}
                  <button
                    type="button"
                    className={`btn btn-md ${!isLive ? "btn-success" : "btn-danger"}`}
                    onClick={async () => {
                      try {
                        if (isLive) {
                          console.log("👉 Stopping live for:", callId);

                          if (isRecording) {
                            try {
                              await call.stopRecording();
                            } catch (err) {
                              console.warn("⚠ stopRecording failed:", err);
                            }
                          }

                          // Stop closed captions via server-side API
                          try {
                            await stopCaptions({ callId }).unwrap();
                          } catch (err) {
                            console.warn("⚠ stopCaptions failed:", err);
                          }

                          await call.stopLive();
                          await updateLiveStatus({
                            callId,
                            status: "pending",
                          }).unwrap();

                          // ✅ Fetch ALL recordings
                          await fetchStreamRecordings();

                          toast.success("Stream stopped successfully");
                        } else {
                          console.log("👉 Going live for:", callId);

                          // ✅ FIX: Update Schedule+LiveStream status to "active" BEFORE
                          // going live, so students can discover the session immediately.
                          // Previously this ran after goLive + captions + recording (8-10s
                          // delay), creating a race condition where students saw no session.
                          // If goLive() fails below, the existing "Stop Live" handler
                          // resets status to "pending", so this is safe.
                          await updateLiveStatus({
                            callId,
                            status: "active",
                          }).unwrap();

                          await call.goLive();
                          setGoLiveStartedAt(new Date());

                          // Start closed captions via server-side API (bypasses user permission)
                          try {
                            await startCaptions({ callId }).unwrap();
                            console.log("✅ Closed captions started (server-side)");
                          } catch (err) {
                            console.warn("⚠ startCaptions failed:", err);
                          }

                          await new Promise((resolve) => setTimeout(resolve, 1500));

                          if (!isRecording) {
                            // Stream rejects startRecording with "no active session" if the
                            // participant session hasn't fully registered yet — the fixed
                            // 1.5s delay above isn't always enough (slow network, slower
                            // media handshake). Retry a few times with a short gap instead
                            // of a single attempt, and — critically — tell the educator if
                            // it never succeeds, instead of silently failing: previously
                            // this only logged a console.warn, so a failed auto-record was
                            // invisible until the educator checked for recordings after the
                            // session had already ended.
                            let recordingStarted = false;
                            const recordingOptions = {
                              mode: "single",
                              options: {
                                "participant.filter": {
                                  isPinned: true,
                                },
                                "participant.border_radius": "0px",
                                "participant.video_border_rounded": false,
                                "grid.margin": 0,
                                "grid.cell_padding": 4,
                              },
                            };
                            for (let attempt = 1; attempt <= 3 && !recordingStarted; attempt++) {
                              try {
                                await call.startRecording(recordingOptions);
                                recordingStarted = true;
                              } catch (err) {
                                console.warn(`⚠ startRecording attempt ${attempt} failed:`, err);
                                if (attempt < 3) {
                                  await new Promise((resolve) => setTimeout(resolve, 2000));
                                }
                              }
                            }
                            if (!recordingStarted) {
                              toast.error(
                                "Recording didn't start automatically. Use \"Start Recording\" in the Session Recordings panel below to start it manually."
                              );
                            }
                          }

                          toast.success("Stream started successfully");
                        }
                      } catch (err) {
                        console.error("❌ Error updating live status:", err);
                        toast.error(
                          err?.data?.message || "Failed to update live status"
                        );
                      }
                    }}
                    disabled={isLoadingRecordings || isUpdating}
                  >
                    {isLive ? <RouteOff size={16} /> : <Route size={16} />}
                    {isLive ? "Stop Live" : "Go Live"}
                  </button>
                </div>
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
          ) : null}
        </>
      )}
      {isEndOpen && (
        <Dialog open={isEndOpen} onOpenChange={() => setIsEndOpen(false)}>
          <DialogContent className="p-5 max-w-[500px]">
            <VisuallyHidden>
              <DialogTitle>Hidden Title</DialogTitle>
            </VisuallyHidden>
            <div className="text-center">
              <i className="ki-filled text-3xl ki-alert text-gray-500 dark:text-gray-700 mb-3.5 mx-auto"></i>
            </div>
            <p className="mb-4 text-gray-700 dark:text-gray-700 text-center">
              Are you sure you want to end this livestream for everyone?
            </p>
            {lastRecurrence === false && lastNote === true && (
              <p className="mb-4 text-red-600 dark:text-red-500 text-center">
                This is your last recurrence. After ending, you will need to
                create a new recurrence.
              </p>
            )}
            <div className="flex justify-center items-center space-x-4">
              <button
                className="btn btn-light"
                onClick={() => setIsEndOpen(false)}
                disabled={isEnding}
              >
                Cancel
              </button>
              {/* <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  await handleEndCall(callId);
                  setIsEndOpen(false);
                }}
                disabled={isEnding}
              >
                {isEnding ? "Ending..." : "Yes, End Call"}
              </button> */}
              {lastRecurrence ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    await handleEndAndcreate(callId);
                    setIsEndOpen(false);
                  }}
                  disabled={isEndingAndCreating}
                >
                  {isEndingAndCreating ? "Creating..." : "End Call"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    await handleEndCall(callId);
                    setIsEndOpen(false);
                  }}
                  disabled={isEnding}
                >
                  {isEnding ? "Ending..." : "Yes, End Call"}
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LiveSessionPlayer;
