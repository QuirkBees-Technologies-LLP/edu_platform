import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useCheckList } from "./useCheckList";
import { getRandomTitle } from "../chat/utils";
import { useEventContext } from "../context/EventContext";

const urlParams = new URLSearchParams(window.location.search);
const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;
const targetOrigin = urlParams.get("targetOrigin");

export const useInitChat = ({ userId, userToken, callId, userName }) => {
  const [chatClient, setChatClient] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [dmUnread, setDmUnread] = useState(false);
  const [eventUnread, setEventUnread] = useState(false);
  const [globalUnread, setGlobalUnread] = useState(false);
  const [qaUnread, setQaUnread] = useState(false);

  const { chatType, eventName } = useEventContext();
  useCheckList({ chatClient, targetOrigin });

  useEffect(() => {
    if (globalUnread && chatType === "global-ve2") setGlobalUnread(false);
  }, [chatType, globalUnread]);

  useEffect(() => {
    if (qaUnread && chatType === "qa") setQaUnread(false);
  }, [chatType, qaUnread]);

  useEffect(() => {
    if (dmUnread && chatType === "direct") setDmUnread(false);
  }, [chatType, dmUnread]);

  useEffect(() => {
    if (eventUnread && (chatType === "main-event" || chatType === "room"))
      setEventUnread(false);
  }, [chatType, eventUnread]);

  const setUnreadStatus = (id, value) => {
    switch (id) {
      case "global-ve2":
        setGlobalUnread(value);
        break;
      case "qa":
        setQaUnread(value);
        break;
      default:
        setEventUnread(value);
    }
  };

  const switchChannel = async (type, event) => {
    if (!chatClient || type === "direct") {
      setCurrentChannel(null);
      return;
    }

    const channelIsEvent = type === "main-event" || type === "room";
    const channelId = event && channelIsEvent ? `${type}-${event}` : type;
    const newChannel = chatClient.channel("livestream", channelId);

    await newChannel.watch({ watchers: { limit: 100 } });

    setUnreadStatus(channelId, false);
    // setCurrentChannel(newChannel);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (!currentChannel?.id || !event.channel_id) return;
      if (currentChannel.id !== event.channel_id)
        setUnreadStatus(event.channel_id, true);
    };

    if (chatClient && currentChannel) {
      chatClient.on("message.new", handleMessage);
    }

    return () => chatClient?.off("message.new", handleMessage);
  }, [chatClient, currentChannel]);

  const handleDmMessages = (event) => {
    if (event.channel_type !== "messaging") return;
    setDmUnread(true);
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!apiKey || !userId || !userToken) {
          console.error("Missing API key, User ID, or Token.");
          return;
        }

        const client = StreamChat.getInstance(apiKey);

        if (!client) {
          console.error("Failed to initialize StreamChat client.");
          return;
        }

        if (client.wsConnection && client.wsConnection.isHealthy) {
          setChatClient(client);
          // return;
        }

        await client.connectUser(
          {
            id: userId,
            name: userName,
            image: `https://getstream.io/random_svg/?name=${userName}`,
            // title: userId === 'daddy' ? 'Admin' : getRandomTitle(),
          },
          userToken
        );

        // 🔥 Create a unique chat per IQ Academy
        const uniqueChannelId = `livestream-${eventName || "default"}`; // Unique per event

        const globalChannel = client.channel("livestream", callId, {
          name: "Global",
        });

        await globalChannel.create(); // Ensure the channel exists
        await globalChannel.watch({ watchers: { limit: 100 } });

        client.on("message.new", handleDmMessages);
        client.on("notification.message_new", handleDmMessages);

        setChatClient(client);
        setCurrentChannel(globalChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (!chatClient) {
      initChat();
    } else {
      switchChannel(chatType, eventName);
    }
  }, [chatType, eventName, userToken, apiKey, userId]);

  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
      setChatClient(null);
      setCurrentChannel(null);
    };
  }, []);

  return {
    chatClient,
    currentChannel,
    dmUnread,
    globalUnread,
    eventUnread,
    qaUnread,
  };
};
