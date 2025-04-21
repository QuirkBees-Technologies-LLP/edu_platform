import { LivestreamPlayer, StreamCall, useCall, StreamTheme, StreamVideo, useCallStateHooks } from '@stream-io/video-react-sdk'
import { Copy, PhoneOff, Podcast, RouteOff } from 'lucide-react'
import React, { useEffect, useState } from 'react';
import { DefaultTooltip } from '@/components';
import LiveSessionPlayer from './LiveSessionPlayer';
import { EventProvider, useEventContext } from './chat-room/context/EventContext';
import ChatContainer from './chat-room/chat/ChatContainer';
import UpdateLiveSession from './UpdateLiveSession';
import { useResponsive } from '../../../hooks';


const StreamClient = ({ client, callId, sessionToken, token, rtmp_stream_key, rtmp_url, setIsTooltipOpen, isTooltipOpen }) => {
    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    };
    const isMdUp = useResponsive('up', 'md'); // matches Tailwind's md: 768px+

    const {
        isFullScreen,
    } = useEventContext();

    const handleCopy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsTooltipOpen(prevState => ({
                ...prevState,
                [key]: true
            }));

            setTimeout(() => {
                setIsTooltipOpen(prevState => ({
                    ...prevState,
                    [key]: false
                }));
            }, 1000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    const call = useCall();
    const isLive = !!call?.state?.startedAt && !call?.state?.endedAt;
    console.log(isLive, "isLive123");
    console.log("call123", call);

    return (
        <div className='container-fluid'>
            <div className='flex justify-between flex-col md:flex-row'>
                <div className={`${isFullScreen ? isMdUp ? "w-[90%]" : "w-[100%]" : isMdUp ? "w-[63%]" : "w-[100%]"} transition-all duration-300 ease-in-out`}>
                    <div className="grid gap-5">
                        <div className="flex flex-col rounded-lg items-center justify-start text-white ">
                            <div className="flex flex-col gap-12 bg-black rounded-xl text-center pb-6 w-full">
                                <StreamTheme style={{ fontFamily: "sans-serif", color: "white" }}>
                                    {client && call && (
                                        <StreamVideo client={client}>
                                            <StreamCall initialDeviceSettings={{ mic: false, camera: false }} call={call}>
                                                <LiveSessionPlayer client={client} callId={callId}

                                                    call={call} token={token} rtmp_stream_key={rtmp_stream_key} rtmp_url={rtmp_url} setIsTooltipOpen={setIsTooltipOpen} isTooltipOpen={isTooltipOpen}

                                                />
                                            </StreamCall>
                                        </StreamVideo>
                                    )}
                                </StreamTheme>
                            </div>
                        </div>
                        <div className="card border-2">
                            <div className="card-body py-7">
                                <div className="flex flex-col gap-4">
                                    <div className="grid gap-5 px-0">
                                        <UpdateLiveSession  />
                                    </div>
                                </div>
                            </div>
                        </div>
                            <div className="card border-2 mb-5">
                                <div className="card-body py-7">
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-12 gap-5 items-center">
                                            <label className="col-span-3 text-md text-gray-900 font-semibold">Livestream ID</label>
                                            <div className='col-span-9 '>
                                                <DefaultTooltip title="Copied to clipboard!" open={isTooltipOpen?.callId} placement="bottom" className="max-w-48">
                                                    <p onClick={() => handleCopy(callId, "callId")} className="cursor-pointer rounded-full border-2 flex items-center justify-between gap-4 text-xs text-gray-700 font-semibold break-all p-3">
                                                        {callId}
                                                        <Copy size={16} className='shrink-0' />
                                                    </p>
                                                </DefaultTooltip>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 gap-5 items-center">
                                            <label className="col-span-3 text-md text-gray-900 font-semibold">RTMP URL</label>
                                            <div className='col-span-9'>
                                                <DefaultTooltip title="Copied to clipboard!" open={isTooltipOpen?.rtmp_url} placement="bottom" className="max-w-48">
                                                    <p onClick={() => handleCopy(rtmp_url, "rtmp_url")} className="cursor-pointer rounded-lg border-2 flex items-center justify-between gap-4 text-xs text-gray-700 font-semibold break-all p-3">
                                                        {truncateText(rtmp_url, 100)}<Copy size={16} className='shrink-0' />
                                                    </p>
                                                </DefaultTooltip>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-5 items-center">
                                            <label className="col-span-3 text-md text-gray-900 font-semibold">RTMP Stream Key</label>
                                            <div className='col-span-9'>
                                                <DefaultTooltip title="Copied to clipboard!" open={isTooltipOpen?.rtmp_stream_key} placement="bottom" className="max-w-48">
                                                    <p onClick={() => handleCopy(rtmp_stream_key, "rtmp_stream_key")} className="cursor-pointer rounded-lg border-2 flex items-center justify-between gap-4 text-xs text-gray-700 font-semibold break-all p-3">
                                                        {truncateText(rtmp_stream_key, 100)}<Copy size={16} className='shrink-0' />
                                                    </p>
                                                </DefaultTooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
                <div className={`${isFullScreen ? isMdUp ? "w-[8.3333%]" : "w-[100%]" : isMdUp ? "w-[35%]" : "w-[100%]"} transition-all duration-300 ease-in-out`}>
                    <ChatContainer sessionToken={sessionToken} />
                </div>
            </div>
        </div>
    )
}

export default StreamClient