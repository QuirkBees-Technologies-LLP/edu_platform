import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import ChatContainer from './chat-room/chat/ChatContainer'
import ClientLiveSessionPlayer from './ClientLiveSessionPlayer'
import { useEventContext } from './chat-room/context/EventContext'
import { useResponsive } from '../../../hooks'
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import truncate from 'html-truncate'
import { useLivestreamStatus } from './liveStreamStatus'

// Inner component that uses Stream Video hooks (guaranteed to be within StreamCall context)
const ClientLiveSessionContent = ({ client, callId, token, bannerImage }) => {
  const [showFull, setShowFull] = useState(false);
  const isMdUp = useResponsive('up', 'md');
  const call = useCall();
  const { useCallCustomData, useIsCallLive, useCallIngress, useCallEndedAt } = useCallStateHooks();
  const custom = useCallCustomData();
  const endedAt = useCallEndedAt();
  const hasEnded = !!endedAt;
  const isBroadcasting = useIsCallLive();
  const scheduledTime = custom?.datetime ? new Date(custom.datetime) : null;

  // Status priority: Ended > Live > Upcoming > Not Started
  const getStreamStatus = () => {
    if (hasEnded) return 'ended';
    if (isBroadcasting) return 'live';
    if (scheduledTime && Date.now() < scheduledTime.getTime()) return 'upcoming';
    return 'not-started';
  };

  const status = getStreamStatus();

  const { title, description, tags } = custom || {};
  const maxLength = 150

  const {
    isFullScreen,
  } = useEventContext();

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
        description: `The event will start on ${custom?.datetime
          ? new Date(custom.datetime).toLocaleString()
          : "a future date"
          }`,
      },
    };

    const current = statusConfig[status];

    if (!current) {
      return fallbackComponent || (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-lg text-gray-700 font-semibold">
            Unknown stream status: {status}
          </p>
        </div>
      );
    }

    return (
      <div className="w-full h-full object-cover">
        <img
          src={bannerImage ? bannerImage : toAbsoluteUrl("/media/images/2600x1600/iq_educators.jpg")}
          alt="Banner Image"
          className="w-full h-full rounded-xl object-cover"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 chatbox_chat">
        <div className={`${isFullScreen ? isMdUp ? "col-span-10 xl:col-span-11" : "col-span-12 md:col-span-7 xl:col-span-10" : isMdUp ? "col-span-12 md:col-span-7 xl:col-span-8" : "col-span-12 md:col-span-7 xl:col-span-11"} space-y-8`}>
          <div className={`transition-all duration-300 ease-in-out h-full`}>
            <div className="grid gap-5 h-full">
              <div className="flex flex-col rounded-lg items-center justify-start text-white h-full">
                <div className="flex flex-col gap-12 bg-black rounded-xl text-center w-full h-full">
                  {renderLiveStatus(status, custom, <ClientLiveSessionPlayer call={call} callId={callId} client={client} />)}
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className={`${isFullScreen ? isMdUp ? "col-span-2 xl:col-span-1" : "col-span-12 md:col-span-5 xl:col-span-2" : isMdUp ? "col-span-12 md:col-span-5 xl:col-span-4" : "col-span-12 md:col-span-5 xl:col-span-1"} space-y-8`}>
            <div className={`transition-all duration-300 ease-in-out h-full`}>
              {token && callId && <ChatContainer sessionToken={token} callId={callId} />}
            </div>
          </div>
      </div>
  );
};

// Main wrapper component that doesn't use Stream Video hooks
const ClientLiveSessionWrapper = ({ client, callId, token, bannerImage }) => {
  return <ClientLiveSessionContent client={client} callId={callId} token={token} bannerImage={bannerImage} />;
};

export default ClientLiveSessionWrapper