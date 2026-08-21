import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import ChatContainer from "./chat-room/chat/ChatContainer";
import ClientLiveSessionPlayer from "./ClientLiveSessionPlayer";
import { useEventContext } from "./chat-room/context/EventContext";
import { useResponsive } from "../../../hooks";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import truncate from "html-truncate";
import { useLivestreamStatus } from "./liveStreamStatus";
import { Send } from "lucide-react";

// Inner component that uses Stream Video hooks (guaranteed to be within StreamCall context)
const ClientLiveSessionContent = ({
  client,
  callId,
  token,
  bannerImage,
  educatorData,
  headerGradient,
  feedContent,
  onStatusChange,
}) => {
  const [showFull, setShowFull] = useState(false);
  const isMdUp = useResponsive("up", "md");
  const call = useCall();
  const { useCallCustomData, useIsCallLive, useCallIngress, useCallEndedAt } =
    useCallStateHooks();
  const custom = useCallCustomData();
  const endedAt = useCallEndedAt();
  const hasEnded = !!endedAt;
  const isBroadcasting = useIsCallLive();
  const scheduledTime = custom?.datetime ? new Date(custom.datetime) : null;

  // Status priority: Ended > Live > Upcoming > Not Started
  const getStreamStatus = () => {
    if (hasEnded) return "ended";
    if (isBroadcasting) return "live";
    if (scheduledTime && Date.now() < scheduledTime.getTime())
      return "upcoming";
    return "not-started";
  };

  const status = getStreamStatus();

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const { title, description, tags } = custom || {};
  const maxLength = 150;

  const { isFullScreen, setIsFullScreen } = useEventContext();

  useEffect(() => {
    if (!isMdUp) {
      setIsFullScreen(false);
    }
  }, [isMdUp]);

  // Handler for toggling
  const handleToggle = (e) => {
    e.preventDefault();
    setShowFull(!showFull);
  };

  function renderLiveStatus(status, custom = {}, fallbackComponent = null) {
    const renderLoadingBar = () => (
      <div className="loading-bar">
        <div className="yellow-bar" />
      </div>
    );

    const statusConfig = {
      ended: {
        title: "Stream Ended",
        description: "The IQ Academy has concluded.",
      },
      "not-started": {
        title: "Stream Not Started",
        description: "The host has not begun the stream yet.",
      },
      upcoming: {
        title: "IQ Academy is Upcoming",
        description: `The event will start on ${
          custom?.datetime
            ? new Date(custom.datetime).toLocaleString()
            : "a future date"
        }`,
      },
    };

    const current = statusConfig[status];

    if (!current) {
      return (
        fallbackComponent || (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-lg text-gray-700 font-semibold">
              Unknown stream status: {status}
            </p>
          </div>
        )
      );
    }

    return (
      <div className="w-full h-full object-cover">
        <img
          src={
            bannerImage
              ? bannerImage
              : toAbsoluteUrl("/media/images/2600x1600/iq_educators.jpg")
          }
          alt="Banner Image"
          className="w-full h-full rounded-xl object-cover"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 chatbox_chat">
      <div
        className={`${isFullScreen ? (isMdUp ? "col-span-10 xl:col-span-11" : "col-span-12 md:col-span-7 xl:col-span-10") : isMdUp ? "col-span-12 md:col-span-7 xl:col-span-8" : "col-span-12 md:col-span-7 xl:col-span-11"} space-y-8`}
      >
        {/* Bounded by aspect ratio (rooted height) instead of an unrooted h-full chain,
            so the player can't inflate to match whatever height the chat column ends up at. */}
        <div className="transition-all duration-300 ease-in-out aspect-video max-h-[640px] min-h-[320px]">
          <div className="grid gap-5 h-full min-h-0">
            {/* min-h-0 overrides the flex default of min-height:auto — without it, the
                Stream SDK's no-video avatar placeholder (aspect-ratio: 4/3) forces this
                flex column to grow to fit it instead of respecting h-full, which is what
                was making the player taller than the chat box. */}
            <div className="flex flex-col rounded-lg items-center justify-start text-white h-full min-h-0">
              <div className="flex flex-col gap-12 bg-black rounded-xl text-center w-full h-full min-h-0">
                {renderLiveStatus(
                  status,
                  custom,
                  <ClientLiveSessionPlayer
                    call={call}
                    callId={callId}
                    client={client}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${isFullScreen ? (isMdUp ? "col-span-2 xl:col-span-1" : "col-span-12 md:col-span-5 xl:col-span-2") : isMdUp ? "col-span-12 md:col-span-5 xl:col-span-4" : "col-span-12 md:col-span-5 xl:col-span-1"} space-y-8`}
      >
        <div className="transition-all duration-300 ease-in-out h-full">
          {/* Chat fills its column exactly like the video fills its own (both stretch
              to the grid row's height), so they pair as a single, matched-height row. */}
          {token && callId && status === "live" && (
            <ChatContainer sessionToken={token} callId={callId} headerGradient={headerGradient} />
          )}
          {token && callId && status !== "live" && feedContent}
        </div>
      </div>
    </div>
  );
};

// Main wrapper component that doesn't use Stream Video hooks
const ClientLiveSessionWrapper = ({
  client,
  callId,
  token,
  bannerImage,
  educatorData,
  headerGradient,
  feedContent,
  onStatusChange,
}) => {
  return (
    <ClientLiveSessionContent
      client={client}
      callId={callId}
      token={token}
      bannerImage={bannerImage}
      educatorData={educatorData}
      headerGradient={headerGradient}
      feedContent={feedContent}
      onStatusChange={onStatusChange}
    />
  );
};

export default ClientLiveSessionWrapper;
