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


const ClientLiveSessionWrapper = ({ client, callId, token }) => {
  const [showFull, setShowFull] = useState(false);
  // Truncated content
  const isMdUp = useResponsive('up', 'md'); // matches Tailwind's md: 768px+
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

  const { title, description, tags } = custom;
  const maxLength = 150

  const truncatedContent = truncate(description, maxLength, { keepImageTag: false });

  const {
    isFullScreen,
  } = useEventContext();

  // Handler for toggling
  const handleToggle = (e) => {
    e.preventDefault();
    setShowFull(!showFull);
  };

  if (status === 'ended') {
    return (
      <div className="live_center w-full">
        <p className="text-center font-bold text-xl text-gray-900">Stream Ended</p>
        <div class="loading-bar">
          <div class="yellow-bar"></div>
        </div>
        <p className="text-center text-lg pt-10 px-2 text-gray-800">
          The live session has concluded.
        </p>
      </div>
    )
  }

  if (status === 'not-started') {
    return (
      <div className="live_center w-full">
        <p className="text-center font-bold text-xl text-gray-900">Stream Not Started</p>
        <div class="loading-bar">
          <div class="yellow-bar"></div>
        </div>
        <p className="text-center text-lg pt-10 px-2 text-gray-800">
          The host has not begun the stream yet.
        </p>
      </div>
    )
  }


  if (status === 'upcoming') {
    return (
      <div className="live_center w-full">
        <p className="text-center font-bold text-xl text-gray-900">Live Session is Upcoming</p>
        <div class="loading-bar">
          <div class="yellow-bar"></div>
        </div>
        <p className="text-center text-lg pt-10 px-2 text-gray-800">
          The event will start on{" "}
          {custom.datetime
            ? format(new Date(custom.datetime), "MMM dd, yyyy, hh:mm a")
            : "a future date"}
        </p>
      </div>
    )
  }

  return (
    <div className='container-fluid'>
      <div className='flex justify-between flex-col md:flex-row'>
        <div className={`${isFullScreen ? isMdUp ? "w-[90%]" : "w-[100%]" : isMdUp ? "w-[63%]" : "w-[100%]"} transition-all duration-300 ease-in-out`}>
          <div className="grid gap-5">
            <div className="flex flex-col rounded-lg items-center justify-start text-white ">
              <div className="flex flex-col gap-12 bg-black rounded-xl text-center w-full">
                <ClientLiveSessionPlayer call={call} callId={callId} client={client} />
              </div>
            </div>
            <div className='stream_content flex flex-col gap-5'>
              <p className='text-lg font-semibold text-gray-800'>{title}</p>
              <div className="flex items-center">
                <img
                  src={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                  className="rounded-full size-9 me-2"
                  alt=""
                />
                <div>
                  <Link
                    to="/public-profile/profiles/nft"
                    className="text-md font-semibold text-gray-800 hover:text-primary mb-px"
                  >
                    Cody Fisher
                  </Link>
                </div>
              </div>
              <div className="card bg-light">
                <div className="card-body p-5">
                  {/* <p className='text-sm font-semibold text-gray-800'>
                    {description}
                  </p> */}
                  <div>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: showFull ? description : truncatedContent,
                      }}
                      className="text-sm font-semibold text-gray-800"
                    />
                    {description.length > maxLength && (
                      <span
                        onClick={handleToggle}
                        className="text-md font-semibold text-primary cursor-pointer"
                      >
                        {showFull ? ' Show Less' : 'Show More'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 my-3">
                    {tags?.map((tag, ind) => {
                      return (
                        <span key={ind} class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">{tag}</span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="recent_live">
              <p className='text-lg font-semibold text-gray-800 mb-3'>Recorded Live</p>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <a href="">
                    <div className="video-library overflow-hidden h-auto relative dark:">
                      <img
                        src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                        className="w-full h-48 rounded-xl"
                        alt=""
                      />
                      <div className="video-details absolute bottom-0 p-4">
                        <div class="flex items-center justify-between pt-2">
                          <a href="#" class=" bg-black text-white p-1 justify-center rounded-sm text-xs">{0 || 0} Viewers</a>
                        </div>
                      </div>
                      <div className="live absolute top-5 left-5">
                        <a href="#" class=" bg-red-700 text-white pl-1 pr-1 font-semibold bg-red justify-center rounded-sm text-sm">Live</a>
                      </div>

                    </div>
                    <div className="session-details flex items-start gap-3 w-100 mt-3">
                      <div className="session-icon shrink-0">
                        <img
                          src={toAbsoluteUrl(`/media/avatars/300-2.png`)}
                          className="size-10 rounded-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="session-content">
                        <h5 class="text-black text-md font-semibold">Dolores qui officia </h5>
                        <h6 class="text-black text-sm text-gray-700 hover:text-gray-900">Odio molestias ut et</h6>
                        <div className="flex gap-2 my-3">
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Capa</span>
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Espanol</span>
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
                <div className="col-span-6">
                  <a href="">
                    <div className="video-library overflow-hidden h-auto relative dark:">
                      <img
                        src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                        className="w-full h-48 rounded-xl"
                        alt=""
                      />
                      <div className="video-details absolute bottom-0 p-4">
                        <div class="flex items-center justify-between pt-2">
                          <a href="#" class=" bg-black text-white p-1 justify-center rounded-sm text-xs">{0 || 0} Viewers</a>
                        </div>
                      </div>
                      <div className="live absolute top-5 left-5">
                        <a href="#" class=" bg-red-700 text-white pl-1 pr-1 font-semibold bg-red justify-center rounded-sm text-sm">Live</a>
                      </div>

                    </div>
                    <div className="session-details flex items-start gap-3 w-100 mt-3">
                      <div className="session-icon shrink-0">
                        <img
                          src={toAbsoluteUrl(`/media/avatars/300-2.png`)}
                          className="size-10 rounded-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="session-content">
                        <h5 class="text-black text-md font-semibold">Dolores qui officia </h5>
                        <h6 class="text-black text-sm text-gray-700 hover:text-gray-900">Odio molestias ut et</h6>
                        {/* <div className="session-type flex flex-wrap gap-2 my-1">
                              <a href="#" class="text-sm">Cibergun</a>
                              <a href="#" class="text-sm">Minecraft</a>
                          </div> */}
                        <div className="flex gap-2 my-3">
                          {/* <button class="btn btn-sm  bg-gray-400 rounded-full w-3xs p-2 justify-center text-xs">English</button> */}
                          {/* <button class="btn btn-sm  bg-gray-400 rounded-full w-3xs p-2 justify-center text-xs">English</button> */}

                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Capa</span>
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Espanol</span>
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                          <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`${isFullScreen ? isMdUp ? "w-[8.3333%]" : "w-[100%]" : isMdUp ? "w-[35%]" : "w-[100%]"} transition-all duration-300 ease-in-out`}>
          {token && <ChatContainer sessionToken={token} />}
        </div>
      </div>
    </div>
  )
}

export default ClientLiveSessionWrapper