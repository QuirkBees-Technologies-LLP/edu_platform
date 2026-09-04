import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import React, { useEffect, useRef, useState } from "react";
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
  // Tablet-and-below vs. laptop/desktop split, matching StreamWrapper.jsx's no-call
  // banner+feed layout — both sections stay col-span-12 (stacked) below "lg" (1024px),
  // and only go side-by-side at lg and up. This used to switch at "md" (768px), which
  // is too narrow for two columns of live video + chat/feed to share a row without
  // overlapping or cramping — exactly what was breaking on tablet-width screens.
  const isLgUp = useResponsive("up", "lg");

  // feedContent (EducatorFeed) has no natural height cap — unlike ChatContainer, which
  // sits in this exact same column slot when live and works fine with plain h-full (see
  // StreamClient.jsx, which this grid otherwise mirrors exactly). Only bound this branch,
  // by measuring the video column's real rendered height, same technique StreamWrapper.jsx
  // already uses for its own banner+feed layout — a fixed height doesn't work here since
  // it can't also fit that other, differently-sized layout (see IqEducators.jsx).
  const videoColRef = useRef(null);
  const [videoColHeight, setVideoColHeight] = useState(null);
  useEffect(() => {
    const el = videoColRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      if (height) setVideoColHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Mirrors the educator's own live-session view (StreamClient.jsx) — same grid, same
  // col-span breakpoints, same plain h-full video column. ChatContainer, in the chat/feed
  // column below, is left exactly as simple as the reference page too, since it never had
  // a height problem here. Only the feedContent (EducatorFeed) branch gets its height
  // explicitly matched to the video column (videoColHeight, measured above) — it's the
  // one piece of content in this row with no natural height cap of its own.
  return (
    <div className="grid grid-cols-12 gap-y-8 lg:gap-x-8 chatbox_chat">
      <div
        className={`${isFullScreen ? (isLgUp ? "col-span-10 xl:col-span-11" : "col-span-12 lg:col-span-7 xl:col-span-10") : isLgUp ? "col-span-12 lg:col-span-7 xl:col-span-8" : "col-span-12 lg:col-span-7 xl:col-span-11"} space-y-8`}
      >
        {/* Rooted (aspect-video + max/min-height) instead of a bare h-full chain — the
            "not live" branch of renderLiveStatus renders a plain <img>, which has no
            self-limiting aspect ratio the way the Stream video player does. Without a cap
            here, an unusually large/tall banner image renders at its full intrinsic pixel
            height (thousands of px in practice) instead of scaling to fit, which then also
            inflated the chat/feed column since its height is matched to this one below. */}
        <div
          ref={videoColRef}
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
      </div>

      <div
        className={`${isFullScreen ? (isLgUp ? "col-span-2 xl:col-span-1" : "col-span-12 lg:col-span-5 xl:col-span-2") : isLgUp ? "col-span-12 lg:col-span-5 xl:col-span-4" : "col-span-12 lg:col-span-5 xl:col-span-1"} space-y-8`}
      >
        {token && callId && status === "live" && (
          <ChatContainer sessionToken={token} callId={callId} headerGradient={headerGradient} />
        )}
        {token && callId && status !== "live" && (
          <div
            style={
              videoColHeight
                ? { height: videoColHeight, maxHeight: videoColHeight, overflow: "hidden" }
                : undefined
            }
          >
            {feedContent}
          </div>
        )}
      </div>

      {/* Tablet/mobile only, while live: both columns above are col-span-12 below "lg", so
          they stack (video, then Chat) — this is a THIRD col-span-12 grid item, a sibling
          to those two columns rather than nested inside either one, so it lands directly
          below Chat in that stacked flow purely through document order, without touching
          the video/chat columns' own internals. On desktop it doesn't render at all (not
          just hidden), so the existing side-by-side layout there is untouched. Guarded on
          `feedContent` since this wrapper is also used without it (the standalone
          /client-live-session route), where this must stay a no-op. IqEducators.jsx's own
          bottom-of-page EducatorFeed likewise only mounts on desktop, so exactly one
          instance is ever live at a time. */}
      {!isLgUp && status === "live" && feedContent && (
        <div className="col-span-12 h-[900px]">{feedContent}</div>
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
