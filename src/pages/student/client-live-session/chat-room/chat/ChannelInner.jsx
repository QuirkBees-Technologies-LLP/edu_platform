import React from 'react';
import { MessageInput, VirtualizedMessageList, Window } from 'stream-chat-react';
import { useOverrideSubmit } from '../hooks/useOverrideSubmit';



export const ChannelInner = () => {
  const overrideSubmitHandler = useOverrideSubmit();

  return (
    <>
      <Window>
        <VirtualizedMessageList
          additionalVirtuosoProps={{ alignToBottom: true }}
          hideDeletedMessages
          separateGiphyPreview
        />
        <MessageInput maxRows={2} grow overrideSubmitHandler={overrideSubmitHandler} />
      </Window>
    </>
  );
};
