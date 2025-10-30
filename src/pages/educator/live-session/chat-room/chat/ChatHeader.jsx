import React, { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useEventContext } from "../context/EventContext";
import {
  ArrowBigLeft,
  ArrowBigRight,
  MessageCircle,
  UserRound,
} from "lucide-react";

export const ChatHeader = ({
  dmUnread,
  eventUnread,
  globalUnread,
  qaUnread,
}) => {
  const {
    chatType,
    eventName,
    selected,
    setChatType,
    setShowChannelList,
    isFullScreen,
    setIsFullScreen,
  } = useEventContext();

  const handleGlobalClick = useCallback(() => {
    setChatType("global-ve2");
    setShowChannelList(false);
  }, [setChatType, setShowChannelList]);

  const handleEventClick = useCallback(() => {
    const eventType = selected === "main-event" ? "main-event" : "room";
    setChatType(eventType);
    setShowChannelList(false);
  }, [selected, setChatType, setShowChannelList]);

  const handleDirectClick = useCallback(() => {
    setChatType("direct");
    setShowChannelList(true);
  }, [setChatType, setShowChannelList]);

  const handleQAClick = useCallback(() => {
    setChatType("qa");
    setShowChannelList(false);
  }, [setChatType, setShowChannelList]);

  return (
    <>
      {!isFullScreen && (
        <div className="chat-components-header p-2 border border-b-0">
          <div className="chat-components-header-top flex justify-between align-center">
            <button
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="btn btn-xs btn-icon btn-primary btn-outline "
            >
              <ArrowBigRight size={18} />
            </button>
            <div className="flex gap-3 items-center">
              <button className="btn btn-xs btn-primary btn-outline">
                <MessageCircle size={16} />
                Chat
              </button>
              <button className="btn btn-xs btn-primary btn-outline">
                <UserRound size={16} />2
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
