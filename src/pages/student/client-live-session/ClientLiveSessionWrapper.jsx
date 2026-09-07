import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
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
  chatSlotEl,
  onVideoHeightChange,
}) => {
  const [showFull, setShowFull] = useState(false);
  // Chat (portaled into the page-level sidebar while live) needs to match the video's
  // own rendered height specifically — not the whole left column's height, which is
  // taller (Master Classes/Ideas/etc. included) and would leave Chat's bottom hanging
  // well past Player's. Reported up to IqEducators.jsx, which applies it to the sidebar
  // slot Chat portals into.
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof ResizeObserver === "undefined" || !onVideoHeightChange) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      if (height) onVideoHeightChange(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVideoHeightChange]);
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

  const { setIsFullScreen } = useEventContext();

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

  // feedContent is only ever relevant for the not-live state (neither IqEducators.jsx nor
  // the standalone /client-live-session route pass it anymore — that page now hosts its
  // own single, always-visible Educator Feed panel instead — but the branch is kept
  // generic rather than assuming that). Chat, while live, is handled entirely separately
  // below: it no longer shares a column with the video at all, so the video is always
  // full width here regardless of live status.
  const hasFeedColumn = status !== "live" && !!feedContent;

  const videoBlock = (
    <div
      ref={videoRef}
      className="aspect-video max-h-[640px] min-h-[320px]"
    >
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

  // Mirrors the educator's own live-session view (StreamClient.jsx) — same grid, same
  // col-span breakpoints, same plain h-full video column.
  return (
    <div className="grid grid-cols-12 gap-y-8 lg:gap-x-8 chatbox_chat">
      {hasFeedColumn ? (
        <>
          <div className={`${isLgUp ? "col-span-12 lg:col-span-7 xl:col-span-8" : "col-span-12"} space-y-8`}>
            {/* Rooted (aspect-video + max/min-height) instead of a bare h-full chain — the
                "not live" branch of renderLiveStatus renders a plain <img>, which has no
                self-limiting aspect ratio the way the Stream video player does. Without a
                cap here, an unusually large/tall banner image renders at its full
                intrinsic pixel height (thousands of px in practice) instead of scaling to
                fit. */}
            {videoBlock}
          </div>
          <div className={`${isLgUp ? "col-span-12 lg:col-span-5 xl:col-span-4" : "col-span-12"} space-y-8`}>
            {feedContent}
          </div>
        </>
      ) : (
        <div className="col-span-12 space-y-8">{videoBlock}</div>
      )}

      {/* Chat, while live: at lg+ it portals into the page-level sidebar slot passed down
          as chatSlotEl (stacked above Educator Feed there — see IqEducators.jsx), so the
          video never has to share its own row/width with it. Below lg (chatSlotEl is only
          ever passed at lg+) it renders inline here instead, stacked below the video,
          exactly as it always has. */}
      {token && callId && status === "live" && (
        isLgUp && chatSlotEl ? (
          ReactDOM.createPortal(
            <ChatContainer sessionToken={token} callId={callId} headerGradient={headerGradient} />,
            chatSlotEl
          )
        ) : !isLgUp ? (
          <div className="col-span-12">
            <ChatContainer sessionToken={token} callId={callId} headerGradient={headerGradient} />
          </div>
        ) : null
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
  feedContent,
  onStatusChange,
  chatSlotEl,
  onVideoHeightChange,
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
      onVideoHeightChange={onVideoHeightChange}
      onStatusChange={onStatusChange}
      chatSlotEl={chatSlotEl}
    />
  );
};

export default ClientLiveSessionWrapper;
