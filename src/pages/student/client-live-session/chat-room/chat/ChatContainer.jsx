import React, { useEffect, useState } from "react";
import { Channel as StreamChannel } from "stream-chat";
import { Channel, Chat } from "stream-chat-react";
import { useEventContext } from "../context/EventContext";
import { useInitChat } from "../hooks/useInitChat";
import { MessageUI } from "./MessageUI";
import { GiphyPreview } from "./GiphyPreview";
import { ChannelInner } from "./ChannelInner";
import { useGetClientTokenMutation } from "../../../../../store/api/client/clientLiveSessionApiSlice";
import { useLocation, useParams } from "react-router";
import { useAuthContext } from "../../../../../auth/useAuthContext";
import { MessageInputUI } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { ChatSidebar } from "./ChatSidebar";

const   ChatContainer = ({ sessionToken, callId }) => {
  const {
    actionsModalOpen,
    isFullScreen,
    searching,
    setSearching,
    showChannelList,
    userActionType,
    setIsFullScreen,
  } = useEventContext();

  const [dmChannel, setDmChannel] = useState(null);
  const [messageActionUser, setMessageActionUser] = useState(null);
  const [participantProfile, setParticipantProfile] = useState(null);
  const [snackbar, setSnackbar] = useState(false);

  const location = useLocation();
  const sessionData = location.state;
  // const { callId } = useParams(); // Get callId from URL
  // const { address: rtmp_url, token: rtmp_stream_key } = sessionData;
  // const token = rtmp_stream_key;
  const [call, setCall] = useState(null);
  const { auth } = useAuthContext();
  const userId = auth?.user?._id;
  const userName = auth?.user?.name
    ? auth?.user?.name
    : auth?.user?.first_name + " " + auth?.user?.last_name;

  const {
    chatClient,
    currentChannel,
    dmUnread,
    eventUnread,
    globalUnread,
    qaUnread,
  } = useInitChat({
    userId,
    userToken: sessionToken,
    callId,
    userName,
  });

  if (!chatClient) return null;

  return (
    <div className={`chat str-chat h-full`}>
      {isFullScreen && (
        <ChatSidebar
          isFullScreen={isFullScreen}
          dmUnread={dmUnread}
          eventUnread={eventUnread}
          globalUnread={globalUnread}
          qaUnread={qaUnread}
          setIsFullScreen={setIsFullScreen}
        />
      )}
      {!isFullScreen && (
        <div className={`chat-components ${isFullScreen ? "full-screen" : ""}`}>
          <Chat client={chatClient}>
            <ChatHeader
              dmUnread={dmUnread}
              eventUnread={eventUnread}
              globalUnread={globalUnread}
              qaUnread={qaUnread}
            />
            <Channel
              channel={currentChannel}
              // EmptyStateIndicator={<div>Empty</div>}
              GiphyPreviewMessage={GiphyPreview}
              Input={MessageInputUI}
              VirtualMessage={(props) => (
                <MessageUI
                  {...props}
                  setMessageActionUser={setMessageActionUser}
                />
              )}
            >
              <ChannelInner />
            </Channel>
          </Chat>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
