import {
  LivestreamPlayer,
  StreamCall,
  useCall,
  StreamTheme,
  StreamVideo,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Copy, PhoneOff, Podcast, RouteOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DefaultTooltip } from "@/components";
import LiveSessionPlayer from "./LiveSessionPlayer";
import {
  EventProvider,
  useEventContext,
} from "./chat-room/context/EventContext";
import ChatContainer from "./chat-room/chat/ChatContainer";
import UpdateLiveSession from "./UpdateLiveSession";
import { useResponsive } from "../../../hooks";
import Recording from "./Recording";

const StreamClient = ({
  client,
  callId,
  sessionToken,
  token,
  rtmp_stream_key,
  rtmp_url,
  setIsTooltipOpen,
  isTooltipOpen,
  id,
  checkLastRecurrence,
  isRecurent,
}) => {
  const call = useCall();

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  const isMdUp = useResponsive("up", "md"); // matches Tailwind's md: 768px+

  const { isFullScreen } = useEventContext();

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

  const isLive = !!call?.state?.startedAt && !call?.state?.endedAt;

  const maskAndTruncateText = (text, maxLength = 50) => {
    if (typeof text !== "string") return ""; // undefined या null safe
    const masked = "•".repeat(text.length);
    return masked.length > maxLength
      ? masked.substring(0, maxLength) + "..."
      : masked;
  };

  return (
    <div className="container-fluid">
      <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 educator_chatbox_chat mb-8">
        <div
          className={`${isFullScreen ? (isMdUp ? "col-span-10 xl:col-span-11" : "col-span-12 md:col-span-7 xl:col-span-10") : isMdUp ? "col-span-12 md:col-span-7 xl:col-span-8" : "col-span-12 md:col-span-7 xl:col-span-11"} space-y-8`}
        >
          <div className="grid gap-5 h-full">
            <div className="flex flex-col rounded-lg items-center justify-start text-white h-full">
              <div className="live-stream-videos flex flex-col justify-center gap-12 bg-black rounded-xl text-center pb-6 w-full h-full">
                <StreamTheme
                  style={{ fontFamily: "sans-serif", color: "white" }}
                >
                  {client && call && (
                    <StreamVideo client={client}>
                      <StreamCall
                        initialDeviceSettings={{ mic: false, camera: false }}
                        call={call}
                      >
                        <LiveSessionPlayer
                          client={client}
                          callId={callId}
                          call={call}
                          token={token}
                          rtmp_stream_key={rtmp_stream_key}
                          rtmp_url={rtmp_url}
                          setIsTooltipOpen={setIsTooltipOpen}
                          isTooltipOpen={isTooltipOpen}
                          id={id}
                          checkLastRecurrence={checkLastRecurrence}
                          isRecurent={isRecurent}
                        />
                      </StreamCall>
                    </StreamVideo>
                  )}
                </StreamTheme>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${isFullScreen ? (isMdUp ? "col-span-2 xl:col-span-1" : "col-span-12 md:col-span-5 xl:col-span-2") : isMdUp ? "col-span-12 md:col-span-5 xl:col-span-4" : "col-span-12 md:col-span-5 xl:col-span-1"} space-y-8`}
        >
          <ChatContainer sessionToken={sessionToken} />
          {/* <div>
                        <Recording />
                    </div> */}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-y-8 md:gap-x-8 educator_chatbox_chat">
        <div className="col-span-12 md:col-span-7">
          <div className="card border-2 mb-8">
            <div className="card-body py-7">
              <div className="flex flex-col gap-4">
                <div className="grid gap-5 px-0">
                  <UpdateLiveSession />
                </div>
              </div>
            </div>
          </div>
          <div>
            <Recording />
          </div>
        </div>
        <div className="col-span-12 md:col-span-5 mb-5">
          <div className="card border-2">
            <div className="card-body py-7 px-5">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-12 gap-5 items-center">
                  <label className="col-span-3 text-sm text-gray-900 font-semibold line-clamp-2">
                    IQ Academy ID
                  </label>
                  <div className="col-span-9 ">
                    <DefaultTooltip
                      title="Copied to clipboard!"
                      open={isTooltipOpen?.callId}
                      placement="bottom"
                      className="max-w-48"
                    >
                      <p
                        onClick={() => handleCopy(callId, "callId")}
                        className="cursor-pointer rounded-full border-2 flex items-center justify-between gap-4 text-xs text-gray-700 font-semibold break-all p-3"
                      >
                        {callId}
                        <Copy size={16} className="shrink-0" />
                      </p>
                    </DefaultTooltip>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-5 items-center">
                  <label className="col-span-3 text-sm text-gray-900 font-semibold line-clamp-2">
                    RTMP URL
                  </label>
                  <div className="col-span-9">
                    <DefaultTooltip
                      title="Copied to clipboard!"
                      open={isTooltipOpen?.rtmp_url}
                      placement="bottom"
                      className="max-w-48"
                    >
                      <p
                        onClick={() => handleCopy(rtmp_url, "rtmp_url")}
                        className="cursor-pointer rounded-lg border-2 flex items-center justify-between gap-4 text-xs text-gray-700 font-semibold break-all p-3"
                      >
                        {maskAndTruncateText(rtmp_url, 100)}
                        <Copy size={16} className="shrink-0" />
                      </p>
                    </DefaultTooltip>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-5 items-center">
                  <label className="col-span-3 text-sm text-gray-900 font-semibold line-clamp-2">
                    RTMP Stream Key
                  </label>
                  <div className="col-span-9">
                    <DefaultTooltip
                      title="Copied to clipboard!"
                      open={isTooltipOpen?.rtmp_stream_key}
                      placement="bottom"
                      className="max-w-48"
                    >
                      <p
                        onClick={() =>
                          handleCopy(rtmp_stream_key, "rtmp_stream_key")
                        }
                        className="cursor-pointer rounded-lg border-2 flex items-center justify-between gap-4 text-xs text-gray-700 font-semibold break-all p-3"
                      >
                        {maskAndTruncateText(rtmp_stream_key, 140)}
                        <Copy size={16} className="shrink-0" />
                      </p>
                    </DefaultTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamClient;
