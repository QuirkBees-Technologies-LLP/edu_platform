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

  const handleDmMessages = (event) => {
    if (event.channel_type !== "messaging") return;
    setDmUnread(true);
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!apiKey || !userId || !userToken || !callId) {
          console.error("Missing API key, User ID, Token, or Call ID.");
          return;
        }

        const client = StreamChat.getInstance(apiKey);

        if (!client.userID || client.userID !== userId) {
          await client.connectUser(
            {
              id: userId,
              name: userName,
              image: `https://getstream.io/random_svg/?name=${userName}`,
              // title: userId === 'daddy' ? 'Admin' : getRandomTitle(),
            },
            userToken
          );
        }

        const channel = client.channel("livestream", callId, {
          name: "Global Stream Chat",
        });

        try {
          await channel.create();
        } catch (err) {
          if (err.message?.includes("already exists")) {
            console.log("Channel already exists.");
          } else {
            throw err;
          }
        }

        await channel.watch({ watchers: { limit: 100 } });

        client.on("message.new", handleDmMessages);
        client.on("notification.message_new", handleDmMessages);

        setChatClient(client);
        setCurrentChannel(channel);
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    if (!chatClient) {
      initChat();
    }
    //  else {
    //   switchChannel(chatType, eventName);
    // }
  }, [apiKey, userId, userToken, callId, chatType, eventName]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!currentChannel?.id || !event.channel_id) return;
      if (currentChannel.id !== event.channel_id) {
        setUnreadStatus(event.channel_id, true);
      }
    };

    if (chatClient && currentChannel) {
      chatClient.on("message.new", handleMessage);
    }

    return () => {
      chatClient?.off("message.new", handleMessage);
    };
  }, [chatClient, currentChannel]);

  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
      setChatClient(null);
      setCurrentChannel(null);
    };
  }, []);

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
    if (eventUnread && (chatType === "main-event" || chatType === "room")) {
      setEventUnread(false);
    }
  }, [chatType, eventUnread]);

  return {
    chatClient,
    currentChannel,
    dmUnread,
    globalUnread,
    eventUnread,
    qaUnread,
  };
};
