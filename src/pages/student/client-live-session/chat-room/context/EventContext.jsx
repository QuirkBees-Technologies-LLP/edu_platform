import React, { createContext, useContext, useState } from "react";
import { useTheme } from "../hooks/useTheme";

const EventContext = createContext({});

export const EventProvider = ({ children }) => {
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [chatType, setChatType] = useState("global-ve2");
  const [eventName, setEventName] = useState(undefined);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState("main-event");
  const [showChannelList, setShowChannelList] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [userActionType, setUserActionType] = useState(undefined);
  const [videoOpen, setVideoOpen] = useState(true);

  const { setMode, setTheme, mode } = useTheme();

  const value = {
    actionsModalOpen,
    chatType,
    eventName,
    isFullScreen,
    searching,
    selected,
    setActionsModalOpen,
    setChatType,
    setEventName,
    setIsFullScreen,
    setMode,
    setSearching,
    setSelected,
    setTheme,
    showChannelList,
    setShowChannelList,
    setThemeModalOpen,
    setUserActionType,
    setVideoOpen,
    themeModalOpen,
    userActionType,
    videoOpen,
    mode,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = () => useContext(EventContext);
