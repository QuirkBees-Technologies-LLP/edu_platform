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
  onStatusChange,
}) => {
  const [showFull, setShowFull] = useState(false);
  // Tablet-and-below vs. laptop/desktop split, matching StreamWrapper.jsx's no-call
  // banner+feed layout — both sections stay col-span-12 (stacked) below "lg" (1024px),
  // and only go side-by-side at lg and up. This used to switch at "md" (768px), which
  // is too narrow for two columns of live video + chat/feed to share a row without
  // overlapping or cramping — exactly what was breaking on tablet-width screens.
  const isLgUp = useResponsive("up", "lg");

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
    if (!isLgUp) {
      setIsFullScreen(false);
    }
  }, [isLgUp]);

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

  const chatVisible = !!(token && callId && status === "live");

  // No max-width/max-height cap here on purpose: the video's own column span grows
  // (8 -> 11 of 12) when Chat collapses below, and this block needs to actually grow
  // with it — aspect-video derives height purely from width, so capping either would
  // leave the reclaimed space unused (a max-height would force aspect-video to shrink
  // the WIDTH instead once 16:9-at-full-width would exceed it, which is exactly what
  // made the video look like it "doesn't resize" before).
  const videoBlock = (
    <div className="aspect-video w-full min-h-[320px]">
      <div className="grid gap-5 h-full min-h-0">
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
  );

  // Mirrors the educator's own live-session view (StreamClient.jsx): Video and Chat are
  // plain sibling columns in one grid row, self-contained inside this component — this
  // row never reaches out to anything IqEducators.jsx owns (Master Classes, Educator
  // Feed, ...), so collapsing Chat here only ever grows Video, nothing else. While NOT
  // live, Chat never renders, so Video just stays at the base col-span-12 (full width of
  // THIS component's own nested grid) — IqEducators.jsx constrains the OUTER wrapper
  // around this whole component to 8/12 in that case instead, and renders Educator Feed
  // as a genuine sibling of that wrapper in the SAME outer grid for the remaining 4/12
  // (a real, single flat grid, unlike nesting Feed inside this component's own grid,
  // which a cross-component CSS row-span can't reach into).
  const videoSpan = chatVisible && isLgUp ? (isFullScreen ? "lg:col-span-11" : "lg:col-span-8") : "";
  const chatSpan = isLgUp ? (isFullScreen ? "lg:col-span-1" : "lg:col-span-4") : "";

  return (
    <div className="col-span-12 grid grid-cols-12 gap-y-8 lg:gap-x-8 chatbox_chat">
      <div className={`col-span-12 ${videoSpan} space-y-8`}>{videoBlock}</div>

      {/* Chat, while live: a plain sibling grid column right next to Video (below lg it
          stacks full-width beneath it instead), never portaled anywhere else. */}
      {chatVisible && (
        <div className={`col-span-12 ${chatSpan} space-y-8`}>
          <ChatContainer sessionToken={token} callId={callId} headerGradient={headerGradient} />
        </div>
      )}
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
      onStatusChange={onStatusChange}
    />
  );
};

export default ClientLiveSessionWrapper;
