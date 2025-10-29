import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Attachment,
  Avatar,
  isDate,
  MessageRepliesCountButton,
  SimpleReactionsList,
  useChannelActionContext,
  useChannelStateContext,
  useChatContext,
  useMessageContext,
} from "stream-chat-react";

import { customReactions, getFormattedTime } from "./utils";
import { useEventContext } from "../context/EventContext";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import { useBoolState } from "../hooks/useBoolState";

const MessageOptions = ({
  dropdownOpen,
  isRecentMessage,
  isTopMessage,
  setDropdownOpen,
  setMessageActionUser,
  setShowReactionSelector,
  showReactionSelector,
}) => {
  const { thread } = useChannelStateContext();
  const { handleOpenThread, isMyMessage, message } = useMessageContext();

  const hideActions =
    (thread && isMyMessage()) || (!thread && message.show_in_channel);

  const { toggle: toggleOpenDropdown, off: closeDropdown } = useBoolState({
    setState: setDropdownOpen,
  });
  const { toggle: toggleOpenReactionSelector, off: closeReactionSelector } =
    useBoolState({
      setState: setShowReactionSelector,
    });

  const [selectorRoot, setSelectorRoot] = useState(null);
  const [reactButton, setReactButton] = useState(null);
  useOnClickOutside({
    targets: [selectorRoot, reactButton],
    onClickOutside: closeReactionSelector,
  });

  return (
    <div className="message-ui-options">
      {/* <span onClick={toggleOpenReactionSelector} ref={setReactButton}>
        <ReactionSmiley />
      </span> */}
      {showReactionSelector && (
        <ReactionSelector
          isTopMessage={isTopMessage}
          closeReactionSelector={closeReactionSelector}
          ref={setSelectorRoot}
        />
      )}
    </div>
  );
};

const ReactionSelector = React.forwardRef(
  ({ isTopMessage, closeReactionSelector }, ref) => {
    const { handleReaction } = useMessageContext();

    return (
      <div
        className={`message-ui-reaction-selector ${isTopMessage ? "top" : ""}`}
        ref={ref}
      >
        {customReactions.map(({ Component, type }) => (
          <div key={type} onClick={(event) => handleReaction(type, event)}>
            <Component />
          </div>
        ))}
      </div>
    );
  }
);

const UpvoteButton = () => {
  const { client } = useChatContext();
  const { message } = useMessageContext();

  const userUpVoted =
    client.userID && message.up_votes?.includes(client.userID);

  const handleClick = useCallback(
    async (event) => {
      event.stopPropagation();

      const mentionIDs = message.mentioned_users?.map(({ id }) => id);
      let updatedUpVotes;

      if (!message.up_votes) {
        return await client.updateMessage({
          ...message,
          mentioned_users: mentionIDs,
          up_votes: [client.userID],
        });
      } else if (client.userID && message.up_votes.includes(client.userID)) {
        updatedUpVotes = message.up_votes.filter(
          (userID) => userID !== client.userID
        );
      } else {
        updatedUpVotes = [...message.up_votes, client.userID];
      }

      return await client.updateMessage({
        ...message,
        mentioned_users: mentionIDs,
        up_votes: updatedUpVotes,
      });
    },
    [client, message]
  );

  return (
    <div
      className={`message-ui-upvote-button ${userUpVoted ? "up-voted" : ""}`}
      onClick={handleClick}
    >
      <div className="message-ui-upvote-button-text">
        {message.up_votes?.length || 0}
      </div>
    </div>
  );
};

const OpenInThreadButton = (props) => (
  <div className="str-chat__message-replies-count-button-wrapper">
    <button
      className="str-chat__message-replies-count-button"
      data-testid="replies-count-button"
      {...props}
    >
      Show in thread
    </button>
  </div>
);

const searchRequestLock = Promise.resolve();

