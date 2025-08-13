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
import { Send } from 'lucide-react'

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
          {token && callId && status === 'live' && <ChatContainer sessionToken={token} callId={callId} />}
          {token && callId && status !== "live" && <div className="card rounded-2xl shadow-md overflow-hidden h-full flex flex-col chatbox_chat">
            <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-white font-semibold text-sm">Chatbox</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
              <div className="flex flex-col gap-2 h-full justify-center items-center">
                <div className="text-sm text-gray-900 font-medium text-center">
                  Stream is not live yet.
                </div>
              </div>
            </div>
            <form className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Your comment..."
                    className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-xs dark:bg-gray-100"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 duration-200 focus:outline-none"
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </form>
          </div>}
        </div>
      </div>
    </div>
  );
};

// Main wrapper component that doesn't use Stream Video hooks
const ClientLiveSessionWrapper = ({ client, callId, token, bannerImage }) => {
  return <ClientLiveSessionContent client={client} callId={callId} token={token} bannerImage={bannerImage} />;
};

export default ClientLiveSessionWrapper;