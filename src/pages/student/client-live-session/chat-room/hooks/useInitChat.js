import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useCheckList } from "./useCheckList";
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

  const { chatType } = useEventContext();
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
    let cancelled = false;

    const initChat = async () => {
      try {
        if (!apiKey || !userId || !userToken || !callId) {
          return;
        }

        const client = StreamChat.getInstance(apiKey);

        if (!client.userID || client.userID !== userId) {
          await client.connectUser(
            {
              id: userId,
              name: userName,
              image: `https://getstream.io/random_svg/?name=${userName}`,
            },
            userToken
          );
        }

        if (cancelled) return;

        // Same channel the educator watches: livestream + this call id.
        // create() throws once the educator has already opened it, and that
        // used to skip watch(), so later educator messages never arrived.
        const globalChannel = client.channel("livestream", callId, {
          name: "Global",
        });

        try {
          await globalChannel.create();
        } catch {
          // The channel already exists. watch() still subscribes to new messages.
        }

        await globalChannel.watch({
          watchers: { limit: 100 },
          messages: { limit: 100 },
        });

        if (cancelled) return;

        client.on("message.new", handleDmMessages);
        client.on("notification.message_new", handleDmMessages);

        setChatClient(client);
        setCurrentChannel(globalChannel);
      } catch (error) {
        if (!cancelled) console.error("Error initializing chat:", error);
      }
    };

    initChat();
    return () => {
      cancelled = true;
    };
  }, [userToken, apiKey, userId, callId, userName]);

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