const OpenThreadButton = () => {
  const { openThread } = useChannelActionContext();
  const { channel, thread } = useChannelStateContext();
  const { handleOpenThread, message } = useMessageContext();
  const [threadParent, setThreadParent] = useState();

  const customOpenThread = useCallback(
    (event) => {
      return threadParent
        ? openThread(threadParent, event)
        : handleOpenThread(event);
    },
    [threadParent, openThread, handleOpenThread]
  );

  useEffect(() => {
    const getMessage = async () => {
      if (threadParent || (thread && message.type === "reply")) return;

      try {
        const { results } = await channel.search({
          id: { $eq: message.parent_id || "" },
        });
        const foundMessage = results[0]?.message;

        if (foundMessage) {
          setThreadParent(foundMessage);
        }
      } catch (err) {
        console.log(err);
      }
    };
    let execute = true;
    if (message.show_in_channel) {
      searchRequestLock.then(() => {
        if (execute) getMessage();
      });
    }

    return () => {
      execute = false;
    };
  }, []); // eslint-disable-line

  if (!(message.reply_count || message.show_in_channel)) return null;

  return message.show_in_channel ? (
    <OpenInThreadButton onClick={customOpenThread} />
  ) : (
    <MessageRepliesCountButton
      onClick={customOpenThread}
      reply_count={message.reply_count}
    />
  );
};

export const MessageUI = ({ setMessageActionUser }) => {
  const { messages } = useChannelStateContext();
  const { chatType, themeModalOpen } = useEventContext();
  const { message } = useMessageContext();
  const messageRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReactionSelector, setShowReactionSelector] = useState(false);

  const clearModals = useCallback(() => {
    setDropdownOpen(false);
    setShowOptions(false);
    setShowReactionSelector(false);
  }, []);

  const getTimeSinceMessage = useCallback(() => {
    if (!message.created_at) return null;

    const secondsSinceLastMessage = isDate(message.created_at)
      ? (Date.now() - message.created_at.getTime()) / 1000
      : 0;

    return getFormattedTime(secondsSinceLastMessage);
  }, [message]);

  const isRecentMessage = messages?.[messages.length - 1].id === message.id;

  useEffect(() => {
    if (isRecentMessage && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // 👈 ye important hai
        inline: "nearest", // 👈 page scroll nahi hoga, sirf container ke andar hoga
      });
    }
  }, [isRecentMessage, messages.length]);

  const isTopMessage = messages?.[0].id === message.id;

  const showTitle =
    message.user?.title === "Admin" || message.user?.title === "Moderator";

  const isQA = chatType === "qa";

  if (!message.user) return null;
  return (
    <div
      ref={messageRef}
      className={`message-ui p-4 ${themeModalOpen ? "theme-open" : ""}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={clearModals}
    >
      {showOptions && !isQA && (
        <MessageOptions
          dropdownOpen={dropdownOpen}
          isRecentMessage={isRecentMessage}
          setDropdownOpen={setDropdownOpen}
          isTopMessage={isTopMessage}
          setMessageActionUser={setMessageActionUser}
          setShowReactionSelector={setShowReactionSelector}
          showReactionSelector={showReactionSelector}
        />
      )}
      <Avatar
        className="size-10 avatar_img"
        image={message.user.image}
        name={message.user.name || message.user.id}
      />
      <div className="message-ui-content">
        <div className="message-ui-content-top">
          <div className="message-ui-content-top-name">
            {message.user.name || message.user.id}
          </div>
          {/* {showTitle && <div className='message-ui-content-top-title'>{message.user.title}</div>} */}
          <div className="message-ui-content-top-time">
            {getTimeSinceMessage()}
          </div>
        </div>
        <div className="message-ui-content-bottom">{message.text}</div>
        {!!message.attachments?.length && (
          <Attachment attachments={message.attachments} />
        )}
        <OpenThreadButton />
        <SimpleReactionsList reactionOptions={customReactions} />
      </div>
      {isQA && <UpvoteButton />}
    </div>
  );
};
